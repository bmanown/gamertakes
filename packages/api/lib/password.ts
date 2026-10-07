const encoder = new TextEncoder()

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

async function deriveKey(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(encoder.encode(password)),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: toArrayBuffer(salt), iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(password, salt)
  return `${toHex(salt)}:${toHex(key)}`
}

export async function verifyPassword(password: string, hash: string) {
  const [saltHex, keyHex] = hash.split(':')
  if (!saltHex || !keyHex) return false
  const expected = fromHex(keyHex)
  const actual = await deriveKey(password, fromHex(saltHex))
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < actual.length; i += 1) diff |= actual[i] ^ expected[i]
  return diff === 0
}

export function placeholderUsername(email: string) {
  const base = email
    .split('@')[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 16)
  return `${base || 'user'}_${Math.random().toString(36).slice(2, 8)}`
}
