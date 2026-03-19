import { useEffect, useState } from 'react'
import { media } from '@telemetryos/sdk'
import {
  SettingsContainer,
  SettingsField,
  SettingsLabel,
  SettingsSliderFrame,
  SettingsInputFrame,
  SettingsSelectFrame,
  SettingsBox,
  SettingsButtonFrame,
  SettingsHeading,
  SettingsDivider,
} from '@telemetryos/sdk/react'
import {
  useRotationIntervalStoreState,
  useUiScaleStoreState,
  useWindowRotationIntervalStoreState,
  useWindowsStoreState,
  useManualEventsMediaFolderIdState,
} from '../hooks/store'
import type {
  OnThisDayEventType,
  OnThisDayWindow,
  ManualEvent,
  WindowSource,
} from '../hooks/store'

const EVENT_TYPE_OPTIONS: { value: OnThisDayEventType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'selected', label: 'Featured' },
  { value: 'events', label: 'Events' },
  { value: 'births', label: 'Births' },
  { value: 'deaths', label: 'Deaths' },
  { value: 'holidays', label: 'Holidays' },
]

const SOURCE_OPTIONS: { value: WindowSource; label: string }[] = [
  { value: 'api', label: 'Wikipedia (On this day)' },
  { value: 'manual', label: 'Manual events (images from Media)' },
]

function nextWindowId(): string {
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function nextManualEventId(): string {
  return `e-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Normalize window: ensure source and manualEvents exist */
function normalizeWindow(w: OnThisDayWindow): OnThisDayWindow {
  const source = w.source ?? 'api'
  return {
    ...w,
    source,
    manualEvents: source === 'manual' ? (w.manualEvents ?? []) : undefined,
  }
}

interface MediaImage {
  id: string
  name: string
}

export function Settings() {
  const [isLoadingUiScale, uiScale, setUiScale] = useUiScaleStoreState(5)
  const [isLoadingRot, rotationInterval, setRotationInterval] = useRotationIntervalStoreState(0)
  const [isLoadingWindows, windows, setWindows] = useWindowsStoreState(0)
  const [isLoadingWinRot, windowRotationInterval, setWindowRotationInterval] =
    useWindowRotationIntervalStoreState(0)
  const [isLoadingFolder, mediaFolderId, setMediaFolderId] =
    useManualEventsMediaFolderIdState(0)

  const [folders, setFolders] = useState<{ id: string; name: string }[]>([])
  const [folderImages, setFolderImages] = useState<MediaImage[]>([])

  useEffect(() => {
    media()
      .getAllFolders()
      .then((list) => setFolders(list.map((f) => ({ id: f.id, name: f.name }))))
      .catch(() => setFolders([]))
  }, [])

  useEffect(() => {
    if (!mediaFolderId) {
      setFolderImages([])
      return
    }
    media()
      .getAllByFolderId(mediaFolderId)
      .then((content) =>
        setFolderImages(
          content
            .filter((c) => c.contentType.startsWith('image/'))
            .map((c) => ({ id: c.id, name: c.name }))
        )
      )
      .catch(() => setFolderImages([]))
  }, [mediaFolderId])

  const normalizedWindows = windows.map(normalizeWindow)

  const updateWindow = (index: number, updates: Partial<OnThisDayWindow>) => {
    setWindows(
      windows.map((w, i) => {
        if (i !== index) return w
        const next = { ...w, ...updates }
        if (updates.source === 'manual' && next.manualEvents === undefined)
          next.manualEvents = []
        if (updates.source === 'api') next.manualEvents = undefined
        return next
      })
    )
  }

  const updateManualEvent = (
    windowIndex: number,
    eventIndex: number,
    updates: Partial<ManualEvent>
  ) => {
    const win = normalizedWindows[windowIndex]
    if (!win?.manualEvents) return
    const next = win.manualEvents.map((e, i) =>
      i === eventIndex ? { ...e, ...updates } : e
    )
    updateWindow(windowIndex, { manualEvents: next })
  }

  const addManualEvent = (windowIndex: number) => {
    const win = normalizedWindows[windowIndex]
    const list = win?.manualEvents ?? []
    updateWindow(windowIndex, {
      manualEvents: [...list, { id: nextManualEventId(), year: '', text: '', tag: '', mediaId: folderImages[0]?.id ?? '' }],
    })
  }

  const removeManualEvent = (windowIndex: number, eventIndex: number) => {
    const win = normalizedWindows[windowIndex]
    if (!win?.manualEvents) return
    const next = win.manualEvents.filter((_, i) => i !== eventIndex)
    updateWindow(windowIndex, { manualEvents: next })
  }

  const removeWindow = (index: number) => {
    if (windows.length <= 1) return
    setWindows(windows.filter((_, i) => i !== index))
  }

  const addWindow = () => {
    setWindows([
      ...windows,
      { id: nextWindowId(), source: 'api', eventType: 'all' },
    ])
  }

  return (
    <SettingsContainer>
      <SettingsHeading>Windows</SettingsHeading>
      <SettingsField>
        <SettingsLabel>Each window is either Wikipedia “On this day” or your own manual events (images from Media Library).</SettingsLabel>
      </SettingsField>

      {normalizedWindows.map((window, index) => (
        <SettingsBox key={window.id}>
          <SettingsField>
            <SettingsLabel>Window {index + 1} – Source</SettingsLabel>
            <SettingsSelectFrame>
              <select
                disabled={isLoadingWindows}
                value={window.source}
                onChange={(e) =>
                  updateWindow(index, { source: e.target.value as WindowSource })
                }
              >
                {SOURCE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SettingsSelectFrame>
          </SettingsField>

          {window.source === 'api' && (
              <SettingsField>
                <SettingsLabel>Theme</SettingsLabel>
                <SettingsSelectFrame>
                  <select
                    disabled={isLoadingWindows}
                    value={window.eventType}
                    onChange={(e) =>
                      updateWindow(index, {
                        eventType: e.target.value as OnThisDayEventType,
                      })
                    }
                  >
                    {EVENT_TYPE_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </SettingsSelectFrame>
              </SettingsField>
            )}

            {window.source === 'manual' && (
              <>
                <SettingsField>
                  <SettingsLabel>Manual events (year, text, tag, image from Media)</SettingsLabel>
                </SettingsField>
                {(window.manualEvents ?? []).map((ev, evIndex) => (
                  <SettingsBox key={ev.id}>
                    <SettingsField>
                      <SettingsLabel>Year</SettingsLabel>
                      <SettingsInputFrame>
                        <input
                          type="text"
                          placeholder="e.g. 1995"
                          disabled={isLoadingWindows}
                          value={ev.year}
                          onChange={(e) =>
                            updateManualEvent(index, evIndex, { year: e.target.value })
                          }
                        />
                      </SettingsInputFrame>
                    </SettingsField>
                    <SettingsField>
                      <SettingsLabel>Text</SettingsLabel>
                      <SettingsInputFrame>
                        <input
                          type="text"
                          placeholder="Event description"
                          disabled={isLoadingWindows}
                          value={ev.text}
                          onChange={(e) =>
                            updateManualEvent(index, evIndex, { text: e.target.value })
                          }
                        />
                      </SettingsInputFrame>
                    </SettingsField>
                    <SettingsField>
                      <SettingsLabel>Tag (optional)</SettingsLabel>
                      <SettingsInputFrame>
                        <input
                          type="text"
                          placeholder="e.g. History"
                          disabled={isLoadingWindows}
                          value={ev.tag ?? ''}
                          onChange={(e) =>
                            updateManualEvent(index, evIndex, { tag: e.target.value })
                          }
                        />
                      </SettingsInputFrame>
                    </SettingsField>
                    <SettingsField>
                      <SettingsLabel>Image (from Media folder below)</SettingsLabel>
                      <SettingsSelectFrame>
                        <select
                          disabled={isLoadingWindows || folderImages.length === 0}
                          value={ev.mediaId || ''}
                          onChange={(e) =>
                            updateManualEvent(index, evIndex, {
                              mediaId: e.target.value,
                            })
                          }
                        >
                          <option value="">
                            {mediaFolderId
                              ? 'Select image...'
                              : 'Select a Media folder first'}
                          </option>
                          {folderImages.map((img) => (
                            <option key={img.id} value={img.id}>
                              {img.name}
                            </option>
                          ))}
                        </select>
                      </SettingsSelectFrame>
                    </SettingsField>
                    <SettingsButtonFrame>
                      <button
                        type="button"
                        disabled={isLoadingWindows}
                        onClick={() => removeManualEvent(index, evIndex)}
                      >
                        Remove event
                      </button>
                    </SettingsButtonFrame>
                  </SettingsBox>
                ))}
                <SettingsButtonFrame>
                  <button
                    type="button"
                    disabled={isLoadingWindows || folderImages.length === 0}
                    onClick={() => addManualEvent(index)}
                  >
                    + Add manual event
                  </button>
                </SettingsButtonFrame>
              </>
            )}

          <SettingsButtonFrame>
            <button
              type="button"
              disabled={isLoadingWindows || windows.length <= 1}
              onClick={() => removeWindow(index)}
            >
              Remove window
            </button>
          </SettingsButtonFrame>
        </SettingsBox>
      ))}
      <SettingsButtonFrame>
        <button type="button" disabled={isLoadingWindows} onClick={addWindow}>
          + Add window
        </button>
      </SettingsButtonFrame>

      {normalizedWindows.some((w) => w.source === 'manual') && (
        <>
          <SettingsDivider />
          <SettingsHeading>Media for manual events</SettingsHeading>
          <SettingsField>
            <SettingsLabel>Folder with images (used for manual event image picker)</SettingsLabel>
            <SettingsSelectFrame>
              <select
                disabled={isLoadingFolder || isLoadingWindows}
                value={mediaFolderId}
                onChange={(e) => setMediaFolderId(e.target.value)}
              >
                <option value="">Select folder...</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </SettingsSelectFrame>
          </SettingsField>
        </>
      )}

      <SettingsField>
        <SettingsLabel>Rotate windows every (seconds)</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="number"
            min={0}
            max={300}
            step={5}
            disabled={isLoadingWinRot}
            value={windowRotationInterval}
            onChange={(e) =>
              setWindowRotationInterval(Math.max(0, parseInt(e.target.value, 10) || 0))
            }
          />
          <span>0 = show only first window</span>
        </SettingsInputFrame>
      </SettingsField>

      <SettingsDivider />

      <SettingsHeading>Display</SettingsHeading>
      <SettingsField>
        <SettingsLabel>UI Scale</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            disabled={isLoadingUiScale}
            value={uiScale}
            onChange={(e) => setUiScale(parseFloat(e.target.value))}
          />
          <span>{uiScale}x</span>
        </SettingsSliderFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Rotate event within window (seconds)</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="number"
            min={0}
            max={120}
            step={5}
            disabled={isLoadingRot}
            value={rotationInterval}
            onChange={(e) =>
              setRotationInterval(Math.max(0, parseInt(e.target.value, 10) || 0))
            }
          />
          <span>0 = no rotation</span>
        </SettingsInputFrame>
      </SettingsField>
    </SettingsContainer>
  )
}
