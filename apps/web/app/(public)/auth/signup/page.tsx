'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/ui/PasswordField'
import { trpc } from '@/lib/trpc'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const signUp = trpc.users.signUp.useMutation()

  async function createAccount() {
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    try {
      await signUp.mutateAsync({ email, password })
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/auth/username',
        redirect: false,
      })
      if (result?.error) {
        setError('The account was created, but sign-in failed. Try signing in.')
        return
      }
      window.location.href = result?.url ?? '/auth/username'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start tracking games with friends</p>
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
            void createAccount()
          }}
        >
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" required />
          <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" type="submit" disabled={signUp.isPending}>
            {signUp.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-medium text-brand-600 hover:text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
