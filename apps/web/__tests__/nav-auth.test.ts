import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const sessionState = vi.hoisted(() => ({ session: null as { user: { id: string; username: string } } | null }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}))

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: sessionState.session }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/trpc', () => ({
  trpc: {
    users: {
      updateProfile: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}))

describe('Navbar', () => {
  it('shows Sign In and Sign Up when signed out', async () => {
    sessionState.session = null
    const { Navbar } = await import('../components/layout/Navbar')
    const html = renderToStaticMarkup(createElement(Navbar))
    expect(html).toContain('GamerTakes')
    expect(html).toContain('/auth/signin')
    expect(html).toContain('Sign In')
    expect(html).toContain('/auth/signup')
    expect(html).toContain('Sign Up')
    expect(html).toContain('Search games...')
    expect(html).toContain('/news')
    expect(html).toContain('News')
  })

  it('shows library, dashboard, and Sign Out when signed in', async () => {
    sessionState.session = { user: { id: 'u1', username: 'brian' } }
    const { Navbar } = await import('../components/layout/Navbar')
    const html = renderToStaticMarkup(createElement(Navbar))
    expect(html).toContain('/dashboard')
    expect(html).toContain('/library')
    expect(html).toContain('/users/brian')
    expect(html).toContain('Sign Out')
  })
})

describe('SignInPage', () => {
  it('renders Google and credentials sign-in', async () => {
    const { default: SignInPage } = await import('../app/(public)/auth/signin/page')
    const html = renderToStaticMarkup(createElement(SignInPage))
    expect(html).toContain('Welcome back')
    expect(html).toContain('Continue with Google')
    expect(html).toContain('Email')
    expect(html).toContain('Password')
    expect(html).toContain('Sign In')
  })
})

describe('UsernamePage', () => {
  it('asks the user to choose a username', async () => {
    const { default: UsernamePage } = await import('../app/(public)/auth/username/page')
    const html = renderToStaticMarkup(createElement(UsernamePage))
    expect(html).toContain('Choose a username')
    expect(html).toContain('Save and continue')
  })
})
