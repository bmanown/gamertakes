'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ReviewFormProps {
  onSubmit: (body: string, containsSpoilers: boolean) => void
  isSubmitting?: boolean
}

export function ReviewForm({ onSubmit, isSubmitting }: ReviewFormProps) {
  const [body, setBody] = useState('')
  const [containsSpoilers, setContainsSpoilers] = useState(false)

  return (
    <form
      className="space-y-3 rounded-xl border border-gray-100 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(body, containsSpoilers)
      }}
    >
      <label className="block">
        <span className="sr-only">Review</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          minLength={10}
          required
          placeholder="What did you think? (10 characters minimum)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={containsSpoilers}
            onChange={(event) => setContainsSpoilers(event.target.checked)}
            className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          Contains spoilers
        </label>
        <Button type="submit" size="sm" disabled={isSubmitting || body.trim().length < 10}>
          Post review
        </Button>
      </div>
    </form>
  )
}
