import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, placeholderUsername } from '../lib/password'

describe('password hashing', () => {
  it('accepts the original password and rejects a wrong one', async () => {
    const hash = await hashPassword('password1')
    expect(hash).toContain(':')
    await expect(verifyPassword('password1', hash)).resolves.toBe(true)
    await expect(verifyPassword('wrongpass', hash)).resolves.toBe(false)
  })
})

describe('placeholderUsername', () => {
  it('builds a unique-looking handle from the email', () => {
    expect(placeholderUsername('Brian.O@example.com')).toMatch(/^briano_[a-z0-9]+$/)
  })
})
