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
  useSelectedCategoriesStoreState,
  useTransitionSpeedStoreState,
  useAnswerRevealDelayStoreState,
  useContentModeStoreState,
  useShowSourceStoreState,
  useCardTransitionStoreState,
} from '../hooks/store'
import { themes } from '../themes'
import { ALL_CATEGORIES, CATEGORY_LABELS, type Category } from '../data/trivia'

export function Settings() {
  const [isLoadingTheme, themeName, setThemeName] = useThemeStoreState()
  const [isLoadingScale, uiScale, setUiScale] = useUiScaleStoreState(5)
  const [isLoadingPadding, pagePadding, setPagePadding] = usePagePaddingStoreState()
  const [isLoadingAnim, animation, setAnimation] = useAnimationStoreState()
  const [isLoadingBg, showBackground, setShowBackground] = useShowBackgroundStoreState()
  const [isLoadingCategories, selectedCategoriesRaw, setSelectedCategoriesRaw] = useSelectedCategoriesStoreState()
  const [isLoadingSpeed, transitionSpeed, setTransitionSpeed] = useTransitionSpeedStoreState()
  const [isLoadingReveal, answerRevealDelay, setAnswerRevealDelay] = useAnswerRevealDelayStoreState()
  const [isLoadingMode, contentMode, setContentMode] = useContentModeStoreState()
  const [isLoadingSource, showSource, setShowSource] = useShowSourceStoreState()
  const [isLoadingTransition, cardTransition, setCardTransition] = useCardTransitionStoreState()

  const isLoading = isLoadingTheme || isLoadingScale || isLoadingPadding || isLoadingAnim || isLoadingBg

  const selectedCategories = selectedCategoriesRaw.split(',').filter(Boolean)

  function toggleCategory(cat: Category) {
    const current = new Set(selectedCategories)
    if (current.has(cat)) {
      // Prevent unchecking all
      if (current.size <= 1) return
      current.delete(cat)
    } else {
      current.add(cat)
    }
    setSelectedCategoriesRaw(Array.from(current).join(','))
  }

  return (
    <SettingsContainer>
      {/* ── Trivia Content ─────────────────────────────────────────────── */}

      <SettingsSection title="Trivia Content">
        <SettingsField>
          <SettingsLabel>Content Type</SettingsLabel>
          <SettingsSelectFrame>
            <select
              disabled={isLoadingMode}
              value={contentMode}
              onChange={(e) => setContentMode(e.target.value)}
            >
              <option value="mixed">Mixed</option>
              <option value="facts">Facts Only</option>
              <option value="qa">Q&A Only</option>
            </select>
          </SettingsSelectFrame>
          <SettingsHint>Choose what types of trivia to display</SettingsHint>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>Categories</SettingsLabel>
          {ALL_CATEGORIES.map((cat) => (
            <SettingsCheckboxFrame key={cat}>
              <input
                type="checkbox"
                disabled={isLoadingCategories}
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              <SettingsCheckboxLabel>{CATEGORY_LABELS[cat]}</SettingsCheckboxLabel>
            </SettingsCheckboxFrame>
          ))}
          <SettingsHint>At least one category must be selected</SettingsHint>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>Display Duration</SettingsLabel>
          <SettingsSliderFrame>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              disabled={isLoadingSpeed}
              value={transitionSpeed}
              onChange={(e) => setTransitionSpeed(parseInt(e.target.value, 10))}
            />
            <span>{transitionSpeed}s</span>
          </SettingsSliderFrame>
          <SettingsHint>How long each trivia item is displayed</SettingsHint>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>Answer Reveal Delay</SettingsLabel>
          <SettingsSliderFrame>
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              disabled={isLoadingReveal}
              value={answerRevealDelay}
              onChange={(e) => setAnswerRevealDelay(parseInt(e.target.value, 10))}
            />
            <span>{answerRevealDelay}s</span>
          </SettingsSliderFrame>
          <SettingsHint>When the answer appears for Q&A items</SettingsHint>
        </SettingsField>

        <SettingsField>
          <SettingsLabel>Card Transition</SettingsLabel>
          <SettingsSelectFrame>
            <select
              disabled={isLoadingTransition}
              value={cardTransition}
              onChange={(e) => setCardTransition(e.target.value)}
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="flip">Flip</option>
              <option value="scale">Scale</option>
            </select>
          </SettingsSelectFrame>
          <SettingsHint>Animation style between trivia items</SettingsHint>
        </SettingsField>

        <SettingsField>
          <SettingsCheckboxFrame>
            <input
              type="checkbox"
              disabled={isLoadingSource}
              checked={showSource}
              onChange={(e) => setShowSource(e.target.checked)}
            />
            <SettingsCheckboxLabel>Show Source</SettingsCheckboxLabel>
          </SettingsCheckboxFrame>
          <SettingsHint>Display source attribution when available</SettingsHint>
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
