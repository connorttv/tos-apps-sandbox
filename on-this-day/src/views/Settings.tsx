import {
  SettingsContainer,
  SettingsField,
  SettingsHint,
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
  useShowEventsStoreState,
  useShowBirthsStoreState,
  useShowDeathsStoreState,
  useShowHolidaysStoreState,
  useRotationIntervalStoreState,
  useMaxTextLengthStoreState,
} from '../hooks/store'
import { themes } from '../themes'

export function Settings() {
  const [isLoadingTheme, themeName, setThemeName] = useThemeStoreState()
  const [isLoadingScale, uiScale, setUiScale] = useUiScaleStoreState(5)
  const [isLoadingPadding, pagePadding, setPagePadding] = usePagePaddingStoreState()
  const [isLoadingAnim, animation, setAnimation] = useAnimationStoreState()
  const [isLoadingBg, showBackground, setShowBackground] = useShowBackgroundStoreState()

  const [isLoadingEvents, showEvents, setShowEvents] = useShowEventsStoreState()
  const [isLoadingBirths, showBirths, setShowBirths] = useShowBirthsStoreState()
  const [isLoadingDeaths, showDeaths, setShowDeaths] = useShowDeathsStoreState()
  const [isLoadingHolidays, showHolidays, setShowHolidays] = useShowHolidaysStoreState()
  const [isLoadingInterval, rotationInterval, setRotationInterval] = useRotationIntervalStoreState(5)
  const [isLoadingMaxLen, maxTextLength, setMaxTextLength] = useMaxTextLengthStoreState(5)

  const isLoading = isLoadingTheme || isLoadingScale || isLoadingPadding || isLoadingAnim || isLoadingBg

  return (
    <SettingsContainer>
      {/* ── Content ────────────────────────────────────────────────────── */}

      <SettingsSection title="Content">
        <SettingsField>
          <SettingsLabel>Rotation Speed</SettingsLabel>
          <SettingsSliderFrame>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={rotationInterval}
              disabled={isLoadingInterval}
              onChange={(e) => setRotationInterval(parseInt(e.target.value, 10))}
            />
            <span>{rotationInterval}s</span>
          </SettingsSliderFrame>
          <SettingsHint>How long each fact displays before rotating</SettingsHint>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>Max Story Length</SettingsLabel>
          <SettingsSliderFrame>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={maxTextLength}
              disabled={isLoadingMaxLen}
              onChange={(e) => setMaxTextLength(parseInt(e.target.value, 10))}
            />
            <span>{maxTextLength}</span>
          </SettingsSliderFrame>
          <SettingsHint>Exclude stories longer than this many characters</SettingsHint>
        </SettingsField>
      </SettingsSection>

      {/* ── Categories ─────────────────────────────────────────────────── */}

      <SettingsSection title="Categories">
        <SettingsField>
          <SettingsCheckboxFrame>
            <input
              type="checkbox"
              checked={showEvents}
              disabled={isLoadingEvents}
              onChange={(e) => setShowEvents(e.target.checked)}
            />
            <SettingsCheckboxLabel>Historical Events</SettingsCheckboxLabel>
          </SettingsCheckboxFrame>
        </SettingsField>

        <SettingsField>
          <SettingsCheckboxFrame>
            <input
              type="checkbox"
              checked={showBirths}
              disabled={isLoadingBirths}
              onChange={(e) => setShowBirths(e.target.checked)}
            />
            <SettingsCheckboxLabel>Notable Births</SettingsCheckboxLabel>
          </SettingsCheckboxFrame>
        </SettingsField>

        <SettingsField>
          <SettingsCheckboxFrame>
            <input
              type="checkbox"
              checked={showDeaths}
              disabled={isLoadingDeaths}
              onChange={(e) => setShowDeaths(e.target.checked)}
            />
            <SettingsCheckboxLabel>Notable Deaths</SettingsCheckboxLabel>
          </SettingsCheckboxFrame>
        </SettingsField>

        <SettingsField>
          <SettingsCheckboxFrame>
            <input
              type="checkbox"
              checked={showHolidays}
              disabled={isLoadingHolidays}
              onChange={(e) => setShowHolidays(e.target.checked)}
            />
            <SettingsCheckboxLabel>Holidays &amp; Observances</SettingsCheckboxLabel>
          </SettingsCheckboxFrame>
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
