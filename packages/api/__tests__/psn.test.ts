process.env.PSN_ENCRYPTION_KEY ??= 'aa'.repeat(32)

import { describe, it, expect } from 'vitest'
import { encryptToken, decryptToken, isoDurationToMinutes } from '../lib/psn'

describe('encryptToken / decryptToken', () => {
  it('round-trips an NPSSO token', () => {
    const token = 'npsso-test-token'
    expect(decryptToken(encryptToken(token))).toBe(token)
  })
})

describe('isoDurationToMinutes', () => {
  it('parses PT10H30M as 630 minutes', () => {
    expect(isoDurationToMinutes('PT10H30M')).toBe(630)
  })

  it('parses PT45M as 45 minutes', () => {
    expect(isoDurationToMinutes('PT45M')).toBe(45)
  })

  it('returns 0 for unparseable durations', () => {
    expect(isoDurationToMinutes('not-a-duration')).toBe(0)
  })
})
