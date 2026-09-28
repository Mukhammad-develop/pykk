import { and, asc, desc, eq, gte, inArray, lt, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, businesses, payments } from '@/db/schema'
import { diffDays, addDays, todayLondon } from './billing'
import { slotToUtcIso } from './booking'

export interface TodayCard {
  count: number
  totalPence: number
  oldestDays?: number
}

export interface TodayData {
  linksToCreate: TodayCard
  waiting: TodayCard
  overdue: TodayCard
  collectedThisMonthPence: number
  collectedLastMonthPence: number
  bookingsToday: number
  toCreate: PaymentRow[]
  waitingList: PaymentRow[]
  overdueList: PaymentRow[]
  recentlyPaid: RecentlyPaidRow[]
}

export interface RecentlyPaidRow extends PaymentRow {
  undoUntil: string | null
}

export interface PaymentRow {
  id: number
  reference: string
  dueDate: string
  amountPence: number
  status: string
  paymentLinkUrl: string | null
  clientToken: string
  businessId: number
  businessName: string
  businessSlug: string
  ownerName: string | null
}

async function sumFor(statuses: string[], fromDate?: string, dateColumn: 'due' | 'paid' = 'due') {
  const db = getDb()
  const conditions = [inArray(payments.status, statuses)]
  if (fromDate && dateColumn === 'paid') conditions.push(gte(payments.paidAt, fromDate))
  const rows = await db
    .select({ count: sql<number>`count(*)`, total: sql<number>`coalesce(sum(${payments.amountPence}), 0)` })
    .from(payments)
    .where(and(...conditions))
  return { count: Number(rows[0].count), totalPence: Number(rows[0].total) }
}

async function rowsWithBusiness(statuses: string[], order: 'asc' | 'desc' = 'asc'): Promise<PaymentRow[]> {
  const db = getDb()
  return db
    .select({
      id: payments.id,
      reference: payments.reference,
      dueDate: payments.dueDate,
      amountPence: payments.amountPence,
      status: payments.status,
      paymentLinkUrl: payments.paymentLinkUrl,
      clientToken: payments.clientToken,
      businessId: businesses.id,
      businessName: businesses.name,
      businessSlug: businesses.slug,
      ownerName: businesses.ownerName,
    })
    .from(payments)
    .innerJoin(businesses, eq(businesses.id, payments.businessId))
    .where(inArray(payments.status, statuses))
    .orderBy(order === 'asc' ? asc(payments.dueDate) : desc(payments.dueDate))
}

export async function getTodayData(): Promise<TodayData> {
  const today = todayLondon()
  const monthStart = `${today.slice(0, 8)}01`
  const lastMonthStart = today.slice(0, 5) + (today.slice(5, 7) === '01'
    ? `${Number(today.slice(0, 4)) - 1}-12-01`
    : `${String(Number(today.slice(5, 7)) - 1).padStart(2, '0')}-01`)

  const db = getDb()
  const [linksToCreate, waitingRows, collectedThisMonth, collectedLastMonthRows, toCreate, waitingList, overdueRows] =
    await Promise.all([
      sumFor(['scheduled']),
      db
        .select({ count: sql<number>`count(*)`, total: sql<number>`coalesce(sum(${payments.amountPence}), 0)` })
        .from(payments)
        .where(and(eq(payments.status, 'link_ready'), gte(payments.dueDate, today))),
      sumFor(['paid'], monthStart, 'paid'),
      db
        .select({ total: sql<number>`coalesce(sum(${payments.amountPence}), 0)` })
        .from(payments)
        .where(and(eq(payments.status, 'paid'), gte(payments.paidAt, lastMonthStart), lt(payments.paidAt, monthStart))),
      rowsWithBusiness(['scheduled']),
      rowsWithBusiness(['link_ready']),
      rowsWithBusiness(['overdue']),
    ])

  const overdueTotal = overdueRows.reduce((sum, r) => sum + r.amountPence, 0)
  const oldestDays = overdueRows.length > 0
    ? Math.max(...overdueRows.map((r) => diffDays(r.dueDate, today)))
    : 0

  // Recently marked paid (last 24h) with the live undo window per row.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const paidRows = await db
    .select({
      id: payments.id,
      reference: payments.reference,
      dueDate: payments.dueDate,
      amountPence: payments.amountPence,
      status: payments.status,
      paymentLinkUrl: payments.paymentLinkUrl,
      clientToken: payments.clientToken,
      businessId: businesses.id,
      businessName: businesses.name,
      businessSlug: businesses.slug,
      ownerName: businesses.ownerName,
      paidRecordedAt: payments.paidRecordedAt,
    })
    .from(payments)
    .innerJoin(businesses, eq(businesses.id, payments.businessId))
    .where(and(eq(payments.status, 'paid'), gte(payments.paidRecordedAt, dayAgo)))
    .orderBy(desc(payments.paidRecordedAt))
    .limit(10)

  const recentlyPaid: RecentlyPaidRow[] = paidRows.map(({ paidRecordedAt, ...row }) => ({
    ...row,
    undoUntil:
      paidRecordedAt && paidRecordedAt.getTime() + 10 * 60 * 1000 > Date.now()
        ? new Date(paidRecordedAt.getTime() + 10 * 60 * 1000).toISOString()
        : null,
  }))

  // Bookings happening today (London date), across all clients.
  const dayStart = new Date(slotToUtcIso(today, '00:00'))
  const dayEnd = new Date(slotToUtcIso(addDays(today, 1), '00:00'))
  const bookingsTodayRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(and(gte(bookings.startsAt, dayStart), lt(bookings.startsAt, dayEnd)))
  const bookingsToday = Number(bookingsTodayRows[0].count)

  return {
    linksToCreate,
    waiting: { count: Number(waitingRows[0].count), totalPence: Number(waitingRows[0].total) },
    overdue: { count: overdueRows.length, totalPence: overdueTotal, oldestDays },
    collectedThisMonthPence: collectedThisMonth.totalPence,
    collectedLastMonthPence: Number(collectedLastMonthRows[0].total),
    bookingsToday,
    toCreate,
    waitingList,
    overdueList: overdueRows,
    recentlyPaid,
  }
}
