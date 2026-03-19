import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video'

export interface Announcement {
  id: string
  title: string
  primaryMessage: string
  supportingText: string
  body: string
  backgroundType: BackgroundType
  backgroundSolidColor: string
  backgroundGradientFrom: string
  backgroundGradientTo: string
  backgroundMediaId: string
}

export type TransitionStyle = 'fade' | 'slide' | 'instant'

export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)

export const useAnnouncementsStoreState = createUseInstanceStoreState<Announcement[]>(
  'announcements',
  [
    {
      id: crypto.randomUUID?.() ?? '1',
      title: 'Welcome',
      primaryMessage: 'Your message here',
      supportingText: '',
      body: '',
      backgroundType: 'solid',
      backgroundSolidColor: '#1a1a2e',
      backgroundGradientFrom: '#16213e',
      backgroundGradientTo: '#0f3460',
      backgroundMediaId: '',
    },
  ]
)

export const useRotationDurationStoreState = createUseInstanceStoreState<number>(
  'rotation-duration',
  15
)

export const useTransitionStyleStoreState = createUseInstanceStoreState<TransitionStyle>(
  'transition-style',
  'fade'
)

export const useShowProgressIndicatorStoreState = createUseInstanceStoreState<boolean>(
  'show-progress-indicator',
  true
)

export const useBackgroundMediaFolderIdStoreState = createUseInstanceStoreState<string>(
  'background-media-folder-id',
  ''
)
