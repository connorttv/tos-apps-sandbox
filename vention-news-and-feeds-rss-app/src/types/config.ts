/**
 * Transition style options for article rotation
 */
export type TransitionStyle = 'fade' | 'slide' | 'cut'

/**
 * Available transition styles array
 */
export const TRANSITION_STYLES: TransitionStyle[] = ['fade', 'slide', 'cut']

/**
 * App Configuration DTO - Represents the application settings and state
 */
export interface AppConfig {
  /** Array of selected feed IDs (sourceId values) */
  selectedFeeds: string[]
  /** Article display duration in seconds (5-60) */
  articleDurationSec: number
  /** Feed refresh interval in minutes (5-60) */
  refreshIntervalMin: number
  /** Transition style for article rotation */
  transitionStyle: TransitionStyle
}

/**
 * Default app configuration values
 */
export const DEFAULT_CONFIG: AppConfig = {
  selectedFeeds: [],
  articleDurationSec: 10,
  refreshIntervalMin: 15,
  transitionStyle: 'fade',
}
