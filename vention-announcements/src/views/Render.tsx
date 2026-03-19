import { useUiAspectRatio, useUiScaleToSetRem } from '@telemetryos/sdk/react'
import { useEffect, useState } from 'react'
import { media } from '@telemetryos/sdk'
import {
  getLayoutShape,
  showP2,
  showP3,
  type LayoutShape,
} from '../utils/layoutShape'
import { FormattedText } from '../utils/formattedText'
import { useViewportSize } from '../hooks/useViewportSize'
import {
  useAnnouncementsStoreState,
  useRotationDurationStoreState,
  useShowProgressIndicatorStoreState,
  useTransitionStyleStoreState,
  useUiScaleStoreState,
} from '../hooks/store'
import './Render.css'

export function Render() {
  const [, uiScale] = useUiScaleStoreState()
  useUiScaleToSetRem(uiScale)

  const aspectRatio = useUiAspectRatio()
  const { width, height } = useViewportSize()
  const minDimensionPx = Math.min(width, height)
  const layoutShape: LayoutShape = getLayoutShape(aspectRatio, minDimensionPx)

  const [isLoadingAnn, announcements] = useAnnouncementsStoreState()
  const [, rotationDuration] = useRotationDurationStoreState()
  const [, transitionStyle] = useTransitionStyleStoreState()
  const [, showProgressIndicator] = useShowProgressIndicatorStoreState()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)

  const list = announcements.length > 0 ? announcements : []
  const current = list[currentIndex]
  const isImageOrVideo =
    current?.backgroundType === 'image' || current?.backgroundType === 'video'

  const showSupportingAndImages = showP2(layoutShape)
  const showBodyAndDecorative = showP3(layoutShape)

  useEffect(() => {
    if (list.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % list.length)
    }, rotationDuration * 1000)
    return () => clearInterval(interval)
  }, [list.length, rotationDuration])

  useEffect(() => {
    if (!current || !isImageOrVideo || !current.backgroundMediaId) {
      setMediaUrl(null)
      return
    }
    let cancelled = false
    media()
      .getById(current.backgroundMediaId)
      .then((item) => {
        if (!cancelled && item.publicUrls?.[0]) setMediaUrl(item.publicUrls[0])
      })
      .catch(() => {
        if (!cancelled) setMediaUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [current?.id, current?.backgroundMediaId, isImageOrVideo])

  if (isLoadingAnn) return null
  if (!current) {
    return (
      <div className="render render--empty">
        <p className="render__empty-text">Add announcements in Settings</p>
      </div>
    )
  }

  return (
    <div className={`render render--${layoutShape}`}>
      <div
        key={current.id}
        className={`render__slide render__slide--${transitionStyle}`}
        style={
          current.backgroundType === 'solid'
            ? { backgroundColor: current.backgroundSolidColor }
            : current.backgroundType === 'gradient'
              ? {
                  background: `linear-gradient(135deg, ${current.backgroundGradientFrom}, ${current.backgroundGradientTo})`,
                }
              : undefined
        }
      >
        {(current.backgroundType === 'image' || current.backgroundType === 'video') && (
          <>
            <div className="render__media-wrap">
              {current.backgroundType === 'image' && mediaUrl && (
                <img src={mediaUrl} alt="" className="render__media" />
              )}
              {current.backgroundType === 'video' && mediaUrl && (
                <video
                  src={mediaUrl}
                  className="render__media"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </div>
            <div className="render__overlay" aria-hidden />
          </>
        )}

        <div className="render__content">
          {current.title && (
            <h1 className="render__title">
              <FormattedText text={current.title} as="span" inlineOnly />
            </h1>
          )}
          <p className="render__primary">
            <FormattedText text={current.primaryMessage} as="span" inlineOnly />
          </p>
          {showSupportingAndImages && current.supportingText && (
            <p className="render__secondary">
              <FormattedText text={current.supportingText} as="span" inlineOnly />
            </p>
          )}
          {showBodyAndDecorative && current.body && (
            <div className="render__body">
              <FormattedText text={current.body} className="render__body-inner" />
            </div>
          )}
        </div>
      </div>

      {showProgressIndicator && list.length > 1 && (
        <div className="render__progress">
          <div className="render__progress-bar">
            {list.map((_, i) => (
              <span
                key={i}
                className={`render__progress-dot ${i === currentIndex ? 'render__progress-dot--active' : ''}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
