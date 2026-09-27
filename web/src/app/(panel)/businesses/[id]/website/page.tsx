import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { EMPTY_INTAKE, type SiteIntake } from '@/lib/site-factory/intake'
import { IntakeForm } from './intake-form'
import { BuildPanel } from './build-panel'

export const dynamic = 'force-dynamic'

export default async function WebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) notFound()

  const intake: SiteIntake = {
    ...EMPTY_INTAKE,
    ...((business.intakeJson as Partial<SiteIntake> | null) ?? {}),
    extras: { ...EMPTY_INTAKE.extras, ...((business.intakeJson as Partial<SiteIntake> | null)?.extras ?? {}) },
  }
  // Prefill contact fields from the business record when the intake is empty
  if (!intake.ownerName && business.ownerName) intake.ownerName = business.ownerName
  if (!intake.phone && business.ownerPhone) intake.phone = business.ownerPhone
  if (!intake.email && business.ownerEmail) intake.email = business.ownerEmail

  return (
    <div>
      <Link href={`/businesses/${business.id}`} className="text-sm text-slate-400 hover:text-slate-200">
        ← {business.name}
      </Link>
      <h1 className="mt-2 text-xl font-bold text-slate-100">Website factory</h1>
      <p className="mt-1 text-sm text-slate-400">
        Fill in the details, add photos, and the factory builds the website —
        AI-drafted with a guaranteed template fallback, then pushed to{' '}
        <span className="text-sky-400">{business.slug}.pykk.uk</span> automatically.
      </p>

      <BuildPanel
        businessId={business.id}
        slug={business.slug}
        initialStatus={business.websiteStatus}
        initialNote={business.websiteNote}
        hasIntake={business.intakeJson != null}
      />

      <IntakeForm businessId={business.id} businessType={business.type} initialIntake={intake} />
    </div>
  )
}
