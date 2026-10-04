'use client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { formatDistanceToNow } from 'date-fns'

const SOURCE_COLORS: Record<string, string> = {
  IGN: '#e11d48',
  Kotaku: '#f97316',
  GameSpot: '#2563eb',
  Polygon: '#7c3aed',
  Eurogamer: '#0d9488',
  'Rock Paper Shotgun': '#16a34a',
}

export default function NewsPage() {
  const [activeSource, setActiveSource] = useState<string | undefined>()
  const { data: sourcesData } = trpc.news.getSources.useQuery()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.news.getLatest.useInfiniteQuery(
      { limit: 20, source: activeSource },
      { getNextPageParam: (last) => last.nextCursor },
    )

  const articles = data?.pages.flatMap((p) => p.articles) ?? []

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, letterSpacing: -0.3 }}>
        Gaming news
      </h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSource(undefined)}
          style={{
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid',
            cursor: 'pointer',
            fontFamily: 'inherit',
            background: !activeSource ? '#f97316' : 'white',
            color: !activeSource ? 'white' : '#57534e',
            borderColor: !activeSource ? '#f97316' : 'rgba(0,0,0,.18)',
          }}
        >
          All sources
        </button>
        {sourcesData?.map((source) => (
          <button
            key={source}
            onClick={() => setActiveSource(source)}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid',
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: activeSource === source ? (SOURCE_COLORS[source] ?? '#f97316') : 'white',
              color: activeSource === source ? 'white' : '#57534e',
              borderColor:
                activeSource === source ? (SOURCE_COLORS[source] ?? '#f97316') : 'rgba(0,0,0,.18)',
            }}
          >
            {source}
          </button>
        ))}
      </div>

      {!isLoading && articles.length === 0 && (
        <p style={{ fontSize: 14, color: '#57534e' }}>No stories yet. Check back after the next fetch.</p>
      )}

      <div>
        {articles.map((article) => (
          <div
            key={article.id}
            style={{
              display: 'flex',
              gap: 14,
              padding: '14px 0',
              borderBottom: '1px solid rgba(0,0,0,.08)',
              alignItems: 'flex-start',
            }}
          >
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt=""
                style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    background: SOURCE_COLORS[article.source] ?? '#f97316',
                    color: 'white',
                  }}
                >
                  {article.source}
                </span>
                {article.game && (
                  <span style={{ fontSize: 11, color: '#f97316' }}>re: {article.game.title}</span>
                )}
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1c1917',
                  lineHeight: 1.4,
                  display: 'block',
                  marginBottom: 4,
                  textDecoration: 'none',
                }}
              >
                {article.title}
              </a>
              {article.description && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#57534e',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.description}
                </p>
              )}
              <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 5 }}>
                {formatDistanceToNow(new Date(article.publishedAt))} ago
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: 16,
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,.18)',
            background: 'white',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
            color: '#57534e',
          }}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
