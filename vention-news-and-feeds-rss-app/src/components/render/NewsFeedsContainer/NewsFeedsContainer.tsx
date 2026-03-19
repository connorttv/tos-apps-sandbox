import { useUiScaleToSetRem } from '@telemetryos/sdk/react'
import { useMemo } from 'react'
import type { AppConfig } from '../../../types'
import './NewsFeedsContainer.css'

interface NewsFeedsContainerProps {
  /** UI scale value from SDK */
  uiScale: number
  /** App configuration */
  config: AppConfig
  /** Whether data is currently loading */
  isLoading?: boolean
  /** Children to render inside the container */
  children?: React.ReactNode
}

/**
 * NewsFeedsContainer - Main wrapper component for the news feeds render view
 * 
 * Handles:
 * - UI scaling setup for responsive signage display
 * - Container structure and layout
 * - Base styling and safe zones
 */
export function NewsFeedsContainer({
  uiScale,
  config,
  isLoading = false,
  children,
}: NewsFeedsContainerProps) {
  // Apply UI scaling at the root level
  useUiScaleToSetRem(uiScale)

  // Memoize container class names
  const containerClassName = useMemo(() => {
    const classes = ['news-feeds-container']
    if (isLoading) {
      classes.push('news-feeds-container--loading')
    }
    return classes.join(' ')
  }, [isLoading])

  return (
    <div className={containerClassName}>
      {children}
    </div>
  )
}
