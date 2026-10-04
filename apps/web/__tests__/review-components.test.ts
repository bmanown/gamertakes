import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReviewCard } from '../components/review/ReviewCard'
import { ReviewForm } from '../components/review/ReviewForm'

vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '3 days',
}))

function review(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rev1',
    body: 'Hades is a masterpiece of combat and story.',
    containsSpoilers: false,
    createdAt: new Date('2024-01-01'),
    user: { username: 'zagreus', displayName: 'Zagreus', avatarUrl: null },
    entry: { rating: 5 },
    likes: [{ userId: 'u2' }],
    ...overrides,
  }
}

describe('ReviewCard', () => {
  it('renders the reviewer name, body, like count, and relative time', () => {
    const html = renderToStaticMarkup(createElement(ReviewCard, { review: review() }))
    expect(html).toContain('Zagreus')
    expect(html).toContain('Hades is a masterpiece of combat and story.')
    expect(html).toContain('1')
    expect(html).toContain('3 days ago')
  })

  it('falls back to username when displayName is missing', () => {
    const html = renderToStaticMarkup(
      createElement(ReviewCard, {
        review: review({ user: { username: 'zagreus', displayName: null, avatarUrl: null } }),
      }),
    )
    expect(html).toContain('zagreus')
  })

  it('hides spoiler text behind a reveal control', () => {
    const html = renderToStaticMarkup(
      createElement(ReviewCard, {
        review: review({ containsSpoilers: true, body: 'Hades is actually Zagreus' }),
      }),
    )
    expect(html).toContain('Spoilers — click to reveal')
    expect(html).toContain('<details')
    expect(html).toContain('Hades is actually Zagreus')
  })
})

describe('ReviewForm', () => {
  it('renders a body field, spoiler checkbox, and post button', () => {
    const html = renderToStaticMarkup(createElement(ReviewForm, { onSubmit: () => {} }))
    expect(html).toContain('textarea')
    expect(html).toContain('Contains spoilers')
    expect(html).toContain('Post review')
  })
})
