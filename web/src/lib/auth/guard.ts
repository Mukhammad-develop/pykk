import { getSession, type AdminSession } from './session'

// Every admin API route starts with this. Returns null when not signed in.
export async function apiSession(): Promise<AdminSession | null> {
  return getSession()
}
