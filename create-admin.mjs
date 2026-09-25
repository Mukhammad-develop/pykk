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
  activityLog: () => activityLog,
  adminSessions: () => adminSessions,
  adminUsers: () => adminUsers,
  loginAttempts: () => loginAttempts
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
  text
} from "drizzle-orm/mysql-core";
var adminUsers, adminSessions, loginAttempts, activityLog;
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
