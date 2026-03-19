/**
 * Instance store hooks — shared state between Settings and Render views.
 *
 * Each hook wraps `createUseInstanceStoreState` from the TelemetryOS SDK.
 * Returns `[isLoading, value, setValue]` — identical API in both views.
 *
 * The hooks below are common appearance settings included in every app.
 * Add app-specific hooks after the "App-specific" section marker.
 */
/** Controls rem scaling via useUiScaleToSetRem(). Range: 1-3. */
export declare const useUiScaleStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
/** Multiplier for outer padding on the render container. Range: 0-3. */
export declare const usePagePaddingStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
/** Active theme key — must match a key in themes.ts. */
export declare const useThemeStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
/** Entrance animation style: 'flip' | 'fade' | 'fade-in' | 'scale' | 'zoom' | 'slide' | 'drop' | 'bounce' | 'rise' | 'unfold' | 'blur' | 'glitch' | 'none'. */
export declare const useAnimationStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
/** When false, the render view uses a transparent background (for layering on devices). */
export declare const useShowBackgroundStoreState: (debounceDelay?: number) => [boolean, boolean, import("react").Dispatch<import("react").SetStateAction<boolean>>];
/** Comma-separated list of active category keys. */
export declare const useSelectedCategoriesStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
/** Seconds each trivia item is displayed (5-30). */
export declare const useTransitionSpeedStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
/** Seconds before Q&A answer is revealed (2-15). */
export declare const useAnswerRevealDelayStoreState: (debounceDelay?: number) => [boolean, number, import("react").Dispatch<import("react").SetStateAction<number>>];
/** 'mixed' | 'facts' | 'qa' */
export declare const useContentModeStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
/** Whether to show the optional source attribution line. */
export declare const useShowSourceStoreState: (debounceDelay?: number) => [boolean, boolean, import("react").Dispatch<import("react").SetStateAction<boolean>>];
/** Card transition style: 'fade' | 'slide' | 'flip' | 'scale' */
export declare const useCardTransitionStoreState: (debounceDelay?: number) => [boolean, string, import("react").Dispatch<import("react").SetStateAction<string>>];
