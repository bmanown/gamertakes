import { clsx } from 'clsx'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

export function Avatar({ src, alt, size = 'md' }: AvatarProps) {
  const initial = alt.trim().charAt(0).toUpperCase() || '?'

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={clsx('rounded-full object-cover', sizes[size])} />
    )
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-900',
        sizes[size]
      )}
      aria-label={alt}
    >
      {initial}
    </span>
  )
}
