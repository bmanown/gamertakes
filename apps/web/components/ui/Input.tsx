import { clsx } from 'clsx'
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, id, className, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-gray-700" htmlFor={id}>
      {label && <span className="font-medium">{label}</span>}
      <input
        id={id}
        className={clsx(
          'rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500',
          className
        )}
        {...props}
      />
    </label>
  )
}
