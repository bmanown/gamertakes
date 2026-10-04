import type { ComponentProps } from 'react'
import { ActivityItem } from './ActivityItem'

interface ActivityFeedProps {
  activities: ComponentProps<typeof ActivityItem>['activity'][]
  emptyMessage?: string
}

export function ActivityFeed({ activities, emptyMessage = 'No activity yet.' }: ActivityFeedProps) {
  if (activities.length === 0) {
    return <p className="text-gray-400 text-sm p-6 text-center">{emptyMessage}</p>
  }

  return (
    <div className="divide-y divide-gray-100">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
