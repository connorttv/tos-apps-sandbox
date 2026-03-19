import { useMemo } from 'react'
import './TimeAgo.css'

interface TimeAgoProps {
  /** Unix timestamp in milliseconds */
  timestamp: number
}

/**
 * TimeAgo - Displays relative timestamp (e.g., "2 hours ago")
 */
export function TimeAgo({ timestamp }: TimeAgoProps) {
  const timeAgo = useMemo(() => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    }
    if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    }
    return 'Just now'
  }, [timestamp])

  return (
    <div className="time-ago">
      <span className="time-ago__value">{timeAgo}</span>
    </div>
  )
}
