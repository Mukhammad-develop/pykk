import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import path from 'node:path'
import fs from 'node:fs'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { originAllowed } from '@/lib/request'
import { sitesDir } from '@/lib/site-control'

export const dynamic = 'force-dynamic'

const MAX_FILES = 10
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

// Upload photos for the website gallery. Converted to WebP (max 1600px wide)
// and written into sites/{slug}/images/.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected a photo upload.' }, { status: 400 })
  }

  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length === 0) {
    return NextResponse.json({ error: 'No photos received.' }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `At most ${MAX_FILES} photos at a time.` }, { status: 400 })
  }

  const imagesDir = path.join(sitesDir(), business.slug, 'images')
  fs.mkdirSync(imagesDir, { recursive: true })

  const saved: string[] = []
  // Number after any photos already on disk (across requests).
  const existingCount = fs.readdirSync(imagesDir).filter((f) => /^img-\d+\.(webp|jpe?g)$/.test(f)).length
  let index = existingCount + 1

  // sharp is preferred (WebP output) but can't run on every host (old glibc).
  // Fallback: store the browser-shrunk JPEG as-is — always works.
  let sharp: typeof import('sharp') | null = null
  try {
    sharp = (await import('sharp')).default
    await sharp(Buffer.alloc(1, 0))
  } catch (error) {
    console.error('[pykk] sharp unavailable, falling back to JPEG passthrough:', (error as Error).message)
    sharp = null
  }

  try {
    for (const file of files) {
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json({ error: `"${file.name}" is not a JPG, PNG or WebP image.` }, { status: 400 })
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: `"${file.name}" is over 5 MB — shrink it first.` }, { status: 400 })
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const name = `img-${String(index).padStart(2, '0')}`
      index++
      if (sharp) {
        await sharp(buffer)
          .rotate() // respect EXIF orientation
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(path.join(imagesDir, `${name}.webp`))
        saved.push(`${name}.webp`)
      } else {
        fs.writeFileSync(path.join(imagesDir, `${name}.jpg`), buffer)
        saved.push(`${name}.jpg`)
      }
    }
  } catch (error) {
    console.error('[pykk] photo conversion failed:', error)
    return NextResponse.json(
      { error: `Photo conversion failed on the server: ${(error as Error).message.slice(0, 200)}` },
      { status: 500 },
    )
  }

  // Merge into the intake's photo list (keep existing, append new, dedupe).
  const intake = (business.intakeJson as { photos?: string[] } | null) ?? {}
  const photos = [...new Set([...(intake.photos ?? []), ...saved])]
  await db
    .update(businesses)
    .set({ intakeJson: { ...intake, photos } })
    .where(eq(businesses.id, business.id))

  return NextResponse.json({ ok: true, saved, photos })
}
