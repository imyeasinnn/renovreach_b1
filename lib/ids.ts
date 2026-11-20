let counter = 0

/** Small id helper for the in-memory demo. Real rows use gen_random_uuid(). */
export function newId(prefix: string): string {
  counter += 1
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}_${Date.now().toString(36)}${counter}`
}
