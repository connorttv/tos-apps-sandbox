import { useState, useEffect } from 'react'
import { useUiScaleToSetRem, useUiAspectRatio } from '@telemetryos/sdk/react'
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
import { themes, type ThemeName, type Theme } from '../themes'
import { useTriviaRotation } from '../hooks/use-trivia-rotation'
import { TriviaCard } from '../components/TriviaCard'
import { ALL_CATEGORIES, CATEGORY_LABELS, type Category } from '../data/trivia'
import './Render.css'

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
  const [isLoadingCategories, selectedCategoriesRaw] = useSelectedCategoriesStoreState()
  const [isLoadingSpeed, transitionSpeed] = useTransitionSpeedStoreState()
  const [isLoadingReveal, answerRevealDelay] = useAnswerRevealDelayStoreState()
  const [isLoadingMode, contentMode] = useContentModeStoreState()
  const [isLoadingSource, showSource] = useShowSourceStoreState()
  const [isLoadingTransition, cardTransition] = useCardTransitionStoreState()
  const aspectRatio = useUiAspectRatio()

  useUiScaleToSetRem(uiScale)

  // ── Loading gate ─────────────────────────────────────────────────────────
  const isStoreLoading =
    isLoadingScale || isLoadingPadding || isLoadingTheme || isLoadingAnim || isLoadingBg ||
    isLoadingCategories || isLoadingSpeed || isLoadingReveal || isLoadingMode ||
    isLoadingSource || isLoadingTransition
  if (isStoreLoading) return null

  // ── Derived layout state ─────────────────────────────────────────────────
  const resolvedName = (Object.prototype.hasOwnProperty.call(themes, themeName) ? themeName : 'telemetryos') as ThemeName
  const theme = themes[resolvedName]
  const isPortrait = aspectRatio < 1
  const density = getDensity(uiScale, aspectRatio)

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

  // ── Parse categories ─────────────────────────────────────────────────────
  const selectedCategories = selectedCategoriesRaw
    .split(',')
    .filter((c): c is Category => ALL_CATEGORIES.includes(c as Category))

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

      {/* ── Trivia Display ─────────────────────────────────────────────── */}
      <TriviaContent
        selectedCategories={selectedCategories}
        contentMode={contentMode}
        transitionSpeed={transitionSpeed}
        answerRevealDelay={answerRevealDelay}
        showSource={showSource}
        cardTransition={cardTransition}
        density={density}
        isPortrait={isPortrait}
      />
    </div>
  )
}

/**
 * Inner component that calls hooks unconditionally.
 * Separated so the parent can gate on loading without violating rules of hooks.
 */
function TriviaContent({
  selectedCategories,
  contentMode,
  transitionSpeed,
  answerRevealDelay,
  showSource,
  cardTransition,
  density,
  isPortrait,
}: {
  selectedCategories: Category[]
  contentMode: string
  transitionSpeed: number
  answerRevealDelay: number
  showSource: boolean
  cardTransition: string
  density: Density
  isPortrait: boolean
}) {
  const { currentItem, showAnswer, phase, index, queueLength } = useTriviaRotation({
    selectedCategories,
    contentMode,
    transitionSpeed,
    answerRevealDelay,
  })

  // Countdown timer — ticks every second from transitionSpeed to 0
  const [countdown, setCountdown] = useState(transitionSpeed)
  useEffect(() => {
    setCountdown(transitionSpeed)
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [currentItem?.id, transitionSpeed]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentItem) {
    return (
      <div className="trivia-container">
        <p style={{ color: 'var(--secondary)', fontSize: '2rem' }}>No trivia items match the current filters.</p>
      </div>
    )
  }

  const isFact = currentItem.type === 'fact'
  const timerLabel = isFact ? 'Next fact in' : (showAnswer ? 'Next question in' : 'Answer reveals in')
  const animationName =
    phase === 'entering' ? `trivia-${cardTransition}-in`
    : phase === 'exiting' ? `trivia-${cardTransition}-out`
    : 'none'
  const phaseClass = phase === 'entering' ? 'trivia-entering' : phase === 'exiting' ? 'trivia-exiting' : ''

  return (
    <>
      {/* ── Top bar ── */}
      <div className="trivia-top-bar">
        <div className="trivia-category-badge">
          <span className="trivia-category-badge__label">{CATEGORY_LABELS[currentItem.category]}</span>
        </div>
        {density !== 'minimal' && (
          <span className="trivia-counter">{index + 1} / {queueLength}</span>
        )}
      </div>

      {/* ── Content area ── */}
      <div className="trivia-container">
        <div
          className={`trivia-content ${phaseClass}`}
          key={currentItem.id}
          style={{ animationName }}
        >
          <TriviaCard
            item={currentItem}
            showAnswer={showAnswer}
            showSource={showSource}
            density={density}
            isPortrait={isPortrait}
          />
        </div>
      </div>

      {/* ── Timer section ── */}
      <div className="trivia-timer">
        <div className="trivia-timer__labels">
          <span className="trivia-timer__label">{timerLabel}</span>
          <span className="trivia-timer__count">{countdown}s</span>
        </div>
        <div className="trivia-timer__track">
          <div
            className="trivia-timer__fill"
            key={currentItem.id}
            style={{ animationDuration: `${transitionSpeed}s` }}
          />
        </div>
      </div>
    </>
  )
}
