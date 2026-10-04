interface PlaytimeDisplayProps {
  steamMinutes?: number | null
  psnMinutes?: number | null
}

function minutesToHours(minutes: number): string {
  const hours = Math.round(minutes / 60)
  return hours === 1 ? '1h' : `${hours}h`
}

export function PlaytimeDisplay({ steamMinutes, psnMinutes }: PlaytimeDisplayProps) {
  const parts: string[] = []
  if (steamMinutes && steamMinutes > 0) parts.push(`${minutesToHours(steamMinutes)} on Steam`)
  if (psnMinutes && psnMinutes > 0) parts.push(`${minutesToHours(psnMinutes)} on PSN`)
  if (!parts.length) return null

  return (
    <p className="text-sm text-gray-500">
      🕐 {parts.join(' · ')}
    </p>
  )
}
