import { useEffect, useState, useRef, useCallback } from 'react'
import { media } from '@telemetryos/sdk'
import { fetchCitySuggestions, type CitySuggestion } from '../utils/geocoding'
import './Settings.css'
import {
  SettingsContainer,
  SettingsHeading,
  SettingsBox,
  SettingsDivider,
  SettingsField,
  SettingsLabel,
  SettingsHint,
  SettingsInputFrame,
  SettingsSelectFrame,
  SettingsSliderFrame,
  SettingsColorFrame,
  SettingsSwitchFrame,
  SettingsSwitchLabel,
  SettingsRadioFrame,
  SettingsRadioLabel,
  SettingsButtonFrame,
} from '@telemetryos/sdk/react'
import {
  useLocationModeState,
  useCitiesState,
  useCycleDurationState,
  useTransitionStyleState,
  useTemperatureUnitsState,
  useForecastRangeState,
  useShowDateState,
  useBackgroundTypeState,
  useSolidColorState,
  useGradientColor1State,
  useGradientColor2State,
  useGradientDirectionState,
  useBackgroundImageIdState,
  useBackgroundVideoIdState,
  useOverlayColorState,
  useOverlayOpacityState,
  useUiScaleStoreState,
  type CityEntry,
} from '../hooks/store'

interface MediaItem {
  id: string
  name: string
  contentType: string
}

export function Settings() {
  const [isLoadingMode, locationMode, setLocationMode] = useLocationModeState()
  const [isLoadingCities, cities, setCities] = useCitiesState(250)
  const [isLoadingCycle, cycleDuration, setCycleDuration] = useCycleDurationState(5)
  const [isLoadingTransition, transitionStyle, setTransitionStyle] = useTransitionStyleState()
  const [isLoadingUnits, temperatureUnits, setTemperatureUnits] = useTemperatureUnitsState()
  const [isLoadingForecast, forecastRange, setForecastRange] = useForecastRangeState()
  const [isLoadingShowDate, showDate, setShowDate] = useShowDateState()
  const [isLoadingBgType, backgroundType, setBackgroundType] = useBackgroundTypeState()
  const [isLoadingSolid, solidColor, setSolidColor] = useSolidColorState(5)
  const [isLoadingG1, gradientColor1, setGradientColor1] = useGradientColor1State(5)
  const [isLoadingG2, gradientColor2, setGradientColor2] = useGradientColor2State(5)
  const [isLoadingGDir, gradientDirection, setGradientDirection] = useGradientDirectionState()
  const [isLoadingImgId, backgroundImageId, setBackgroundImageId] = useBackgroundImageIdState()
  const [isLoadingVidId, backgroundVideoId, setBackgroundVideoId] = useBackgroundVideoIdState()
  const [isLoadingOverlay, overlayColor, setOverlayColor] = useOverlayColorState(5)
  const [isLoadingOverlayOp, overlayOpacity, setOverlayOpacity] = useOverlayOpacityState(5)
  const [isLoadingUiScale, uiScale, setUiScale] = useUiScaleStoreState(5)

  const [imageOptions, setImageOptions] = useState<MediaItem[]>([])
  const [videoOptions, setVideoOptions] = useState<MediaItem[]>([])
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([])
  const [suggestionsOpenIndex, setSuggestionsOpenIndex] = useState<number | null>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const geocodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading =
    isLoadingMode ||
    isLoadingCities ||
    isLoadingCycle ||
    isLoadingTransition ||
    isLoadingUnits ||
    isLoadingForecast ||
    isLoadingShowDate ||
    isLoadingBgType ||
    isLoadingSolid ||
    isLoadingG1 ||
    isLoadingG2 ||
    isLoadingGDir ||
    isLoadingImgId ||
    isLoadingVidId ||
    isLoadingOverlay ||
    isLoadingOverlayOp ||
    isLoadingUiScale

  useEffect(() => {
    let cancelled = false
    const loadMedia = async () => {
      try {
        const folders = await media().getAllFolders()
        const defaultFolder = folders.find((f) => f.default) ?? folders[0]
        if (!defaultFolder || cancelled) return
        const content = await media().getAllByFolderId(defaultFolder.id)
        if (cancelled) return
        setImageOptions(
          content
            .filter((c) => c.contentType.startsWith('image/'))
            .map((c) => ({ id: c.id, name: c.name, contentType: c.contentType }))
        )
        setVideoOptions(
          content
            .filter((c) => c.contentType.startsWith('video/'))
            .map((c) => ({ id: c.id, name: c.name, contentType: c.contentType }))
        )
      } catch {
        // ignore
      }
    }
    loadMedia()
    return () => {
      cancelled = true
    }
  }, [])

  const addCity = () => {
    setCities([...cities, { cityName: '', displayName: '' }])
  }

  const removeCity = (index: number) => {
    if (cities.length <= 1) return
    setCities(cities.filter((_, i) => i !== index))
  }

  const updateCity = (index: number, updates: Partial<CityEntry>) => {
    const next = [...cities]
    next[index] = { ...next[index], ...updates }
    setCities(next)
  }

  const apiKey = (import.meta.env?.VITE_OPENWEATHER_API_KEY as string) ?? ''

  const loadCitySuggestions = useCallback(
    (query: string) => {
      if (!apiKey.trim() || query.trim().length < 2) {
        setCitySuggestions([])
        setSuggestionsOpenIndex(null)
        return
      }
      setSuggestionsLoading(true)
      fetchCitySuggestions(query, apiKey, 5)
        .then((list) => {
          setCitySuggestions(list)
        })
        .catch(() => setCitySuggestions([]))
        .finally(() => setSuggestionsLoading(false))
    },
    [apiKey]
  )

  const onCityInputChange = (index: number, value: string) => {
    updateCity(index, { cityName: value })
    if (geocodeDebounceRef.current) clearTimeout(geocodeDebounceRef.current)
    setSuggestionsOpenIndex(null)
    setCitySuggestions([])
    if (value.trim().length < 2) return
    geocodeDebounceRef.current = setTimeout(() => {
      geocodeDebounceRef.current = null
      loadCitySuggestions(value)
      setSuggestionsOpenIndex(index)
    }, 300)
  }

  const onSelectSuggestion = (index: number, item: CitySuggestion) => {
    updateCity(index, { cityName: item.cityName, displayName: item.displayName })
    setCitySuggestions([])
    setSuggestionsOpenIndex(null)
  }

  useEffect(() => {
    return () => {
      if (geocodeDebounceRef.current) clearTimeout(geocodeDebounceRef.current)
    }
  }, [])

  return (
    <SettingsContainer>
      <SettingsHeading>Location</SettingsHeading>
      <SettingsField>
        <SettingsLabel>Location mode</SettingsLabel>
        <SettingsRadioFrame>
          <input
            type="radio"
            name="locationMode"
            value="manual"
            disabled={isLoading}
            checked={locationMode === 'manual'}
            onChange={() => setLocationMode('manual')}
          />
          <SettingsRadioLabel>Manual</SettingsRadioLabel>
        </SettingsRadioFrame>
        <SettingsRadioFrame>
          <input
            type="radio"
            name="locationMode"
            value="automatic"
            disabled={isLoading}
            checked={locationMode === 'automatic'}
            onChange={() => setLocationMode('automatic')}
          />
          <SettingsRadioLabel>Automatic</SettingsRadioLabel>
        </SettingsRadioFrame>
        <SettingsHint>Manual: enter city name(s). Automatic: use device location.</SettingsHint>
      </SettingsField>

      {locationMode === 'manual' && (
        <>
          {cities.map((entry, index) => (
            <SettingsBox key={index}>
              <SettingsHeading>City {index + 1}</SettingsHeading>
              <SettingsField>
                <SettingsLabel>City name</SettingsLabel>
                <div style={{ position: 'relative' }}>
                  <SettingsInputFrame>
                    <input
                      type="text"
                      placeholder="e.g. Vancouver, BC"
                      disabled={isLoading}
                      value={entry.cityName}
                      onChange={(e) => onCityInputChange(index, e.target.value)}
                      onFocus={() => citySuggestions.length > 0 && setSuggestionsOpenIndex(index)}
                      onBlur={() => setTimeout(() => setSuggestionsOpenIndex(null), 150)}
                      autoComplete="off"
                    />
                  </SettingsInputFrame>
                  {suggestionsOpenIndex === index && (citySuggestions.length > 0 || suggestionsLoading) && (
                    <ul role="listbox" className="settings-city-suggestions">
                      {suggestionsLoading ? (
                        <li className="settings-city-suggestions__loading">Loading…</li>
                      ) : (
                        citySuggestions.map((item, i) => (
                          <li
                            key={`${item.cityName}-${i}`}
                            role="option"
                            tabIndex={0}
                            className="settings-city-suggestions__item"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              onSelectSuggestion(index, item)
                            }}
                          >
                            {item.displayName}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
                <SettingsHint>
                  {apiKey.trim() ? 'Start typing for city suggestions (OpenWeather).' : 'Set VITE_OPENWEATHER_API_KEY for suggestions.'}
                </SettingsHint>
              </SettingsField>
              <SettingsField>
                <SettingsLabel>Display name override</SettingsLabel>
                <SettingsInputFrame>
                  <input
                    type="text"
                    placeholder="Optional custom name"
                    disabled={isLoading}
                    value={entry.displayName}
                    onChange={(e) => updateCity(index, { displayName: e.target.value })}
                  />
                </SettingsInputFrame>
              </SettingsField>
              <SettingsButtonFrame>
                <button
                  type="button"
                  disabled={isLoading || cities.length <= 1}
                  onClick={() => removeCity(index)}
                >
                  Remove
                </button>
              </SettingsButtonFrame>
            </SettingsBox>
          ))}
          <SettingsButtonFrame>
            <button type="button" disabled={isLoading} onClick={addCity}>
              Add another city
            </button>
          </SettingsButtonFrame>
        </>
      )}

      {locationMode === 'manual' && cities.length > 1 && (
        <>
          <SettingsDivider />
          <SettingsHeading>Multi-City</SettingsHeading>
          <SettingsField>
            <SettingsLabel>Cycle duration (sec)</SettingsLabel>
            <SettingsSliderFrame>
              <input
                type="range"
                min={5}
                max={60}
                disabled={isLoading}
                value={cycleDuration}
                onChange={(e) => setCycleDuration(Number(e.target.value))}
              />
              <span>{cycleDuration}s</span>
            </SettingsSliderFrame>
          </SettingsField>
          <SettingsField>
            <SettingsLabel>Transition style</SettingsLabel>
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
        </>
      )}

      <SettingsDivider />
      <SettingsHeading>Display</SettingsHeading>
      <SettingsField>
        <SettingsLabel>Temperature units</SettingsLabel>
        <SettingsRadioFrame>
          <input
            type="radio"
            name="temperatureUnits"
            value="celsius"
            disabled={isLoading}
            checked={temperatureUnits === 'celsius'}
            onChange={() => setTemperatureUnits('celsius')}
          />
          <SettingsRadioLabel>Celsius</SettingsRadioLabel>
        </SettingsRadioFrame>
        <SettingsRadioFrame>
          <input
            type="radio"
            name="temperatureUnits"
            value="fahrenheit"
            disabled={isLoading}
            checked={temperatureUnits === 'fahrenheit'}
            onChange={() => setTemperatureUnits('fahrenheit')}
          />
          <SettingsRadioLabel>Fahrenheit</SettingsRadioLabel>
        </SettingsRadioFrame>
      </SettingsField>
      <SettingsField>
        <SettingsLabel>Forecast range</SettingsLabel>
        <SettingsSelectFrame>
          <select
            disabled={isLoading}
            value={forecastRange}
            onChange={(e) =>
              setForecastRange(e.target.value as '24-hour' | '3-day' | '7-day')
            }
          >
            <option value="24-hour">24-hour</option>
            <option value="3-day">3-day</option>
            <option value="7-day">7-day</option>
          </select>
        </SettingsSelectFrame>
      </SettingsField>
      <SettingsField>
        <SettingsSwitchFrame>
          <input
            type="checkbox"
            role="switch"
            disabled={isLoading}
            checked={showDate}
            onChange={(e) => setShowDate(e.target.checked)}
          />
          <SettingsSwitchLabel>Show date</SettingsSwitchLabel>
        </SettingsSwitchFrame>
      </SettingsField>

      <SettingsDivider />
      <SettingsHeading>Background</SettingsHeading>
      <SettingsField>
        <SettingsLabel>Background type</SettingsLabel>
        <SettingsSelectFrame>
          <select
            disabled={isLoading}
            value={backgroundType}
            onChange={(e) =>
              setBackgroundType(e.target.value as 'default' | 'solid' | 'gradient' | 'image' | 'video')
            }
          >
            <option value="default">Default (weather-matched)</option>
            <option value="solid">Solid color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </SettingsSelectFrame>
      </SettingsField>

      {backgroundType === 'solid' && (
        <SettingsField>
          <SettingsLabel>Solid color</SettingsLabel>
          <SettingsColorFrame>
            <input
              type="color"
              disabled={isLoading}
              value={solidColor}
              onChange={(e) => setSolidColor(e.target.value)}
            />
            <span>{solidColor}</span>
          </SettingsColorFrame>
        </SettingsField>
      )}

      {backgroundType === 'gradient' && (
        <>
          <SettingsField>
            <SettingsLabel>Gradient color 1</SettingsLabel>
            <SettingsColorFrame>
              <input
                type="color"
                disabled={isLoading}
                value={gradientColor1}
                onChange={(e) => setGradientColor1(e.target.value)}
              />
              <span>{gradientColor1}</span>
            </SettingsColorFrame>
          </SettingsField>
          <SettingsField>
            <SettingsLabel>Gradient color 2</SettingsLabel>
            <SettingsColorFrame>
              <input
                type="color"
                disabled={isLoading}
                value={gradientColor2}
                onChange={(e) => setGradientColor2(e.target.value)}
              />
              <span>{gradientColor2}</span>
            </SettingsColorFrame>
          </SettingsField>
          <SettingsField>
            <SettingsLabel>Gradient direction</SettingsLabel>
            <SettingsSelectFrame>
              <select
                disabled={isLoading}
                value={gradientDirection}
                onChange={(e) =>
                  setGradientDirection(
                    e.target.value as
                      | 'top-to-bottom'
                      | 'bottom-to-top'
                      | 'left-to-right'
                      | 'right-to-left'
                  )
                }
              >
                <option value="top-to-bottom">Top to bottom</option>
                <option value="bottom-to-top">Bottom to top</option>
                <option value="left-to-right">Left to right</option>
                <option value="right-to-left">Right to left</option>
              </select>
            </SettingsSelectFrame>
          </SettingsField>
        </>
      )}

      {backgroundType === 'image' && (
        <SettingsField>
          <SettingsLabel>Image</SettingsLabel>
          <SettingsSelectFrame>
            <select
              disabled={isLoading}
              value={backgroundImageId}
              onChange={(e) => setBackgroundImageId(e.target.value)}
            >
              <option value="">None</option>
              {imageOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </SettingsSelectFrame>
        </SettingsField>
      )}

      {backgroundType === 'video' && (
        <SettingsField>
          <SettingsLabel>Video</SettingsLabel>
          <SettingsSelectFrame>
            <select
              disabled={isLoading}
              value={backgroundVideoId}
              onChange={(e) => setBackgroundVideoId(e.target.value)}
            >
              <option value="">None</option>
              {videoOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </SettingsSelectFrame>
        </SettingsField>
      )}

      {(backgroundType === 'image' || backgroundType === 'video') && (
        <>
          <SettingsField>
            <SettingsLabel>Overlay color</SettingsLabel>
            <SettingsColorFrame>
              <input
                type="color"
                disabled={isLoading}
                value={overlayColor}
                onChange={(e) => setOverlayColor(e.target.value)}
              />
              <span>{overlayColor}</span>
            </SettingsColorFrame>
          </SettingsField>
          <SettingsField>
            <SettingsLabel>Overlay opacity (%)</SettingsLabel>
            <SettingsSliderFrame>
              <input
                type="range"
                min={0}
                max={100}
                disabled={isLoading}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              />
              <span>{overlayOpacity}%</span>
            </SettingsSliderFrame>
          </SettingsField>
        </>
      )}

      <SettingsDivider />
      <SettingsHeading>Layout</SettingsHeading>
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
        <SettingsHint>Scales text and spacing for different screen sizes.</SettingsHint>
      </SettingsField>
    </SettingsContainer>
  )
}
