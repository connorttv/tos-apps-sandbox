import { useCallback, useEffect, useRef, useState } from 'react'
import { media } from '@telemetryos/sdk'
import { useUiScaleToSetRem } from '@telemetryos/sdk/react'
import {
  fetchOnThisDay,
  getCategoryLabel,
  getEventImageUrl,
  type OnThisDayDisplayItem,
} from '../utils/onThisDayApi'
import {
  useRotationIntervalStoreState,
  useUiScaleStoreState,
  useWindowRotationIntervalStoreState,
  useWindowsStoreState,
} from '../hooks/store'
import type { OnThisDayWindow } from '../hooks/store'
import { useLayoutShape } from '../hooks/useLayoutShape'
import './Render.css'

/** Unified display item (API or manual); image from API thumbnail or Media SDK (mediaId). */
interface DisplayItem {
  year: string
  text: string
  category: string
  imageUrl: string | null
  mediaId?: string
}

function normalizeWindow(w: OnThisDayWindow): OnThisDayWindow {
  return { ...w, source: w.source ?? 'api' }
}

/** 16:9 landscape */
const LANDSCAPE_W_REM = 80
const LANDSCAPE_H_REM = 45
/** 9:16 portrait */
const PORTRAIT_W_REM = 45
const PORTRAIT_H_REM = 80
/** 3:1 landscape bar (840×287px design) */
const RATIO31_W_REM = 52.5
const RATIO31_H_REM = 17.9375
/** 4:5 large (480×600px design) */
const RATIO45_W_REM = 30
const RATIO45_H_REM = 37.5
/** 1:3 portrait bar (287×840px design) */
const RATIO13_W_REM = 17.9375
const RATIO13_H_REM = 52.5
/** 1:10 skyscraper (128×1280px design) */
const RATIO110_W_REM = 8
const RATIO110_H_REM = 80
/** 1:1 square (287×287px design) */
const SQUARE_REM = 17.9375
/** 10:1 chiron (1280×128px design) */
const CHIRON_W_REM = 80
const CHIRON_H_REM = 8

export function Render() {
  const [, uiScale] = useUiScaleStoreState()
  useUiScaleToSetRem(uiScale)
  const layoutShape = useLayoutShape()
  const isPortrait = layoutShape === 'portrait'
  const isLandscapeBar = layoutShape === 'landscapeBar'
  const isLargePortrait = layoutShape === 'largePortrait'
  const isPortraitBar = layoutShape === 'portraitBar'
  const isSkyscraper = layoutShape === 'skyscraper'
  const isSquare = layoutShape === 'square'
  const isChiron = layoutShape === 'chiron'
  const canvasW =
    isChiron
      ? CHIRON_W_REM
      : isLandscapeBar
        ? RATIO31_W_REM
        : isSquare
          ? SQUARE_REM
          : isSkyscraper
            ? RATIO110_W_REM
            : isPortraitBar
              ? RATIO13_W_REM
              : isLargePortrait
                ? RATIO45_W_REM
                : isPortrait
                  ? PORTRAIT_W_REM
                  : LANDSCAPE_W_REM
  const canvasH =
    isChiron
      ? CHIRON_H_REM
      : isLandscapeBar
        ? RATIO31_H_REM
        : isSquare
          ? SQUARE_REM
          : isSkyscraper
            ? RATIO110_H_REM
            : isPortraitBar
              ? RATIO13_H_REM
              : isLargePortrait
                ? RATIO45_H_REM
                : isPortrait
                  ? PORTRAIT_H_REM
                  : LANDSCAPE_H_REM

  const [, rotationInterval] = useRotationIntervalStoreState()
  const [, windows = []] = useWindowsStoreState()
  const [, windowRotationInterval] = useWindowRotationIntervalStoreState()
  const [items, setItems] = useState<DisplayItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentWindowIndex, setCurrentWindowIndex] = useState(0)
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({})
  const canvasRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const rawWindows = Array.isArray(windows) && windows.length > 0 ? windows : [{ id: '1', source: 'api' as const, eventType: 'all' as const }]
  const effectiveWindows: OnThisDayWindow[] = rawWindows.map(normalizeWindow)
  const currentWindow = effectiveWindows[currentWindowIndex % effectiveWindows.length]
  const eventType = currentWindow?.eventType ?? 'all'
  const isManualWindow = currentWindow?.source === 'manual'

  useEffect(() => {
    setCurrentWindowIndex((i) => i % Math.max(1, effectiveWindows.length))
  }, [effectiveWindows.length])

  // API window: fetch Wikipedia
  useEffect(() => {
    if (isManualWindow) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchOnThisDay(month, day, eventType)
      .then((list) => {
        if (!cancelled) {
          const display: DisplayItem[] = list
            .filter((i) => i.text?.trim())
            .map((i) => ({
              year: i.year != null ? String(i.year) : '',
              text: i.text,
              category: getCategoryLabel(i.category),
              imageUrl: getEventImageUrl(i),
              mediaId: undefined,
            }))
          setItems(display)
          setCurrentIndex(0)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [month, day, eventType, isManualWindow])

  // Manual window: build items from manualEvents
  useEffect(() => {
    if (!isManualWindow || !currentWindow?.manualEvents) return
    setLoading(false)
    setError(null)
    const list = currentWindow.manualEvents.filter((e) => e.text?.trim())
    const display: DisplayItem[] = list.map((e) => ({
      year: e.year ?? '',
      text: e.text,
      category: e.tag?.trim() || 'On this day',
      imageUrl: null,
      mediaId: e.mediaId || undefined,
    }))
    setItems(display)
    setCurrentIndex(0)
  }, [isManualWindow, currentWindow?.id, currentWindow?.manualEvents])

  // Resolve Media SDK URLs for manual items
  const mediaIds = items.filter((i) => i.mediaId).map((i) => i.mediaId as string)
  useEffect(() => {
    if (mediaIds.length === 0) return
    let cancelled = false
    mediaIds.forEach((id) => {
      if (mediaUrls[id]) return
      media()
        .getById(id)
        .then((c) => {
          if (!cancelled && c.publicUrls?.[0])
            setMediaUrls((prev) => ({ ...prev, [id]: c.publicUrls[0] }))
        })
        .catch(() => {})
    })
    return () => { cancelled = true }
  }, [mediaIds.join(',')])

  const windowRotationSec = Number(windowRotationInterval) || 0
  useEffect(() => {
    if (effectiveWindows.length <= 1 || windowRotationSec <= 0) return
    const id = setInterval(() => {
      setCurrentWindowIndex((i) => (i + 1) % effectiveWindows.length)
    }, windowRotationSec * 1000)
    return () => clearInterval(id)
  }, [effectiveWindows.length, windowRotationSec])

  const rotationSec = Number(rotationInterval) || 0
  useEffect(() => {
    if (items.length <= 1 || rotationSec <= 0) return
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % items.length)
    }, rotationSec * 1000)
    return () => clearInterval(id)
  }, [items.length, rotationSec])

  const updateScale = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    const rw = el.clientWidth
    const rh = el.clientHeight
    if (rw <= 0 || rh <= 0) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    setScale(Math.max(vw / rw, vh / rh))
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const run = () => {
      requestAnimationFrame(updateScale)
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(el)
    window.addEventListener('resize', run)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', run)
    }
  }, [updateScale, uiScale, loading, layoutShape])

  if (loading && items.length === 0) {
    return (
      <div className="onthisday-viewport">
        <div className="onthisday-skeleton" />
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="onthisday-viewport">
        <div className="onthisday-error">Unable to load events. Try again later.</div>
      </div>
    )
  }

  const current = items[currentIndex]
  const imageUrl = current
    ? (current.imageUrl ?? (current.mediaId ? mediaUrls[current.mediaId] : null))
    : null

  const tickCount = isPortrait ? 9 : 5
  const activeTickIndex = items.length > 0 ? currentIndex % tickCount : 0

  return (
    <div className="onthisday-viewport">
      <div
        ref={canvasRef}
        className={`onthisday-canvas ${isPortrait ? 'onthisday--portrait' : ''}${isLandscapeBar ? ' onthisday--ratio31' : ''}${isLargePortrait ? ' onthisday--ratio45' : ''}${isPortraitBar ? ' onthisday--ratio13' : ''}${isSkyscraper ? ' onthisday--ratio110' : ''}${isSquare ? ' onthisday--square' : ''}${isChiron ? ' onthisday--chiron' : ''}`}
        style={{
          width: `${canvasW}rem`,
          height: `${canvasH}rem`,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div className="onthisday-bg" />
        <div className="onthisday-gradient" />

        <div className="onthisday-timeline">
          <div className="onthisday-timeline-line" />
          {items.length > 0 &&
            items.slice(0, tickCount).map((_, i) => (
              <div
                key={i}
                className={`onthisday-timeline-tick ${
                  i === activeTickIndex ? 'onthisday-timeline-tick--active' : ''
                }`}
              />
            ))}
        </div>

        <div className="onthisday-content">
          <p className="onthisday-headline">On this day...</p>
          {current && (
            <>
              <p className="onthisday-year">{current.year}</p>
              <p className="onthisday-text">{current.text}</p>
              <span className="onthisday-tag">{current.category}</span>
            </>
          )}
        </div>

        <div className="onthisday-picture">
          <div className="onthisday-picture-decor onthisday-picture-decor--1" />
          <div className="onthisday-picture-decor onthisday-picture-decor--2" />
          {imageUrl && (
            <div className="onthisday-picture-frame">
              <img src={imageUrl} alt="" className="onthisday-picture-img" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
