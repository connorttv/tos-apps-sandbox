/**
 * Settings view — configuration UI rendered inside the Studio admin portal.
 *
 * This view provides the standard appearance controls (theme, scale, padding,
 * animation, background toggle) that ship with every app.
 *
 * To add app-specific settings:
 *   1. Create store hooks in hooks/store.ts.
 *   2. Import and destructure them here alongside the existing hooks.
 *   3. Add their isLoading flags to the `isLoading` expression.
 *   4. Wrap your controls in a <SettingsSection title="Your Section">.
 *
 * Available SDK settings components:
 *   SettingsContainer, SettingsSection, SettingsDivider, SettingsHint,
 *   SettingsField, SettingsLabel,
 *   SettingsInputFrame, SettingsSelectFrame, SettingsSliderFrame,
 *   SettingsSwitchFrame, SettingsSwitchLabel,
 *   SettingsCheckboxFrame, SettingsCheckboxLabel
 *
 * SettingsSection is a collapsible accordion — use it to group related
 * controls under a heading. It manages its own open/closed state.
 * Always wrap new groups of settings in a SettingsSection.
 */

import {
  SettingsContainer,
  SettingsField,
  SettingsHint,
  SettingsInputFrame,
  SettingsLabel,
  SettingsSection,
  SettingsSelectFrame,
  SettingsSliderFrame,
  SettingsCheckboxFrame,
  SettingsCheckboxLabel,
} from '@telemetryos/sdk/react'
import {
  useThemeStoreState,
  useUiScaleStoreState,
  usePagePaddingStoreState,
  useAnimationStoreState,
  useShowBackgroundStoreState,
  useSubtitleStoreState,
} from '../hooks/store'
import { themes } from '../themes'

export function Settings() {
  const [isLoadingTheme, themeName, setThemeName] = useThemeStoreState()
  const [isLoadingScale, uiScale, setUiScale] = useUiScaleStoreState(5)
  const [isLoadingPadding, pagePadding, setPagePadding] = usePagePaddingStoreState()
  const [isLoadingAnim, animation, setAnimation] = useAnimationStoreState()
  const [isLoadingBg, showBackground, setShowBackground] = useShowBackgroundStoreState()
  const [isLoadingSubtitle, subtitle, setSubtitle] = useSubtitleStoreState(250)

  const isLoading = isLoadingTheme || isLoadingScale || isLoadingPadding || isLoadingAnim || isLoadingBg

  return (
    <SettingsContainer>
      {/* ── App-specific sections go here ─────────────────────────────── */}

      <SettingsSection title="Content">
        <SettingsField>
          <SettingsLabel>Subtitle Text</SettingsLabel>
          <SettingsInputFrame>
            <input
              type="text"
              placeholder="Enter a subtitle..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              disabled={isLoadingSubtitle}
            />
          </SettingsInputFrame>
          <SettingsHint>Displayed below the welcome title on the render view</SettingsHint>
        </SettingsField>
      </SettingsSection>

      {/* ── Appearance (common to all apps) ────────────────────────────── */}

      <SettingsSection title="Appearance">
        <SettingsField>
          <SettingsLabel>Theme</SettingsLabel>
          <SettingsSelectFrame>
            <select
              disabled={isLoading}
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
            >
              {Object.entries(themes).map(([key, theme]) => (
                <option key={key} value={key}>{theme.label}</option>
              ))}
            </select>
          </SettingsSelectFrame>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>UI Scale</SettingsLabel>
          <SettingsSliderFrame>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              disabled={isLoading}
              value={uiScale}
              onChange={(e) => setUiScale(parseFloat(e.target.value))}
            />
            <span>{uiScale}x</span>
          </SettingsSliderFrame>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>Padding</SettingsLabel>
          <SettingsSliderFrame>
            <input
              type="range"
              min={0}
              max={3}
              step={0.01}
              disabled={isLoading}
              value={pagePadding}
              onChange={(e) => setPagePadding(parseFloat(e.target.value))}
            />
            <span>{pagePadding}x</span>
          </SettingsSliderFrame>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>Entrance Animation</SettingsLabel>
          <SettingsSelectFrame>
            <select
              disabled={isLoading}
              value={animation}
              onChange={(e) => setAnimation(e.target.value)}
            >
              <option value="fade-in">Fade</option>
              <option value="fade">Fade Up</option>
              <option value="flip">Flip</option>
              <option value="unfold">Unfold</option>
              <option value="scale">Scale</option>
              <option value="zoom">Zoom</option>
              <option value="slide">Slide</option>
              <option value="drop">Drop</option>
              <option value="bounce">Bounce</option>
              <option value="rise">Rise</option>
              <option value="blur">Blur</option>
              <option value="glitch">Glitch</option>
              <option value="none">None</option>
            </select>
          </SettingsSelectFrame>
        </SettingsField>

        <SettingsField>
          <SettingsCheckboxFrame>
            <input type="checkbox" disabled={isLoading} checked={showBackground} onChange={(e) => setShowBackground(e.target.checked)} />
            <SettingsCheckboxLabel>Show Background</SettingsCheckboxLabel>
          </SettingsCheckboxFrame>
          <SettingsHint>Uncheck for a transparent background</SettingsHint>
        </SettingsField>
      </SettingsSection>
    </SettingsContainer>
  )
}
