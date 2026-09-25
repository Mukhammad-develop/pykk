import { NextResponse } from 'next/server'
import { runDailyJob } from '@/lib/daily-job'
import { apiSession } from '@/lib/auth/guard'
import { originAllowed } from '@/lib/request'

export const dynamic = 'force-dynamic'

// The "Run daily job now" button (manual version of the cron endpoint).
export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const result = await runDailyJob()
  return NextResponse.json({ ok: true, ...result })
}
