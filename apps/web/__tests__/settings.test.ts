import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { getIntegrationStatus } = vi.hoisted(() => ({
  getIntegrationStatus: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}))

vi.mock('@/lib/trpc', () => ({
  trpc: {
    integrations: {
      getIntegrationStatus: { useQuery: getIntegrationStatus },
      connectSteam: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      syncSteam: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      connectPSN: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      syncPSN: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}))

describe('SettingsPage', () => {
  it('links to platform integrations', async () => {
    const { default: SettingsPage } = await import('../app/(auth)/settings/page')
    const html = renderToStaticMarkup(createElement(SettingsPage))
    expect(html).toContain('Settings')
    expect(html).toContain('/settings/integrations')
    expect(html).toContain('Platform Integrations')
  })
})

describe('IntegrationsPage', () => {
  it('shows Steam and PSN connect fields when disconnected', async () => {
    getIntegrationStatus.mockReturnValue({ data: { steam: false, psn: false }, refetch: vi.fn() })
    const { default: IntegrationsPage } = await import('../app/(auth)/settings/integrations/page')
    const html = renderToStaticMarkup(createElement(IntegrationsPage))
    expect(html).toContain('Platform Integrations')
    expect(html).toContain('Connect Steam')
    expect(html).toContain('Steam ID (17 digits) or vanity URL')
    expect(html).toContain('Connect PSN')
    expect(html).toContain('NPSSO Token')
    expect(html).not.toContain('Sync Now')
  })

  it('shows Connected and Sync Now when both platforms are linked', async () => {
    getIntegrationStatus.mockReturnValue({ data: { steam: true, psn: true }, refetch: vi.fn() })
    const { default: IntegrationsPage } = await import('../app/(auth)/settings/integrations/page')
    const html = renderToStaticMarkup(createElement(IntegrationsPage))
    expect(html).toContain('Connected')
    expect(html).toContain('Sync Now')
    expect(html).not.toContain('Connect Steam')
    expect(html).not.toContain('Connect PSN')
  })
})
