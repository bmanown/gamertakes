import { describe, it, expect } from 'vitest'
import { popularityScore } from '../../../jobs/popularity'

describe('popularityScore', () => {
  it('scores each game as entries + 3 * reviews', () => {
    expect(popularityScore(2, 1)).toBe(5)
    expect(popularityScore(0, 0)).toBe(0)
  })
})
