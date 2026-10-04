import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { getSources, getLatest } = vi.hoisted(() => ({
  getSources: vi.fn(),
  getLatest: vi.fn(),
}))

vi.mock('@/lib/trpc', () => ({
  trpc: {
    news: {
      getSources: { useQuery: getSources },
      getLatest: { useInfiniteQuery: getLatest },
    },
  },
}))

describe('NewsPage', () => {
  it('renders source chips and article titles', async () => {
    getSources.mockReturnValue({ data: ['IGN', 'Kotaku'] })
    getLatest.mockReturnValue({
      data: {
        pages: [
          {
            articles: [
              {
                id: 'n1',
                title: 'Elden Ring DLC announced',
                url: 'https://ign.com/elden-ring-dlc',
                source: 'IGN',
                description: 'FromSoftware has announced...',
                imageUrl: null,
                publishedAt: new Date().toISOString(),
                game: { id: 'g1', slug: 'elden-ring', title: 'Elden Ring' },
              },
            ],
            nextCursor: undefined,
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    })

    const { default: NewsPage } = await import('../app/(public)/news/page')
    const html = renderToStaticMarkup(createElement(NewsPage))
    expect(html).toContain('Gaming news')
    expect(html).toContain('All sources')
    expect(html).toContain('IGN')
    expect(html).toContain('Kotaku')
    expect(html).toContain('Elden Ring DLC announced')
    expect(html).toContain('re: Elden Ring')
  })
})
