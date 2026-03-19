import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)

/** Seconds between switching to the next "On this day" event (0 = no rotation) */
export const useRotationIntervalStoreState = createUseInstanceStoreState<number>('rotation-interval', 15)

/** Wikipedia On This Day API category */
export type OnThisDayEventType = 'all' | 'selected' | 'events' | 'births' | 'deaths' | 'holidays'

/** Manually created event; image from Media SDK (mediaId). */
export interface ManualEvent {
  id: string
  year: string
  text: string
  tag?: string
  mediaId: string
}

export type WindowSource = 'api' | 'manual'

export interface OnThisDayWindow {
  id: string
  source: WindowSource
  eventType: OnThisDayEventType
  /** When source === 'manual', list of custom events (image from Media). */
  manualEvents?: ManualEvent[]
}

/** List of "windows" – each has its own theme (API) or manual events. At least one. */
export const useWindowsStoreState = createUseInstanceStoreState<OnThisDayWindow[]>('windows', [
  { id: '1', source: 'api', eventType: 'all' },
])

/** Folder ID in Media Library used to pick images for manual events (Settings image picker). */
export const useManualEventsMediaFolderIdState = createUseInstanceStoreState<string>(
  'manual-events-media-folder-id',
  ''
)

/** Seconds between switching to the next window (0 = do not rotate windows) */
export const useWindowRotationIntervalStoreState = createUseInstanceStoreState<number>(
  'window-rotation-interval',
  0
)
