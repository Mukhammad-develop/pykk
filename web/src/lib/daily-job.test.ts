import { beforeAll, describe, expect, it } from 'vitest'
import { and, eq, inArray, lt } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { runDailyJob } from './daily-job'
import { addDays, nextDueAfter, todayLondon } from './billing'

// Runs against the dev database (docker compose) or the CI MariaDB service.
// Skipped when DATABASE_URL isn't set.
const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('daily job (database)', () => {
  const today = todayLondon()

  beforeAll(async () => {
    const db = getDb()
    await db.delete(payments)
    await db.delete(businesses)
  })

  async function addBusiness(overrides: Partial<typeof businesses.$inferInsert> = {}) {
    const db = getDb()
    const slug = `test-${Math.random().toString(36).slice(2, 10)}`
    await db.insert(businesses).values({
      name: 'Test Business',
      slug,
      type: 'barber_hair',
      status: 'active',
      pricePence: 499,
      billingAnchorDate: today,
      ...overrides,
    })
    const rows = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1)
    return rows[0]
  }

  it('creates a scheduled bill inside the lead window — and never twice', async () => {
    const inWindow = addDays(today, 5)
    const business = await addBusiness({ billingAnchorDate: inWindow })

    const first = await runDailyJob({ today })
    expect(first.created).toBe(1)

    const db = getDb()
    const rows = await db.select().from(payments).where(eq(payments.businessId, business.id))
    expect(rows).toHaveLength(1)
    const payment = rows[0]
    expect(payment.status).toBe('scheduled')
    expect(payment.amountPence).toBe(499)
    expect(payment.dueDate).toBe(inWindow)
    expect(payment.periodStart).toBe(inWindow)
    expect(payment.periodEnd).toBe(nextDueAfter(inWindow, inWindow))
    expect(payment.reference).toMatch(/^[A-Z0-9]{6}$/)
    expect(payment.clientToken.length).toBeGreaterThanOrEqual(40)

    // Idempotency: second and third runs create nothing.
    const second = await runDailyJob({ today })
    const third = await runDailyJob({ today })
    expect(second.created).toBe(0)
    expect(third.created).toBe(0)
    const after = await db.select().from(payments).where(eq(payments.businessId, business.id))
    expect(after).toHaveLength(1)
  })

  it('ignores due dates beyond the lead window', async () => {
    const beyondWindow = addDays(today, 20)
    const business = await addBusiness({ billingAnchorDate: beyondWindow })
    const result = await runDailyJob({ today })
    expect(result.created).toBe(0)
    const db = getDb()
    const rows = await db.select().from(payments).where(eq(payments.businessId, business.id))
    expect(rows).toHaveLength(0)
  })

  it('does nothing for non-active businesses', async () => {
    const inWindow = addDays(today, 3)
    const business = await addBusiness({ billingAnchorDate: inWindow, status: 'paused' })
    const result = await runDailyJob({ today })
    expect(result.created).toBe(0)
    const db = getDb()
    const rows = await db.select().from(payments).where(eq(payments.businessId, business.id))
    expect(rows).toHaveLength(0)
  })

  it('marks past-due scheduled and link_ready payments as overdue', async () => {
    const business = await addBusiness()
    const db = getDb()
    const yesterday = addDays(today, -1)
    const ref = Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, 'X')
    await db.insert(payments).values([
      {
        businessId: business.id,
        reference: ref.slice(0, 6).padEnd(6, 'Z'),
        periodStart: addDays(yesterday, -30),
        periodEnd: yesterday,
        dueDate: yesterday,
        amountPence: 499,
        status: 'scheduled',
        clientToken: 'tok-' + Math.random().toString(36).slice(2, 44),
      },
      {
        businessId: business.id,
        reference: Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, 'Y').slice(0, 6).padEnd(6, 'W'),
        periodStart: addDays(yesterday, -60),
        periodEnd: addDays(yesterday, -30),
        dueDate: addDays(yesterday, -30),
        amountPence: 499,
        status: 'link_ready',
        clientToken: 'tok-' + Math.random().toString(36).slice(2, 44),
      },
    ])

    const result = await runDailyJob({ today })
    expect(result.overdue).toBe(2)

    const after = await db
      .select()
      .from(payments)
      .where(and(eq(payments.businessId, business.id), inArray(payments.status, ['scheduled', 'link_ready']), lt(payments.dueDate, today)))
    expect(after).toHaveLength(0)
    const overdueRows = await db
      .select()
      .from(payments)
      .where(and(eq(payments.businessId, business.id), eq(payments.status, 'overdue')))
    expect(overdueRows).toHaveLength(2)
  })
})
