import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CriticsSection } from '../components/game/CriticsSection'

describe('CriticsSection', () => {
  it('renders critic sources as external links', () => {
    const html = renderToStaticMarkup(createElement(CriticsSection, {
      links: [{ source: 'ign.com', title: 'Hades Review', url: 'https://ign.com/hades' }],
    }))
    expect(html).toContain('Critics')
    expect(html).toContain('ign.com')
    expect(html).toContain('https://ign.com/hades')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('noopener noreferrer')
  })

  it('renders nothing when there are no links', () => {
    const html = renderToStaticMarkup(createElement(CriticsSection, { links: [] }))
    expect(html).toBe('')
  })
})
