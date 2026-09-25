import { NextResponse } from 'next/server'
import { healthPayload } from '@/lib/health'

// Always answered by the running server (never cached or pre-rendered),
// so scripts/update.sh can trust it as a liveness check.
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(healthPayload())
}
