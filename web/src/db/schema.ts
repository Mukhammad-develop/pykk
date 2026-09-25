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
