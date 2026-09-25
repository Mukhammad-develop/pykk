var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  BUSINESS_STATUSES: () => BUSINESS_STATUSES,
  BUSINESS_TYPES: () => BUSINESS_TYPES,
  PAID_METHODS: () => PAID_METHODS,
  PAYMENT_STATUSES: () => PAYMENT_STATUSES,
  activityLog: () => activityLog,
  adminSessions: () => adminSessions,
  adminUsers: () => adminUsers,
  bookings: () => bookings,
  businesses: () => businesses,
  costs: () => costs,
  enquiries: () => enquiries,
  loginAttempts: () => loginAttempts,
  pageViewsDaily: () => pageViewsDaily,
  payments: () => payments,
  settings: () => settings,
  smsMessages: () => smsMessages
});
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
  date
} from "drizzle-orm/mysql-core";
var adminUsers, adminSessions, loginAttempts, activityLog, BUSINESS_TYPES, BUSINESS_STATUSES, businesses, PAYMENT_STATUSES, PAID_METHODS, payments, costs, settings, bookings, smsMessages, enquiries, pageViewsDaily;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    adminUsers = mysqlTable(
      "admin_users",
      {
        id: int("id").autoincrement().primaryKey(),
        email: varchar("email", { length: 320 }).notNull(),
        passwordHash: text("password_hash").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (t) => [uniqueIndex("admin_users_email_unique").on(t.email)]
    );
    adminSessions = mysqlTable(
      "admin_sessions",
      {
        id: int("id").autoincrement().primaryKey(),
        tokenHash: char("token_hash", { length: 64 }).notNull(),
        userId: int("user_id").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        revokedAt: timestamp("revoked_at"),
        ip: varchar("ip", { length: 45 }),
        userAgent: varchar("user_agent", { length: 255 })
      },
      (t) => [
        uniqueIndex("admin_sessions_token_unique").on(t.tokenHash),
        index("admin_sessions_user_idx").on(t.userId)
      ]
    );
    loginAttempts = mysqlTable(
      "login_attempts",
      {
        id: int("id").autoincrement().primaryKey(),
        kind: varchar("kind", { length: 10 }).notNull(),
        // 'ip' | 'email'
        value: varchar("value", { length: 320 }).notNull(),
        failures: int("failures").notNull().default(0),
        windowStartedAt: timestamp("window_started_at").notNull(),
        lockedUntil: timestamp("locked_until")
      },
      (t) => [uniqueIndex("login_attempts_kind_value_unique").on(t.kind, t.value)]
    );
    activityLog = mysqlTable(
      "activity_log",
      {
        id: int("id").autoincrement().primaryKey(),
        actor: varchar("actor", { length: 320 }).notNull(),
        // email, or 'system'
        action: varchar("action", { length: 120 }).notNull(),
        entity: varchar("entity", { length: 60 }),
        entityId: varchar("entity_id", { length: 60 }),
        beforeJson: json("before_json"),
        afterJson: json("after_json"),
        ip: varchar("ip", { length: 45 }),
        at: timestamp("at").defaultNow().notNull()
      },
      (t) => [index("activity_log_at_idx").on(t.at)]
    );
    BUSINESS_TYPES = [
      "barber_hair",
      "beauty_spa",
      "cafe",
      "restaurant",
      "cleaning",
      "laundry",
      "retail",
      "local_services",
      "other"
    ];
    BUSINESS_STATUSES = [
      "lead",
      "building",
      "preview",
      "active",
      "paused",
      "suspended",
      "cancelled"
    ];
    businesses = mysqlTable(
      "businesses",
      {
        id: int("id").autoincrement().primaryKey(),
        name: varchar("name", { length: 160 }).notNull(),
        slug: varchar("slug", { length: 40 }).notNull(),
        type: varchar("type", { length: 30 }).notNull(),
        ownerName: varchar("owner_name", { length: 160 }),
        ownerEmail: varchar("owner_email", { length: 320 }),
        ownerPhone: varchar("owner_phone", { length: 40 }),
        address: varchar("address", { length: 255 }),
        postcode: varchar("postcode", { length: 12 }),
        town: varchar("town", { length: 120 }),
        status: varchar("status", { length: 20 }).notNull().default("lead"),
        pricePence: int("price_pence").notNull(),
        billingAnchorDate: date("billing_anchor_date", { mode: "string" }),
        startedAt: date("started_at", { mode: "string" }),
        cancelledAt: date("cancelled_at", { mode: "string" }),
        notes: text("notes"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (t) => [
        uniqueIndex("businesses_slug_unique").on(t.slug),
        index("businesses_status_idx").on(t.status)
      ]
    );
    PAYMENT_STATUSES = [
      "scheduled",
      "link_ready",
      "paid",
      "overdue",
      "waived",
      "void"
    ];
    PAID_METHODS = ["link", "cash", "bank_transfer", "card_in_person", "other"];
    payments = mysqlTable(
      "payments",
      {
        id: int("id").autoincrement().primaryKey(),
        businessId: int("business_id").notNull(),
        reference: char("reference", { length: 6 }).notNull(),
        periodStart: date("period_start", { mode: "string" }).notNull(),
        periodEnd: date("period_end", { mode: "string" }).notNull(),
        dueDate: date("due_date", { mode: "string" }).notNull(),
        amountPence: int("amount_pence").notNull(),
        status: varchar("status", { length: 20 }).notNull().default("scheduled"),
        paymentLinkUrl: varchar("payment_link_url", { length: 500 }),
        linkAddedAt: timestamp("link_added_at"),
        clientToken: varchar("client_token", { length: 64 }).notNull(),
        paidAt: date("paid_at", { mode: "string" }),
        paidMethod: varchar("paid_method", { length: 20 }),
        paidNote: varchar("paid_note", { length: 500 }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
      },
      (t) => [
        uniqueIndex("payments_reference_unique").on(t.reference),
        // One row per business per period — this is what makes the daily job idempotent.
        uniqueIndex("payments_business_period_unique").on(t.businessId, t.periodStart),
        index("payments_status_due_idx").on(t.status, t.dueDate),
        index("payments_business_idx").on(t.businessId)
      ]
    );
    costs = mysqlTable(
      "costs",
      {
        id: int("id").autoincrement().primaryKey(),
        month: char("month", { length: 7 }).notNull(),
        // 'YYYY-MM'
        category: varchar("category", { length: 20 }).notNull(),
        // hosting, sim_plan, sms_api, ai, domain, other
        amountPence: int("amount_pence").notNull(),
        note: varchar("note", { length: 255 }),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (t) => [index("costs_month_idx").on(t.month)]
    );
    settings = mysqlTable("settings", {
      key: varchar("key", { length: 60 }).primaryKey(),
      value: text("value").notNull()
    });
    bookings = mysqlTable(
      "bookings",
      {
        id: int("id").autoincrement().primaryKey(),
        businessId: int("business_id").notNull(),
        startsAt: timestamp("starts_at").notNull(),
        status: varchar("status", { length: 20 }).notNull(),
        source: varchar("source", { length: 20 }).notNull(),
        // online, phone, walk_in
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (t) => [index("bookings_business_idx").on(t.businessId)]
    );
    smsMessages = mysqlTable(
      "sms_messages",
      {
        id: int("id").autoincrement().primaryKey(),
        businessId: int("business_id").notNull(),
        kind: varchar("kind", { length: 40 }).notNull(),
        status: varchar("status", { length: 20 }).notNull(),
        segments: int("segments"),
        costPence: int("cost_pence"),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (t) => [index("sms_business_idx").on(t.businessId)]
    );
    enquiries = mysqlTable(
      "enquiries",
      {
        id: int("id").autoincrement().primaryKey(),
        businessId: int("business_id").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (t) => [index("enquiries_business_idx").on(t.businessId)]
    );
    pageViewsDaily = mysqlTable(
      "page_views_daily",
      {
        id: int("id").autoincrement().primaryKey(),
        businessId: int("business_id").notNull(),
        day: date("day", { mode: "string" }).notNull(),
        views: int("views").notNull().default(0),
        uniqueVisitors: int("unique_visitors").notNull().default(0)
      },
      (t) => [uniqueIndex("page_views_business_day_unique").on(t.businessId, t.day)]
    );
  }
});

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  getDb: () => getDb
});
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const pool = mysql.createPool({ uri: url, connectionLimit: 2 });
  return drizzle(pool, { schema: schema_exports, mode: "default" });
}
function getDb() {
  if (!cached) cached = createDb();
  return cached;
}
var cached;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    init_schema();
    cached = null;
  }
});

// src/lib/auth/password.ts
var password_exports = {};
__export(password_exports, {
  hashPassword: () => hashPassword,
  verifyPassword: () => verifyPassword
});
import argon2 from "argon2";
async function hashPassword(password2) {
  return argon2.hash(password2, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}
async function verifyPassword(hash, password2) {
  try {
    return await argon2.verify(hash, password2);
  } catch {
    return false;
  }
}
var init_password = __esm({
  "src/lib/auth/password.ts"() {
    "use strict";
  }
});

// src/scripts/create-admin.ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import { eq } from "drizzle-orm";
var here = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.join(here, ".env"));
} catch {
  try {
    process.loadEnvFile(path.join(process.cwd(), ".env.local"));
  } catch {
  }
}
var isPiped = !process.stdin.isTTY;
var pipedLines = [];
if (isPiped) {
  const data = await new Promise((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      buf += chunk;
    });
    process.stdin.on("end", () => resolve(buf));
    process.stdin.resume();
  });
  pipedLines = data.split(/\r?\n/);
}
var ask;
if (isPiped) {
  ask = (question, { hidden = false } = {}) => {
    const answer = (pipedLines.shift() ?? "").trim();
    process.stdout.write(question + (hidden && answer ? "********" : answer) + "\n");
    return Promise.resolve(answer);
  };
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const rli = rl;
  const originalWrite = rli._writeToOutput.bind(rl);
  let masking = false;
  let activeQuestion = "";
  rli._writeToOutput = (s) => {
    if (masking && s !== activeQuestion && !s.includes("\n")) {
      rli.output.write("*");
    } else {
      originalWrite(s);
    }
  };
  ask = (question, { hidden = false } = {}) => new Promise((resolve) => {
    activeQuestion = question;
    masking = hidden;
    rl.question(question, (answer) => {
      masking = false;
      resolve(answer.trim());
    });
  });
}
var emailArgIndex = process.argv.indexOf("--email");
var emailFromArg = emailArgIndex !== -1 ? process.argv[emailArgIndex + 1] : void 0;
var email = (emailFromArg ?? await ask("Admin email: ")).toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("That does not look like an email address.");
  process.exit(1);
}
var password = await ask("Password (min 12 characters): ", { hidden: true });
if (password.length < 12) {
  console.error("Password too short \u2014 use at least 12 characters.");
  process.exit(1);
}
var confirm = await ask("Password again: ", { hidden: true });
if (password !== confirm) {
  console.error("Passwords do not match.");
  process.exit(1);
}
var { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
var { adminUsers: adminUsers2, activityLog: activityLog2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
var { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_password(), password_exports));
var db = getDb2();
var passwordHash = await hashPassword2(password);
var existing = await db.select().from(adminUsers2).where(eq(adminUsers2.email, email)).limit(1);
if (existing.length > 0) {
  await db.update(adminUsers2).set({ passwordHash }).where(eq(adminUsers2.email, email));
  await db.insert(activityLog2).values({
    actor: "system",
    action: "admin.password_reset",
    entity: "admin_user",
    entityId: email
  });
  console.log(`\u2714 Password updated for ${email}`);
} else {
  await db.insert(adminUsers2).values({ email, passwordHash });
  await db.insert(activityLog2).values({
    actor: "system",
    action: "admin.created",
    entity: "admin_user",
    entityId: email
  });
  console.log(`\u2714 Admin user created: ${email}`);
}
process.exit(0);
