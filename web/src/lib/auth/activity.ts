import { getDb } from '@/db'
import { activityLog } from '@/db/schema'

export interface ActivityEntry {
  actor: string // admin email, or 'system'
  action: string // e.g. 'auth.login', 'payment.link_saved'
  entity?: string
  entityId?: string | number
  before?: unknown
  after?: unknown
  ip?: string | null
}

// Writes to the activity log. Never throws — logging must not break the action.
export async function logActivity(entry: ActivityEntry): Promise<void> {
  try {
    const db = getDb()
    await db.insert(activityLog).values({
      actor: entry.actor,
      action: entry.action,
      entity: entry.entity ?? null,
      entityId: entry.entityId != null ? String(entry.entityId) : null,
      beforeJson: entry.before === undefined ? null : JSON.parse(JSON.stringify(entry.before)),
      afterJson: entry.after === undefined ? null : JSON.parse(JSON.stringify(entry.after)),
      ip: entry.ip ?? null,
    })
  } catch (error) {
    console.error('[pykk] activity log write failed:', error)
  }
}
