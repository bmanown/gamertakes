'use client'
import { signIn } from 'next-auth/react'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/ui/PasswordField'

function SignInForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(
    searchParams.get('error') === 'CredentialsSignin'
      ? 'That email or password did not work.'
      : null,
  )
  const [pending, setPending] = useState(false)

  async function submit() {
    setError(null)
    setPending(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false,
      })
      if (result?.error) {
        setError('That email or password did not work.')
        return
      }
      window.location.href = result?.url ?? '/dashboard'
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to your GamerTakes account</p>
      </div>

      <Button className="w-full" variant="secondary" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative text-center text-xs text-gray-400 bg-white px-2">or</div>
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" required />
        <PasswordField value={password} onChange={setPassword} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
