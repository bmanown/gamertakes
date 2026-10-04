import { exchangeNpssoForCode, exchangeCodeForAccessToken, getUserPlayedGames } from 'psn-api'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

export function encryptToken(token: string): string {
  const key = Buffer.from(process.env.PSN_ENCRYPTION_KEY!, 'hex')
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`
}

export function decryptToken(encrypted: string): string {
  const [ivHex, dataHex, tagHex] = encrypted.split(':')
  const key = Buffer.from(process.env.PSN_ENCRYPTION_KEY!, 'hex')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(Buffer.from(dataHex, 'hex')) + decipher.final('utf8')
}

export interface PSNGame {
  titleId: string
  name: string
  playDuration: string  // ISO 8601 duration e.g. PT10H30M
  playCount: number
}

export async function fetchPSNLibrary(npssoToken: string): Promise<PSNGame[]> {
  const accessCode = await exchangeNpssoForCode(npssoToken)
  const auth = await exchangeCodeForAccessToken(accessCode)
  const response = await getUserPlayedGames(auth, 'me')
  return (response.titles ?? []).map((t: { titleId: string; name: string; playDuration?: string; playCount?: number }) => ({
    titleId: t.titleId,
    name: t.name,
    playDuration: t.playDuration ?? 'PT0S',
    playCount: t.playCount ?? 0,
  }))
}

export function isoDurationToMinutes(duration: string): number {
  // Parse ISO 8601 duration PT#H#M#S
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] ?? '0')
  const minutes = parseInt(match[2] ?? '0')
  return hours * 60 + minutes
}
