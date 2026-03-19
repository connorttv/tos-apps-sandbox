/**
 * Instance store hooks — shared state between Settings and Render views.
 *
 * Each hook wraps `createUseInstanceStoreState` from the TelemetryOS SDK.
 * Returns `[isLoading, value, setValue]` — identical API in both views.
 *
 * The hooks below are common appearance settings included in every app.
 * Add app-specific hooks after the "App-specific" section marker.
 */

import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

// ── Appearance (common to all apps) ─────────────────────────────────────────

/** Controls rem scaling via useUiScaleToSetRem(). Range: 1-3. */
export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)

/** Multiplier for outer padding on the render container. Range: 0-3. */
export const usePagePaddingStoreState = createUseInstanceStoreState<number>('page-padding', 1)

/** Active theme key — must match a key in themes.ts. */
export const useThemeStoreState = createUseInstanceStoreState<string>('theme', 'telemetryos')

/** Entrance animation style: 'flip' | 'fade' | 'fade-in' | 'scale' | 'zoom' | 'slide' | 'drop' | 'bounce' | 'rise' | 'unfold' | 'blur' | 'glitch' | 'none'. */
export const useAnimationStoreState = createUseInstanceStoreState<string>('animation', 'flip')

/** When false, the render view uses a transparent background (for layering on devices). */
export const useShowBackgroundStoreState = createUseInstanceStoreState<boolean>('show-background', true)

// ── App-specific ────────────────────────────────────────────────────────────

import { ALL_CATEGORIES } from '../data/trivia'

/** Comma-separated list of active category keys. */
export const useSelectedCategoriesStoreState = createUseInstanceStoreState<string>(
  'selected-categories',
  ALL_CATEGORIES.join(','),
)

/** Seconds each trivia item is displayed (5-30). */
export const useTransitionSpeedStoreState = createUseInstanceStoreState<number>('transition-speed', 10)

/** Seconds before Q&A answer is revealed (2-15). */
export const useAnswerRevealDelayStoreState = createUseInstanceStoreState<number>('answer-reveal-delay', 5)

/** 'mixed' | 'facts' | 'qa' */
export const useContentModeStoreState = createUseInstanceStoreState<string>('content-mode', 'mixed')

/** Whether to show the optional source attribution line. */
export const useShowSourceStoreState = createUseInstanceStoreState<boolean>('show-source', false)

/** Card transition style: 'fade' | 'slide' | 'flip' | 'scale' */
export const useCardTransitionStoreState = createUseInstanceStoreState<string>('card-transition', 'fade')
