/**
 * Render view — the display content shown on physical signage devices.
 *
 * This template provides the shared scaffolding that every app needs:
 *   - Theme system (8 themes with CSS custom properties)
 *   - Responsive density tiers (full / comfortable / compact / minimal)
 *   - Entrance animations (14 presets)
 *   - Page padding and UI scale controls
 *   - Background toggle (gradient or transparent for layering)
 *   - Portrait/landscape detection
 *
 * Layout building blocks (CSS classes with entrance animation support):
 *   .content-header   — top-level header bar (title + subtitle)
 *   .content-card     — primary hero card with gradient background
 *   .detail-grid      — grid container for detail cards
 *   .detail-card      — small info cards (icon + value + label)
 *   .content-section  — secondary section (footer bar, list, etc.)
 *
 * To build your app:
 *   1. Add store hooks in hooks/store.ts and import them here.
 *   2. Add their isLoading flags to `isStoreLoading`.
 *   3. Replace the welcome content below with your layout using the classes above.
 *   4. Use `density` and `isPortrait` to adapt your layout to available space.
 */

import { useUiScaleToSetRem, useUiAspectRatio } from '@telemetryos/sdk/react'
import {
  useThemeStoreState,
  useUiScaleStoreState,
  usePagePaddingStoreState,
  useAnimationStoreState,
  useShowBackgroundStoreState,
  useSubtitleStoreState,
} from '../hooks/store'
import { themes, type ThemeName, type Theme } from '../themes'
import './Render.css'

/** Maps a Theme's color tokens to CSS custom properties consumed by Render.css. */
function applyThemeVars(theme: Theme) {
  const c = theme.colors
  return {
    '--bg-start': c.bgStart,
    '--bg-mid': c.bgMid,
    '--bg-end': c.bgEnd,
    '--card-start': c.cardStart,
    '--card-mid1': c.cardMid1,
    '--card-mid2': c.cardMid2,
    '--card-end': c.cardEnd,
    '--card-shadow': c.cardShadow,
    '--primary': c.primary,
    '--secondary': c.secondary,
    '--muted': c.muted,
    '--accent': c.accent,
    '--card-bg': c.cardBg,
    '--card-border': c.cardBorder,
    '--status-good': c.statusGood,
    '--font-family': theme.fontFamily,
  } as React.CSSProperties
}

/**
 * Density tiers control spacing, font sizes, and which elements are visible.
 * Determined by UI scale combined with aspect ratio (portrait needs more room).
 */
type Density = 'full' | 'comfortable' | 'compact' | 'minimal'

function getDensity(uiScale: number, aspectRatio: number): Density {
  const isPortrait = aspectRatio < 1
  const pressure = uiScale * (isPortrait ? 1.2 : 1)
  if (pressure < 1.4) return 'full'
  if (pressure < 1.8) return 'comfortable'
  if (pressure < 2.3) return 'compact'
  return 'minimal'
}

export function Render() {
  // ── Store state ──────────────────────────────────────────────────────────
  const [isLoadingScale, uiScale] = useUiScaleStoreState()
  const [isLoadingPadding, pagePadding] = usePagePaddingStoreState()
  const [isLoadingTheme, themeName] = useThemeStoreState()
  const [isLoadingAnim, animation] = useAnimationStoreState()
  const [isLoadingBg, showBackground] = useShowBackgroundStoreState()
  const [isLoadingSubtitle, subtitle] = useSubtitleStoreState()
  const aspectRatio = useUiAspectRatio()

  // Drives rem scaling: html font-size = base * uiScale
  useUiScaleToSetRem(uiScale)

  // ── Loading gate — render nothing until all store values are available ───
  const isStoreLoading = isLoadingScale || isLoadingPadding || isLoadingTheme || isLoadingAnim || isLoadingBg || isLoadingSubtitle
  if (isStoreLoading) return null

  // ── Derived layout state ─────────────────────────────────────────────────
  const resolvedName = (Object.prototype.hasOwnProperty.call(themes, themeName) ? themeName : 'telemetryos') as ThemeName
  const theme = themes[resolvedName]
  const isPortrait = aspectRatio < 1
  const density = getDensity(uiScale, aspectRatio)

  // Themes that need special CSS overlays register their modifier class here.
  const themeModifier: Record<string, string> = {
    'telemetryos': 'render--telemetryos',
    'neon-pulse': 'render--neon-pulse',
    'solar-flare': 'render--solar-flare',
    'emerald-matrix': 'render--emerald-matrix',
    'arctic-aurora': 'render--arctic-aurora',
    'the-matrix': 'render--the-matrix',
    'plain-light': 'render--plain',
    'plain-dark': 'render--plain',
  }

  const animClass = `anim--${animation}`
  const layoutClasses = [
    'render',
    themeModifier[resolvedName] ?? '',
    isPortrait ? 'render--portrait' : '',
    `render--${density}`,
    animClass,
    showBackground ? '' : 'render--no-bg',
  ].filter(Boolean).join(' ')

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div key={animation} className={layoutClasses} style={{ ...applyThemeVars(theme), '--page-padding': pagePadding } as React.CSSProperties}>
      {/* Theme-specific background effects */}
      {showBackground && resolvedName === 'telemetryos' && <div className="tos-sweep" />}
      {showBackground && resolvedName === 'neon-pulse' && (
        <div className="neon-pulse-bg">
          <div className="neon-pulse-bg__orb" />
          <div className="neon-pulse-bg__orb" />
          <div className="neon-pulse-bg__orb" />
        </div>
      )}
      {showBackground && resolvedName === 'solar-flare' && <div className="solar-flare-bg" />}
      {showBackground && resolvedName === 'arctic-aurora' && <div className="arctic-aurora-bg" />}
      {showBackground && resolvedName === 'the-matrix' && <div className="matrix-scanlines" />}

      {/* ── Welcome content (replace with your app) ─────────────────────── */}

      <img src={resolvedName === 'plain-light' ? '/assets/telemetryos-wordmark-dark.svg' : '/assets/telemetryos-wordmark.svg'} alt="TelemetryOS" className="render__logo" />

      <div className="render__hero">
        {density !== 'minimal' && (
          <div className="render__hero-title">Welcome to TelemetryOS SDK</div>
        )}
        <div className="render__hero-subtitle">{subtitle}</div>
      </div>

      <div className="render__docs-information">
        {density === 'full' && (
          <>
            <div className="render__docs-information-title">
              To get started, edit the Render.tsx and Settings.tsx files
            </div>
            <div className="render__docs-information-text">
              Visit our documentation on building applications to learn more
            </div>
          </>
        )}
        {(density === 'full' || density === 'comfortable') && (
          <a
            className="render__docs-information-button"
            href="https://docs.telemetryos.com/docs/sdk-getting-started"
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </a>
        )}
      </div>
    </div>
  )
}
