'use client'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  autoComplete?: string
}

export function PasswordField({
  value,
  onChange,
  placeholder = 'Password',
  id,
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm"
      />
      <button
        type="button"
        onClick={() => setVisible((open) => !open)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  )
}
