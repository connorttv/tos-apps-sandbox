import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useUiScaleToSetRem, useUiAspectRatio } from '@telemetryos/sdk/react'
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
import { themes, type ThemeName, type Theme } from '../themes'
import './Render.css'

// ── Wikipedia API types ──────────────────────────────────────────────────────

interface WikiPage {
  title: string
  description?: string
  thumbnail?: { source: string; width: number; height: number }
  originalimage?: { source: string; width: number; height: number }
}

interface WikiFact {
  text: string
  year?: number
  pages?: WikiPage[]
}

interface WikiResponse {
  selected?: WikiFact[]
  events?: WikiFact[]
  births?: WikiFact[]
  deaths?: WikiFact[]
  holidays?: WikiFact[]
}

interface DisplayFact {
  text: string
  year: number | null
  category: 'event' | 'birth' | 'death' | 'holiday'
  thumbnail?: string
  /** Wikipedia-curated notable fact */
  selected?: boolean
  /** Number of linked Wikipedia pages (proxy for notability) */
  pageCount: number
}

const categoryLabel: Record<DisplayFact['category'], string> = {
  event: 'Historical Event',
  birth: 'Born on This Day',
  death: 'Died on This Day',
  holiday: 'Holiday',
}

/**
 * Upscale Wikipedia thumbnail URL to get a higher-res image.
 * Thumbnails come as e.g. /320px-Foo.jpg — we request /800px- instead.
 */
function upscaleThumb(url: string): string {
  return url.replace(/\/(\d+)px-/, '/800px-')
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTodayKey() {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return { mm, dd, key: `${mm}-${dd}` }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

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

// ── Component ────────────────────────────────────────────────────────────────

export function Render() {
  const [isLoadingScale, uiScale] = useUiScaleStoreState()
  const [isLoadingPadding, pagePadding] = usePagePaddingStoreState()
  const [isLoadingTheme, themeName] = useThemeStoreState()
  const [isLoadingAnim, animation] = useAnimationStoreState()
  const [isLoadingBg, showBackground] = useShowBackgroundStoreState()
  const [isLoadingEvents, showEvents] = useShowEventsStoreState()
  const [isLoadingBirths, showBirths] = useShowBirthsStoreState()
  const [isLoadingDeaths, showDeaths] = useShowDeathsStoreState()
  const [isLoadingHolidays, showHolidays] = useShowHolidaysStoreState()
  const [isLoadingInterval, rotationInterval] = useRotationIntervalStoreState()
  const [isLoadingMaxLen, maxTextLength] = useMaxTextLengthStoreState()
  const aspectRatio = useUiAspectRatio()

  useUiScaleToSetRem(uiScale)

  const isStoreLoading =
    isLoadingScale || isLoadingPadding || isLoadingTheme || isLoadingAnim || isLoadingBg ||
    isLoadingEvents || isLoadingBirths || isLoadingDeaths || isLoadingHolidays || isLoadingInterval ||
    isLoadingMaxLen
  if (isStoreLoading) return null

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

  return (
    <div key={animation} className={layoutClasses} style={{ ...applyThemeVars(theme), '--page-padding': pagePadding } as React.CSSProperties}>
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

      <FactDisplay
        density={density}
        isPortrait={isPortrait}
        showEvents={showEvents}
        showBirths={showBirths}
        showDeaths={showDeaths}
        showHolidays={showHolidays}
        rotationInterval={rotationInterval}
        maxTextLength={maxTextLength}
      />
    </div>
  )
}

// ── Fact Display ─────────────────────────────────────────────────────────────

interface FactDisplayProps {
  density: Density
  isPortrait: boolean
  showEvents: boolean
  showBirths: boolean
  showDeaths: boolean
  showHolidays: boolean
  rotationInterval: number
  maxTextLength: number
}

function FactDisplay({ density, isPortrait, showEvents, showBirths, showDeaths, showHolidays, rotationInterval, maxTextLength }: FactDisplayProps) {
  const [facts, setFacts] = useState<DisplayFact[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const fetchedDateRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch Wikipedia data ───────────────────────────────────────────────
  useEffect(() => {
    const { mm, dd, key } = getTodayKey()
    if (fetchedDateRef.current === key) return

    let cancelled = false
    setIsFetching(true)
    setFetchError(false)

    // Wikipedia API has CORS headers — use regular fetch (proxy not needed)
    fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${mm}/${dd}`)
      .then((r) => r.json() as Promise<WikiResponse>)
      .then((data) => {
        if (cancelled) return
        fetchedDateRef.current = key

        // Deduplicate by text (selected and events can overlap)
        const seen = new Set<string>()
        const collected: DisplayFact[] = []

        const add = (items: WikiFact[] | undefined, category: DisplayFact['category'], isSelected: boolean) => {
          items?.forEach((f) => {
            if (f.year == null) return
            if (seen.has(f.text)) return
            seen.add(f.text)

            const page = f.pages?.[0]
            let imageUrl: string | undefined
            if (page?.originalimage?.source) {
              imageUrl = page.originalimage.source
            } else if (page?.thumbnail?.source) {
              imageUrl = upscaleThumb(page.thumbnail.source)
            }
            collected.push({
              text: f.text,
              year: f.year,
              category,
              thumbnail: imageUrl,
              selected: isSelected,
              pageCount: f.pages?.length ?? 0,
            })
          })
        }

        // selected = Wikipedia's hand-curated notable events (best content)
        add(data.selected, 'event', true)
        add(data.events, 'event', false)
        add(data.births, 'birth', false)
        add(data.deaths, 'death', false)
        add(data.holidays, 'holiday', false)

        // Tier 1: Wikipedia-curated selections (always shown first, shuffled)
        const tier1 = shuffle(collected.filter((f) => f.selected))

        // Tier 2: Non-selected facts with images AND multiple wiki pages
        //         (multiple pages = more notable, better-documented event)
        const tier2 = shuffle(collected.filter((f) =>
          !f.selected && f.thumbnail && f.pageCount >= 2
        ))

        // Only use notable content (Tier 1 + 2)
        setFacts([...tier1, ...tier2])
        setCurrentIndex(0)
        setIsFetching(false)
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true)
          setIsFetching(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  // ── Filter ─────────────────────────────────────────────────────────────
  const filteredFacts = useMemo(() => facts.filter((f) => {
    if (f.category === 'event' && !showEvents) return false
    if (f.category === 'birth' && !showBirths) return false
    if (f.category === 'death' && !showDeaths) return false
    if (f.category === 'holiday' && !showHolidays) return false
    if (f.text.length > maxTextLength) return false
    return true
  }), [facts, showEvents, showBirths, showDeaths, showHolidays, maxTextLength])

  const safeIndex = filteredFacts.length > 0 ? currentIndex % filteredFacts.length : 0
  const currentFact = filteredFacts[safeIndex] ?? null

  // ── Auto-rotation ──────────────────────────────────────────────────────
  const advanceFact = useCallback(() => {
    if (filteredFacts.length <= 1) return
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredFacts.length)
      setIsVisible(true)
    }, 600)
  }, [filteredFacts.length])

  useEffect(() => {
    if (filteredFacts.length <= 1) return
    delayRef.current = setTimeout(() => {
      intervalRef.current = setInterval(advanceFact, rotationInterval * 1000)
    }, 1500)
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [rotationInterval, advanceFact, filteredFacts.length])

  // ── Derived ────────────────────────────────────────────────────────────
  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const currentYear = new Date().getFullYear()
  const yearsAgo = currentFact?.year != null ? currentYear - currentFact.year : null

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header row */}
      <div className="content-header">
        <span className="otd-eyebrow">On This Day</span>
        <span className="otd-date">{todayLabel}</span>
      </div>

      {/* Single card */}
      <div className="content-card otd-card">
        {isFetching && (
          <div className="otd-status">
            <div className="otd-status__text">Loading&hellip;</div>
          </div>
        )}
        {fetchError && (
          <div className="otd-status">
            <div className="otd-status__text">Could not load data</div>
            <div className="otd-status__hint">Check network connection</div>
          </div>
        )}
        {!isFetching && !fetchError && filteredFacts.length === 0 && (
          <div className="otd-status">
            <div className="otd-status__text">No categories enabled</div>
            <div className="otd-status__hint">Enable categories in Settings</div>
          </div>
        )}
        {currentFact && (
          <div className={`otd-slide ${isVisible ? 'otd-slide--in' : 'otd-slide--out'}`}>
            {/* Image */}
            {currentFact.thumbnail && (
              <div className="otd-slide__image-wrap">
                <img className="otd-slide__image" src={currentFact.thumbnail} alt="" />
              </div>
            )}
            {/* Text block */}
            <div className="otd-slide__body">
              {currentFact.year !== null && <div className="otd-slide__year">{currentFact.year}</div>}
              {yearsAgo !== null && <div className="otd-slide__ago">{yearsAgo} year{yearsAgo !== 1 ? 's' : ''} ago</div>}
              <p className="otd-slide__text">{currentFact.text}</p>
              <span className="otd-slide__category">{categoryLabel[currentFact.category]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="otd-progress">
        <div
          className="otd-progress__bar"
          key={safeIndex}
          style={{ animationDuration: `${rotationInterval}s` }}
        />
      </div>
    </>
  )
}
