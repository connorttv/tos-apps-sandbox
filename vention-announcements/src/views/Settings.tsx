import {
  SettingsBox,
  SettingsButtonFrame,
  SettingsContainer,
  SettingsDivider,
  SettingsField,
  SettingsHeading,
  SettingsHint,
  SettingsInputFrame,
  SettingsLabel,
  SettingsSelectFrame,
  SettingsSliderFrame,
  SettingsSliderRuler,
  SettingsSwitchFrame,
  SettingsSwitchLabel,
  SettingsTextAreaFrame,
} from '@telemetryos/sdk/react'
import { useEffect, useState } from 'react'
import { media } from '@telemetryos/sdk'
import type { Announcement, BackgroundType, TransitionStyle } from '../hooks/store'
import {
  useAnnouncementsStoreState,
  useBackgroundMediaFolderIdStoreState,
  useRotationDurationStoreState,
  useShowProgressIndicatorStoreState,
  useTransitionStyleStoreState,
  useUiScaleStoreState,
} from '../hooks/store'

interface MediaItem {
  id: string
  name: string
  contentType: string
}

function generateId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const defaultAnnouncement = (): Announcement => ({
  id: generateId(),
  title: '',
  primaryMessage: '',
  supportingText: '',
  body: '',
  backgroundType: 'solid',
  backgroundSolidColor: '#1a1a2e',
  backgroundGradientFrom: '#16213e',
  backgroundGradientTo: '#0f3460',
  backgroundMediaId: '',
})

export function Settings() {
  const [isLoadingUiScale, uiScale, setUiScale] = useUiScaleStoreState(5)
  const [isLoadingAnn, announcements, setAnnouncements] = useAnnouncementsStoreState(250)
  const [isLoadingDur, rotationDuration, setRotationDuration] = useRotationDurationStoreState(5)
  const [isLoadingTrans, transitionStyle, setTransitionStyle] = useTransitionStyleStoreState(0)
  const [isLoadingProg, showProgressIndicator, setShowProgressIndicator] =
    useShowProgressIndicatorStoreState(0)
  const [isLoadingFolder, backgroundMediaFolderId, setBackgroundMediaFolderId] =
    useBackgroundMediaFolderIdStoreState(250)

  const [folders, setFolders] = useState<{ id: string; name: string }[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

  useEffect(() => {
    media()
      .getAllFolders()
      .then((list) => setFolders(list.map((f) => ({ id: f.id, name: f.name }))))
      .catch(() => setFolders([]))
  }, [])

  useEffect(() => {
    if (!backgroundMediaFolderId) {
      setMediaItems([])
      return
    }
    media()
      .getAllByFolderId(backgroundMediaFolderId)
      .then((content) =>
        setMediaItems(
          content
            .filter((c) => c.contentType.startsWith('image/') || c.contentType.startsWith('video/'))
            .map((c) => ({ id: c.id, name: c.name, contentType: c.contentType }))
        )
      )
      .catch(() => setMediaItems([]))
  }, [backgroundMediaFolderId])

  const isLoading =
    isLoadingUiScale ||
    isLoadingAnn ||
    isLoadingDur ||
    isLoadingTrans ||
    isLoadingProg ||
    isLoadingFolder

  const addAnnouncement = () => {
    setAnnouncements([...announcements, defaultAnnouncement()])
  }

  const removeAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index))
  }

  const updateAnnouncement = (index: number, updates: Partial<Announcement>) => {
    const next = [...announcements]
    next[index] = { ...next[index], ...updates }
    setAnnouncements(next)
  }

  return (
    <SettingsContainer>
      <SettingsHeading>Display</SettingsHeading>
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

      <SettingsDivider />

      <SettingsHeading>Rotation</SettingsHeading>
      <SettingsField>
        <SettingsLabel>Duration per slide (seconds)</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min={5}
            max={60}
            step={1}
            disabled={isLoading}
            value={rotationDuration}
            onChange={(e) => setRotationDuration(Number(e.target.value))}
          />
          <span>{rotationDuration}s</span>
        </SettingsSliderFrame>
        <SettingsSliderRuler>
          <span>5s</span>
          <span>60s</span>
        </SettingsSliderRuler>
      </SettingsField>
      <SettingsField>
        <SettingsLabel>Transition</SettingsLabel>
        <SettingsSelectFrame>
          <select
            disabled={isLoading}
            value={transitionStyle}
            onChange={(e) => setTransitionStyle(e.target.value as 'fade' | 'slide' | 'instant')}
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="instant">Instant</option>
          </select>
        </SettingsSelectFrame>
      </SettingsField>
      <SettingsField>
        <SettingsSwitchFrame>
          <input
            type="checkbox"
            role="switch"
            disabled={isLoading}
            checked={showProgressIndicator}
            onChange={(e) => setShowProgressIndicator(e.target.checked)}
          />
          <SettingsSwitchLabel>Show progress indicator</SettingsSwitchLabel>
        </SettingsSwitchFrame>
      </SettingsField>

      <SettingsDivider />

      <SettingsHeading>Background media folder</SettingsHeading>
      <SettingsField>
        <SettingsLabel>Folder for image/video backgrounds</SettingsLabel>
        <SettingsSelectFrame>
          <select
            disabled={isLoading}
            value={backgroundMediaFolderId}
            onChange={(e) => setBackgroundMediaFolderId(e.target.value)}
          >
            <option value="">— None —</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </SettingsSelectFrame>
      </SettingsField>

      <SettingsDivider />

      <SettingsHeading>Announcements</SettingsHeading>
      {announcements.map((ann, index) => (
        <SettingsBox key={ann.id}>
          <SettingsHeading>Announcement {index + 1}</SettingsHeading>

          <SettingsField>
            <SettingsLabel>Title</SettingsLabel>
            <SettingsInputFrame>
              <input
                type="text"
                placeholder="Title"
                disabled={isLoading}
                value={ann.title}
                onChange={(e) => updateAnnouncement(index, { title: e.target.value })}
              />
            </SettingsInputFrame>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>Primary message</SettingsLabel>
            <SettingsInputFrame>
              <input
                type="text"
                placeholder="Main message (always visible)"
                disabled={isLoading}
                value={ann.primaryMessage}
                onChange={(e) => updateAnnouncement(index, { primaryMessage: e.target.value })}
              />
            </SettingsInputFrame>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>Supporting text</SettingsLabel>
            <SettingsTextAreaFrame>
              <textarea
                placeholder="Optional supporting text"
                disabled={isLoading}
                value={ann.supportingText}
                onChange={(e) => updateAnnouncement(index, { supportingText: e.target.value })}
                rows={2}
              />
            </SettingsTextAreaFrame>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>Body (full message)</SettingsLabel>
            <SettingsTextAreaFrame>
              <textarea
                placeholder="Optional longer body"
                disabled={isLoading}
                value={ann.body}
                onChange={(e) => updateAnnouncement(index, { body: e.target.value })}
                rows={3}
              />
            </SettingsTextAreaFrame>
            <SettingsHint>
              Formatting: **bold**, *italic*, - bullet list, ## heading, ### subheading
            </SettingsHint>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>Background type</SettingsLabel>
            <SettingsSelectFrame>
              <select
                disabled={isLoading}
                value={ann.backgroundType}
                onChange={(e) =>
                  updateAnnouncement(index, { backgroundType: e.target.value as BackgroundType })
                }
              >
                <option value="solid">Solid color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </SettingsSelectFrame>
          </SettingsField>

          {(ann.backgroundType === 'solid' || ann.backgroundType === 'gradient') && (
            <>
              {ann.backgroundType === 'solid' && (
                <SettingsField>
                  <SettingsLabel>Background color</SettingsLabel>
                  <SettingsInputFrame>
                    <input
                      type="color"
                      disabled={isLoading}
                      value={ann.backgroundSolidColor}
                      onChange={(e) =>
                        updateAnnouncement(index, { backgroundSolidColor: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      disabled={isLoading}
                      value={ann.backgroundSolidColor}
                      onChange={(e) =>
                        updateAnnouncement(index, { backgroundSolidColor: e.target.value })
                      }
                    />
                  </SettingsInputFrame>
                </SettingsField>
              )}
              {ann.backgroundType === 'gradient' && (
                <>
                  <SettingsField>
                    <SettingsLabel>Gradient from</SettingsLabel>
                    <SettingsInputFrame>
                      <input
                        type="color"
                        disabled={isLoading}
                        value={ann.backgroundGradientFrom}
                        onChange={(e) =>
                          updateAnnouncement(index, { backgroundGradientFrom: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        disabled={isLoading}
                        value={ann.backgroundGradientFrom}
                        onChange={(e) =>
                          updateAnnouncement(index, { backgroundGradientFrom: e.target.value })
                        }
                      />
                    </SettingsInputFrame>
                  </SettingsField>
                  <SettingsField>
                    <SettingsLabel>Gradient to</SettingsLabel>
                    <SettingsInputFrame>
                      <input
                        type="color"
                        disabled={isLoading}
                        value={ann.backgroundGradientTo}
                        onChange={(e) =>
                          updateAnnouncement(index, { backgroundGradientTo: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        disabled={isLoading}
                        value={ann.backgroundGradientTo}
                        onChange={(e) =>
                          updateAnnouncement(index, { backgroundGradientTo: e.target.value })
                        }
                      />
                    </SettingsInputFrame>
                  </SettingsField>
                </>
              )}
            </>
          )}

          {(ann.backgroundType === 'image' || ann.backgroundType === 'video') && (
            <SettingsField>
              <SettingsLabel>
                {ann.backgroundType === 'image' ? 'Image' : 'Video'} from folder
              </SettingsLabel>
              <SettingsSelectFrame>
                <select
                  disabled={isLoading || !backgroundMediaFolderId}
                  value={ann.backgroundMediaId}
                  onChange={(e) => updateAnnouncement(index, { backgroundMediaId: e.target.value })}
                >
                  <option value="">— Select —</option>
                  {mediaItems
                    .filter(
                      (m) =>
                        (ann.backgroundType === 'image' && m.contentType.startsWith('image/')) ||
                        (ann.backgroundType === 'video' && m.contentType.startsWith('video/'))
                    )
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </SettingsSelectFrame>
            </SettingsField>
          )}

          <SettingsButtonFrame>
            <button
              type="button"
              disabled={isLoading || announcements.length <= 1}
              onClick={() => removeAnnouncement(index)}
            >
              Remove announcement
            </button>
          </SettingsButtonFrame>
        </SettingsBox>
      ))}

      <SettingsButtonFrame>
        <button type="button" disabled={isLoading} onClick={addAnnouncement}>
          + Add announcement
        </button>
      </SettingsButtonFrame>
    </SettingsContainer>
  )
}
