import { describe, it, expect } from 'vitest'
import { isProtectedPath, protectedPaths } from '../lib/auth-paths'

describe('protectedPaths', () => {
  it('covers the authenticated app routes', () => {
    expect(protectedPaths).toEqual([
      '/dashboard',
      '/library',
      '/profile',
      '/lists/new',
      '/settings',
      '/activity',
    ])
  })
})

describe('isProtectedPath', () => {
  it('protects dashboard, library, settings, and nested profile routes', () => {
    expect(isProtectedPath('/dashboard')).toBe(true)
    expect(isProtectedPath('/library/playing')).toBe(true)
    expect(isProtectedPath('/profile/edit')).toBe(true)
    expect(isProtectedPath('/lists/new')).toBe(true)
    expect(isProtectedPath('/settings')).toBe(true)
    expect(isProtectedPath('/activity')).toBe(true)
  })

  it('does not protect public browse and auth pages', () => {
    expect(isProtectedPath('/')).toBe(false)
    expect(isProtectedPath('/games')).toBe(false)
    expect(isProtectedPath('/games/the-witcher-3')).toBe(false)
    expect(isProtectedPath('/auth/signin')).toBe(false)
    expect(isProtectedPath('/lists/abc')).toBe(false)
  })
})
