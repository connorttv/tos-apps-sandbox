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
export type ThemeName = 'telemetryos' | 'neon-pulse' | 'solar-flare' | 'arctic-aurora' | 'emerald-matrix' | 'the-matrix' | 'plain-light' | 'plain-dark'

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
  bgStart: string
  bgMid: string
  bgEnd: string
  cardStart: string
  cardMid1: string
  cardMid2: string
  cardEnd: string
  cardShadow: string
  primary: string
  secondary: string
  muted: string
  accent: string
  cardBg: string
  cardBorder: string
  statusGood: string
}

export interface Theme {
  /** Display name shown in the settings theme picker. */
  label: string
  /** CSS font-family value. Must have a matching @import in index.html. */
  fontFamily: string
  colors: ThemeColors
}

export const themes: Record<ThemeName, Theme> = {
  telemetryos: {
    label: 'TelemetryOS',
    fontFamily: '"Rubik", sans-serif',
    colors: {
      bgStart: '#1E2D3D',
      bgMid: '#172433',
      bgEnd: '#111D29',
      cardStart: '#7A4A00',
      cardMid1: '#A66800',
      cardMid2: '#D49320',
      cardEnd: '#F8B334',
      cardShadow: 'rgba(248, 179, 52, 0.33)',
      primary: '#EEE9DF',
      secondary: '#B8B3A9',
      muted: '#8A8477',
      accent: '#F8B334',
      cardBg: 'rgba(238, 233, 223, 0.03)',
      cardBorder: 'rgba(238, 233, 223, 0.06)',
      statusGood: '#4ADE80',
    },
  },
  'neon-pulse': {
    label: 'Neon Pulse',
    fontFamily: '"Orbitron", sans-serif',
    colors: {
      bgStart: '#050A15',
      bgMid: '#0A1020',
      bgEnd: '#0D1428',
      cardStart: '#004D40',
      cardMid1: '#00695C',
      cardMid2: '#00897B',
      cardEnd: '#00BCD4',
      cardShadow: 'rgba(0, 229, 255, 0.33)',
      primary: '#E0F7FA',
      secondary: '#80CBC4',
      muted: '#4DB6AC',
      accent: '#00E5FF',
      cardBg: 'rgba(0, 229, 255, 0.03)',
      cardBorder: 'rgba(0, 229, 255, 0.06)',
      statusGood: '#69F0AE',
    },
  },
  'solar-flare': {
    label: 'Solar Flare',
    fontFamily: '"Bebas Neue", sans-serif',
    colors: {
      bgStart: '#1A0A0A',
      bgMid: '#1F0E0E',
      bgEnd: '#150808',
      cardStart: '#BF360C',
      cardMid1: '#D84315',
      cardMid2: '#F4511E',
      cardEnd: '#FF6D00',
      cardShadow: 'rgba(255, 109, 0, 0.33)',
      primary: '#FFF3E0',
      secondary: '#BCAAA4',
      muted: '#8D6E63',
      accent: '#FF6D00',
      cardBg: 'rgba(255, 109, 0, 0.03)',
      cardBorder: 'rgba(255, 109, 0, 0.06)',
      statusGood: '#FFD54F',
    },
  },
  'arctic-aurora': {
    label: 'Arctic Aurora',
    fontFamily: '"Inter", sans-serif',
    colors: {
      bgStart: '#0A1628',
      bgMid: '#0E1D32',
      bgEnd: '#081220',
      cardStart: '#1A237E',
      cardMid1: '#283593',
      cardMid2: '#3949AB',
      cardEnd: '#5C6BC0',
      cardShadow: 'rgba(66, 165, 245, 0.33)',
      primary: '#E3F2FD',
      secondary: '#90A4AE',
      muted: '#607D8B',
      accent: '#42A5F5',
      cardBg: 'rgba(66, 165, 245, 0.03)',
      cardBorder: 'rgba(66, 165, 245, 0.06)',
      statusGood: '#80DEEA',
    },
  },
  'emerald-matrix': {
    label: 'Emerald Matrix',
    fontFamily: '"Space Grotesk", sans-serif',
    colors: {
      bgStart: '#0A1A0E',
      bgMid: '#0F1F12',
      bgEnd: '#081509',
      cardStart: '#1B5E20',
      cardMid1: '#2E7D32',
      cardMid2: '#388E3C',
      cardEnd: '#43A047',
      cardShadow: 'rgba(0, 230, 118, 0.33)',
      primary: '#E8F5E9',
      secondary: '#A5D6A7',
      muted: '#66BB6A',
      accent: '#00E676',
      cardBg: 'rgba(0, 230, 118, 0.03)',
      cardBorder: 'rgba(0, 230, 118, 0.06)',
      statusGood: '#B9F6CA',
    },
  },
  'the-matrix': {
    label: 'The Matrix',
    fontFamily: '"VT323", monospace',
    colors: {
      bgStart: '#000000',
      bgMid: '#000800',
      bgEnd: '#001000',
      cardStart: '#002800',
      cardMid1: '#003800',
      cardMid2: '#004A00',
      cardEnd: '#005C00',
      cardShadow: 'rgba(0, 255, 65, 0.3)',
      primary: '#00FF41',
      secondary: '#00CC33',
      muted: '#008822',
      accent: '#00FF41',
      cardBg: 'rgba(0, 255, 65, 0.03)',
      cardBorder: 'rgba(0, 255, 65, 0.1)',
      statusGood: '#00FF41',
    },
  },
  'plain-light': {
    label: 'Plain Light',
    fontFamily: '"Inter", sans-serif',
    colors: {
      bgStart: '#ffffff',
      bgMid: '#ffffff',
      bgEnd: '#ffffff',
      cardStart: 'transparent',
      cardMid1: 'transparent',
      cardMid2: 'transparent',
      cardEnd: 'transparent',
      cardShadow: 'transparent',
      primary: '#1a1a1a',
      secondary: '#444444',
      muted: '#777777',
      accent: '#F8B334',
      cardBg: 'transparent',
      cardBorder: 'transparent',
      statusGood: '#16a34a',
    },
  },
  'plain-dark': {
    label: 'Plain Dark',
    fontFamily: '"Inter", sans-serif',
    colors: {
      bgStart: 'transparent',
      bgMid: 'transparent',
      bgEnd: 'transparent',
      cardStart: 'transparent',
      cardMid1: 'transparent',
      cardMid2: 'transparent',
      cardEnd: 'transparent',
      cardShadow: 'transparent',
      primary: '#ffffff',
      secondary: '#cccccc',
      muted: '#999999',
      accent: '#dddddd',
      cardBg: 'transparent',
      cardBorder: 'transparent',
      statusGood: '#4ade80',
    },
  },
}
