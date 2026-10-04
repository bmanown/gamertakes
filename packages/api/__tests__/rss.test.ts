import { describe, it, expect, vi } from 'vitest'

vi.mock('@gamertakes/db', () => ({
  db: {
    game: { findMany: vi.fn() },
    newsArticle: { upsert: vi.fn(), deleteMany: vi.fn(), count: vi.fn(), findMany: vi.fn() },
  },
}))

vi.mock('rss-parser', () => ({
  default: class {
    async parseURL() {
      return {
        items: [
          {
            title: 'Elden Ring DLC announced',
            link: 'https://ign.com/elden-ring-dlc',
            contentSnippet: 'FromSoftware has announced...',
            pubDate: new Date().toISOString(),
            enclosure: { url: 'https://ign.com/img.jpg' },
          },
          {
            title: 'Old article',
            link: 'https://ign.com/old',
            pubDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      }
    }
  },
}))

import { fetchRSSSource } from '../lib/rss'

describe('fetchRSSSource', () => {
  it('returns parsed articles within 7 days', async () => {
    const articles = await fetchRSSSource({ name: 'IGN', url: 'https://feeds.ign.com/ign/all' })
    expect(articles).toHaveLength(1)
    expect(articles[0].title).toBe('Elden Ring DLC announced')
    expect(articles[0].source).toBe('IGN')
    expect(articles[0].imageUrl).toBe('https://ign.com/img.jpg')
  })

  it('filters out articles older than 7 days', async () => {
    const articles = await fetchRSSSource({ name: 'IGN', url: 'https://feeds.ign.com/ign/all' })
    expect(articles.every((a) => a.publishedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).toBe(true)
  })
})
