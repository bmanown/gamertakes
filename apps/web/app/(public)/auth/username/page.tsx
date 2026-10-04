'use client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/Button'

export default function UsernamePage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const update = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      window.location.href = '/dashboard'
    },
    onError: (err) => setError(err.message),
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <form
        className="w-full max-w-sm space-y-6"
        onSubmit={(event) => {
          event.preventDefault()
          setError(null)
          update.mutate({ username })
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">Choose a username</h1>
          <p className="text-gray-500 text-sm mt-1">This is how other people will find you.</p>
        </div>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          minLength={3}
          maxLength={24}
          required
          placeholder="username"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={update.isPending || username.trim().length < 3}>
          {update.isPending ? 'Saving...' : 'Save and continue'}
        </Button>
      </form>
    </div>
  )
}
