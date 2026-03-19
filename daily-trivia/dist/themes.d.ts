/**
 * Theme definitions shared across all TelemetryOS apps.
 *
 * Each theme provides a complete color palette and font family.
 * Colors map to CSS custom properties in Render.css via `applyThemeVars()`.
 *
 * To add a theme:
 *   1. Add a new key to the ThemeName union.
 *   2. Add the corresponding entry to the `themes` record.
 *   3. If the theme needs special CSS effects (like the-matrix scanlines),
 *      add a `render--{name}` modifier in Render.css and register it
 *      in the `themeModifier` map in Render.tsx.
 */
/** Union of all available theme keys. */
export type ThemeName = 'telemetryos' | 'neon-pulse' | 'solar-flare' | 'arctic-aurora' | 'emerald-matrix' | 'the-matrix' | 'plain-light' | 'plain-dark';
/**
 * Color tokens used by Render.css via CSS custom properties.
 *
 * bg*      — full-page gradient background
 * card*    — primary "hero" card gradient + shadow
 * primary  — main text color
 * secondary — subdued text (subtitles, dates)
 * muted    — lowest-emphasis text (labels, hints)
 * accent   — highlight color (icons, emphasis)
 * cardBg   — translucent fill for detail/section cards
 * cardBorder — subtle border for detail/section cards
 * statusGood — positive status indicators
 */
export interface ThemeColors {
    bgStart: string;
    bgMid: string;
    bgEnd: string;
    cardStart: string;
    cardMid1: string;
    cardMid2: string;
    cardEnd: string;
    cardShadow: string;
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
    cardBg: string;
    cardBorder: string;
    statusGood: string;
}
export interface Theme {
    /** Display name shown in the settings theme picker. */
    label: string;
    /** CSS font-family value. Must have a matching @import in index.html. */
    fontFamily: string;
    colors: ThemeColors;
}
export declare const themes: Record<ThemeName, Theme>;
