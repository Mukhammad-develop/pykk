import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { originAllowed } from '@/lib/request'

// Shared pre-flight for every payment/business action route: origin check,
// session check, and the payment + its business loaded.
export async function loadPaymentForAction(
  request: Request,
  paymentId: number,
): Promise<
  | { ok: true; session: { userId: number; email: string }; payment: typeof payments.$inferSelect; business: typeof businesses.$inferSelect }
  | { ok: false; response: NextResponse }
> {
  if (!originAllowed(request)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  const session = await apiSession()
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) }
  }
  const db = getDb()
  const rows = await db
    .select({ payment: payments, business: businesses })
    .from(payments)
    .innerJoin(businesses, eq(businesses.id, payments.businessId))
    .where(eq(payments.id, paymentId))
    .limit(1)
  const row = rows[0]
  if (!row) {
    return { ok: false, response: NextResponse.json({ error: 'Payment not found' }, { status: 404 }) }
  }
  return { ok: true, session, payment: row.payment, business: row.business }
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}
