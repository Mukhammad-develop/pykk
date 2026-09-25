import { randomBytes } from 'node:crypto'
import { and, eq, inArray, lt } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { addDays, dueDatesBetween, nextDueAfter, todayLondon, type ISODate } from './billing'
import { uniqueReference } from './reference'
import { getSettingNumber } from './settings'
import { logActivity } from './auth/activity'

export interface DailyJobResult {
  created: number
  overdue: number
  today: ISODate
}

// The daily billing job. Idempotent: the (business_id, period_start) unique
// constraint means running it any number of times creates nothing twice.
export async function runDailyJob(opts: { today?: ISODate } = {}): Promise<DailyJobResult> {
  const today = opts.today ?? todayLondon()
  const db = getDb()
  const leadDays = await getSettingNumber('lead_days', 7)
  const windowEnd = addDays(today, leadDays)

  let created = 0
  const active = await db
    .select()
    .from(businesses)
    .where(eq(businesses.status, 'active'))

  for (const business of active) {
    if (!business.billingAnchorDate) continue

    for (const dueDate of dueDatesBetween(business.billingAnchorDate, today, windowEnd)) {
      const periodStart = dueDate
      const periodEnd = nextDueAfter(business.billingAnchorDate, dueDate)

      const existing = await db
        .select({ id: payments.id })
        .from(payments)
        .where(and(eq(payments.businessId, business.id), eq(payments.periodStart, periodStart)))
        .limit(1)
      if (existing.length > 0) continue

      const reference = await uniqueReference(async (ref) => {
        const rows = await db
          .select({ id: payments.id })
          .from(payments)
          .where(eq(payments.reference, ref))
          .limit(1)
        return rows.length > 0
      })

      try {
        await db.insert(payments).values({
          businessId: business.id,
          reference,
          periodStart,
          periodEnd,
          dueDate,
          amountPence: business.pricePence,
          status: 'scheduled',
          clientToken: randomBytes(32).toString('base64url'),
        })
        created++
      } catch (error: unknown) {
        // A concurrent run inserted the same period — that's the idempotency net.
        if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') continue
        throw error
      }
    }
  }

  const overdueResult = await db
    .update(payments)
    .set({ status: 'overdue' })
    .where(and(lt(payments.dueDate, today), inArray(payments.status, ['scheduled', 'link_ready'])))
  const overdue = Number((overdueResult as unknown as [{ affectedRows?: number }])[0]?.affectedRows ?? 0)

  await logActivity({
    actor: 'system',
    action: 'cron.daily',
    after: { created, overdue, today },
  })

  return { created, overdue, today }
}
