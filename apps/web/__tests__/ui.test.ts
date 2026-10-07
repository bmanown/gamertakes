import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CriticScoreBadge } from '../components/ui/CriticScoreBadge'
import { Button } from '../components/ui/Button'
import { PasswordField } from '../components/ui/PasswordField'

describe('CriticScoreBadge', () => {
  it('renders a placeholder when there is no score', () => {
    const html = renderToStaticMarkup(createElement(CriticScoreBadge, { score: null }))
    expect(html).toContain('No critic score')
  })

  it('uses green for scores of 75 and up, yellow for 50-74, red below 50', () => {
    expect(renderToStaticMarkup(createElement(CriticScoreBadge, { score: 75 }))).toContain('bg-green-500')
    expect(renderToStaticMarkup(createElement(CriticScoreBadge, { score: 50 }))).toContain('bg-yellow-500')
    expect(renderToStaticMarkup(createElement(CriticScoreBadge, { score: 49 }))).toContain('bg-red-500')
  })

  it('shows the OpenCritic tier when provided', () => {
    const html = renderToStaticMarkup(createElement(CriticScoreBadge, { score: 93, tier: 'Mighty' }))
    expect(html).toContain('Mighty')
    expect(html).toContain('OpenCritic')
  })
})

describe('PasswordField', () => {
  it('starts hidden and offers a show-password control', () => {
    const html = renderToStaticMarkup(
      createElement(PasswordField, { value: 'secret', onChange: () => undefined }),
    )
    expect(html).toContain('type="password"')
    expect(html).toContain('Show password')
  })
})

describe('Button', () => {
  it('renders children and the primary brand classes by default', () => {
    const html = renderToStaticMarkup(createElement(Button, null, 'Save'))
    expect(html).toContain('Save')
    expect(html).toContain('bg-brand-500')
  })
})
