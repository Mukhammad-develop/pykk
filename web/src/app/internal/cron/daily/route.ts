import { createHash, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { runDailyJob } from '@/lib/daily-job'

export const dynamic = 'force-dynamic'

// Called by the cPanel Cron Job every morning:
//   curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://admin.pykk.uk/internal/cron/daily
// The instrumentation hook also runs the job at server start as a safety net.
function secretsEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 })
  }
  const provided = request.headers.get('authorization') ?? ''
  if (!secretsEqual(provided, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const result = await runDailyJob()
  return NextResponse.json({ ok: true, ...result })
}
