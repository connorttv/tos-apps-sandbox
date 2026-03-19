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

export const useSubtitleStoreState = createUseInstanceStoreState<string>('subtitle', 'Change this line in settings ⚙️ ↗️')

// Add your app's store hooks here. Example:
//
//   export const useCityIdStoreState = createUseInstanceStoreState<number | null>('city-id', null)
//   export const useUnitsStoreState = createUseInstanceStoreState<'imperial' | 'metric'>('units', 'metric')
