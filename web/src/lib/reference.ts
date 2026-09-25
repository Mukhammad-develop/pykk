import { randomInt } from 'node:crypto'

export const REFERENCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
export const REFERENCE_LENGTH = 6

// A 6-character payment reference like JK891P. Cryptographically random.
// `rand` is injectable so tests can force collisions.
export function generateReference(
  rand: (maxExclusive: number) => number = randomInt,
): string {
  let ref = ''
  for (let i = 0; i < REFERENCE_LENGTH; i++) {
    ref += REFERENCE_ALPHABET[rand(REFERENCE_ALPHABET.length)]
  }
  return ref
}

// Retries on collision (the reference is unique across all payments).
export async function uniqueReference(
  exists: (reference: string) => Promise<boolean>,
  maxAttempts = 10,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const reference = generateReference()
    if (!(await exists(reference))) return reference
  }
  throw new Error(`Could not generate a unique payment reference after ${maxAttempts} attempts`)
}
