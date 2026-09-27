import { randomBytes } from 'node:crypto'
import { and, eq, inArray, lt } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { addDays, dueDatesBetween, nextDueAfter, pastGrace, todayLondon, type ISODate } from './billing'
import { uniqueReference } from './reference'
import { getSettingNumber } from './settings'
import { logActivity } from './auth/activity'
import { suspendSite } from './site-control'

export interface DailyJobResult {
  created: number
  overdue: number
  suspended: number
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

  // Auto-suspend: an unpaid bill past its grace period turns the site off.
  const graceDefault = await getSettingNumber('grace_days', 7)
  const candidates = await db
    .select({ payment: payments, business: businesses })
    .from(payments)
    .innerJoin(businesses, eq(businesses.id, payments.businessId))
    .where(and(eq(payments.status, 'overdue'), eq(businesses.status, 'active')))

  let suspended = 0
  for (const { payment, business } of candidates) {
    const grace = business.graceDays ?? graceDefault
    if (!pastGrace(today, payment.dueDate, grace)) continue
    await db.update(businesses).set({ status: 'suspended' }).where(eq(businesses.id, business.id))
    const siteResult = suspendSite(business.slug)
    await logActivity({
      actor: 'system',
      action: 'business.auto_suspended',
      entity: 'business',
      entityId: business.id,
      after: { reference: payment.reference, dueDate: payment.dueDate, grace, siteResult },
    })
    suspended++
  }

  await logActivity({
    actor: 'system',
    action: 'cron.daily',
    after: { created, overdue, suspended, today },
  })

  return { created, overdue, suspended, today }
}
