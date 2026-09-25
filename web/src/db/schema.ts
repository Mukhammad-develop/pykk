import {
  index,
  int,
  json,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
  char,
  text,
  date,
} from 'drizzle-orm/mysql-core'

// One row: the founder. Created with `pnpm admin:create` (never a public sign-up).
export const adminUsers = mysqlTable(
  'admin_users',
  {
    id: int('id').autoincrement().primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('admin_users_email_unique').on(t.email)],
)

// 30-day sessions. The cookie holds a random token; the table holds only its
// SHA-256 hash, so a leaked database doesn't leak usable sessions.
export const adminSessions = mysqlTable(
  'admin_sessions',
  {
    id: int('id').autoincrement().primaryKey(),
    tokenHash: char('token_hash', { length: 64 }).notNull(),
    userId: int('user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    revokedAt: timestamp('revoked_at'),
    ip: varchar('ip', { length: 45 }),
    userAgent: varchar('user_agent', { length: 255 }),
  },
  (t) => [
    uniqueIndex('admin_sessions_token_unique').on(t.tokenHash),
    index('admin_sessions_user_idx').on(t.userId),
  ],
)

// Login rate limiting: 5 failures per 15 minutes, tracked separately per IP
// and per email, so an attacker can't bypass one counter with the other.
export const loginAttempts = mysqlTable(
  'login_attempts',
  {
    id: int('id').autoincrement().primaryKey(),
    kind: varchar('kind', { length: 10 }).notNull(), // 'ip' | 'email'
    value: varchar('value', { length: 320 }).notNull(),
    failures: int('failures').notNull().default(0),
    windowStartedAt: timestamp('window_started_at').notNull(),
    lockedUntil: timestamp('locked_until'),
  },
  (t) => [uniqueIndex('login_attempts_kind_value_unique').on(t.kind, t.value)],
)

// Every admin action: who, what, when, before and after.
export const activityLog = mysqlTable(
  'activity_log',
  {
    id: int('id').autoincrement().primaryKey(),
    actor: varchar('actor', { length: 320 }).notNull(), // email, or 'system'
    action: varchar('action', { length: 120 }).notNull(),
    entity: varchar('entity', { length: 60 }),
    entityId: varchar('entity_id', { length: 60 }),
    beforeJson: json('before_json'),
    afterJson: json('after_json'),
    ip: varchar('ip', { length: 45 }),
    at: timestamp('at').defaultNow().notNull(),
  },
  (t) => [index('activity_log_at_idx').on(t.at)],
)

// ---------------------------------------------------------------------------
// Phase 2: businesses and monthly payments (plus tables later phases read).
// Dates are ISO strings 'YYYY-MM-DD' (Europe/London calendar logic) — never
// instants, so UK clock changes can't bite.
// ---------------------------------------------------------------------------

export const BUSINESS_TYPES = [
  'barber_hair',
  'beauty_spa',
  'cafe',
  'restaurant',
  'cleaning',
  'laundry',
  'retail',
  'local_services',
  'other',
] as const
export type BusinessType = (typeof BUSINESS_TYPES)[number]

export const BUSINESS_STATUSES = [
  'lead',
  'building',
  'preview',
  'active',
  'paused',
  'suspended',
  'cancelled',
] as const
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number]

export const businesses = mysqlTable(
  'businesses',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 40 }).notNull(),
    type: varchar('type', { length: 30 }).notNull(),
    ownerName: varchar('owner_name', { length: 160 }),
    ownerEmail: varchar('owner_email', { length: 320 }),
    ownerPhone: varchar('owner_phone', { length: 40 }),
    address: varchar('address', { length: 255 }),
    postcode: varchar('postcode', { length: 12 }),
    town: varchar('town', { length: 120 }),
    status: varchar('status', { length: 20 }).notNull().default('lead'),
    pricePence: int('price_pence').notNull(),
    billingAnchorDate: date('billing_anchor_date', { mode: 'string' }),
    startedAt: date('started_at', { mode: 'string' }),
    cancelledAt: date('cancelled_at', { mode: 'string' }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex('businesses_slug_unique').on(t.slug),
    index('businesses_status_idx').on(t.status),
  ],
)

export const PAYMENT_STATUSES = [
  'scheduled',
  'link_ready',
  'paid',
  'overdue',
  'waived',
  'void',
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAID_METHODS = ['link', 'cash', 'bank_transfer', 'card_in_person', 'other'] as const
export type PaidMethod = (typeof PAID_METHODS)[number]

export const payments = mysqlTable(
  'payments',
  {
    id: int('id').autoincrement().primaryKey(),
    businessId: int('business_id').notNull(),
    reference: char('reference', { length: 6 }).notNull(),
    periodStart: date('period_start', { mode: 'string' }).notNull(),
    periodEnd: date('period_end', { mode: 'string' }).notNull(),
    dueDate: date('due_date', { mode: 'string' }).notNull(),
    amountPence: int('amount_pence').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('scheduled'),
    paymentLinkUrl: varchar('payment_link_url', { length: 500 }),
    linkAddedAt: timestamp('link_added_at'),
    clientToken: varchar('client_token', { length: 64 }).notNull(),
    paidAt: date('paid_at', { mode: 'string' }),
    paidMethod: varchar('paid_method', { length: 20 }),
    paidNote: varchar('paid_note', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex('payments_reference_unique').on(t.reference),
    // One row per business per period — this is what makes the daily job idempotent.
    uniqueIndex('payments_business_period_unique').on(t.businessId, t.periodStart),
    index('payments_status_due_idx').on(t.status, t.dueDate),
    index('payments_business_idx').on(t.businessId),
  ],
)

// The founder's monthly costs, so the panel can show profit (Phase 6).
export const costs = mysqlTable(
  'costs',
  {
    id: int('id').autoincrement().primaryKey(),
    month: char('month', { length: 7 }).notNull(), // 'YYYY-MM'
    category: varchar('category', { length: 20 }).notNull(), // hosting, sim_plan, sms_api, ai, domain, other
    amountPence: int('amount_pence').notNull(),
    note: varchar('note', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('costs_month_idx').on(t.month)],
)

// Key/value settings (defaults live in lib/settings.ts).
export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 60 }).primaryKey(),
  value: text('value').notNull(),
})

// Stub tables the statistics phase will read — created now per the brief.
export const bookings = mysqlTable(
  'bookings',
  {
    id: int('id').autoincrement().primaryKey(),
    businessId: int('business_id').notNull(),
    startsAt: timestamp('starts_at').notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    source: varchar('source', { length: 20 }).notNull(), // online, phone, walk_in
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('bookings_business_idx').on(t.businessId)],
)

export const smsMessages = mysqlTable(
  'sms_messages',
  {
    id: int('id').autoincrement().primaryKey(),
    businessId: int('business_id').notNull(),
    kind: varchar('kind', { length: 40 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    segments: int('segments'),
    costPence: int('cost_pence'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('sms_business_idx').on(t.businessId)],
)

export const enquiries = mysqlTable(
  'enquiries',
  {
    id: int('id').autoincrement().primaryKey(),
    businessId: int('business_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('enquiries_business_idx').on(t.businessId)],
)

export const pageViewsDaily = mysqlTable(
  'page_views_daily',
  {
    id: int('id').autoincrement().primaryKey(),
    businessId: int('business_id').notNull(),
    day: date('day', { mode: 'string' }).notNull(),
    views: int('views').notNull().default(0),
    uniqueVisitors: int('unique_visitors').notNull().default(0),
  },
  (t) => [uniqueIndex('page_views_business_day_unique').on(t.businessId, t.day)],
)
