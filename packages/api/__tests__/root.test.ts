import { describe, it, expect } from 'vitest'
import { appRouter } from '../root'

describe('appRouter', () => {
  it('exposes the planned router namespaces', () => {
    expect(Object.keys(appRouter._def.record).sort()).toEqual([
      'activity',
      'games',
      'integrations',
      'library',
      'lists',
      'reviews',
      'social',
      'users',
    ])
  })
})
