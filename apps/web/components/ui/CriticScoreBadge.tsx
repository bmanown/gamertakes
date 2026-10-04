import { clsx } from 'clsx'

interface CriticScoreBadgeProps {
  score: number | null
  tier?: string | null
}

export function CriticScoreBadge({ score, tier }: CriticScoreBadgeProps) {
  if (score === null) return <span className="text-sm text-gray-400">No critic score</span>

  const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <span className={clsx('inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white', color)}>
        {Math.round(score)}
      </span>
      {tier && <span className="text-sm text-gray-600">{tier} · OpenCritic</span>}
    </div>
  )
}
