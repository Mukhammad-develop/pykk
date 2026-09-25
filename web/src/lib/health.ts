export interface HealthPayload {
  ok: true
  service: 'pykk'
  version: string
  time: string
}

export function healthPayload(
  version: string = process.env.APP_VERSION ?? 'dev',
): HealthPayload {
  return {
    ok: true,
    service: 'pykk',
    version,
    time: new Date().toISOString(),
  }
}
