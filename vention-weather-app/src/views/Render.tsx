import { useEffect, useState, useMemo, useRef } from 'react'
import { media } from '@telemetryos/sdk'
import { useUiScaleToSetRem } from '@telemetryos/sdk/react'
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
  useWeatherCacheState,
  type WeatherCacheConditions,
  type WeatherCacheForecastRow,
} from '../hooks/store'
import { useLayoutShape } from '../hooks/useLayoutShape'
import { showP2, showP3, type LayoutShape } from '../utils/layoutShape'
import { getWeatherIconCategory, WeatherIcon, SunriseIcon, SunsetIcon } from '../utils/weatherIcons'
import { fetchOpenWeather } from '../utils/openweather'
import type { WeatherCacheEntry } from '../hooks/store'
import './Render.css'

function getOpenWeatherApiKey(): string {
  return (import.meta.env?.VITE_OPENWEATHER_API_KEY as string) ?? ''
}

function getBackgroundFromWeather(iconCategory: string): { bg: string } {
  switch (iconCategory) {
    case 'sun':
      return { bg: 'linear-gradient(135deg, #f5a623 0%, #f7dc6f 50%, #e8b923 100%)' }
    case 'cloud':
    case 'fog':
      return { bg: 'linear-gradient(180deg, #5c6b7a 0%, #3d4f5f 100%)' }
    case 'rain':
    case 'storm':
      return { bg: 'linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)' }
    case 'snow':
      return { bg: 'linear-gradient(180deg, #a8d0e6 0%, #d4e8f0 50%, #7eb8da 100%)' }
    case 'night':
      return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }
    default:
      return { bg: 'linear-gradient(180deg, #4a6fa5 0%, #2e4a6f 100%)' }
  }
}

function formatDate(iso: string, showDate: boolean): string {
  if (!showDate) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

const TIME_DATE_LOCALE = 'en-US'

function formatDateLong(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(TIME_DATE_LOCALE, { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(TIME_DATE_LOCALE, { hour: 'numeric', minute: '2-digit' })
}

function formatTimeFromSec(sec: number): string {
  return new Date(sec * 1000).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, '').match(/.{2}/g)
  if (!m) return [0, 0, 0]
  return m.map((x) => parseInt(x, 16)) as [number, number, number]
}

/** Scale: cover by default; contain for chiron/skyscraper so strip fits any aspect (e.g. 2:13). */
function useViewportScale(renderRef: React.RefObject<HTMLDivElement | null>, shape: LayoutShape): number {
  const [scale, setScale] = useState(1)
  const useContain = shape === 'chiron' || shape === 'skyscraper'
  useEffect(() => {
    const el = renderRef.current
    if (!el) return
    const update = () => {
      const el2 = renderRef.current
      if (!el2) return
      const w = el2.clientWidth
      const h = el2.clientHeight
      if (w > 0 && h > 0) {
        const scaleCover = Math.max(window.innerWidth / w, window.innerHeight / h)
        const scaleContain = Math.min(window.innerWidth / w, window.innerHeight / h)
        setScale(useContain ? scaleContain : scaleCover)
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [shape, useContain])
  return scale
}

export function Render() {
  const [, uiScale] = useUiScaleStoreState()
  useUiScaleToSetRem(uiScale)

  const [isLoadingMode, locationMode] = useLocationModeState()
  const [isLoadingCities, cities] = useCitiesState()
  const [, cycleDuration] = useCycleDurationState()
  const [, transitionStyle] = useTransitionStyleState()
  const [isLoadingUnits, temperatureUnits] = useTemperatureUnitsState()
  const [isLoadingForecast, forecastRange] = useForecastRangeState()
  const [, showDate] = useShowDateState()
  const [isLoadingBg, backgroundType] = useBackgroundTypeState()
  const [, solidColor] = useSolidColorState()
  const [, gradientColor1] = useGradientColor1State()
  const [, gradientColor2] = useGradientColor2State()
  const [, gradientDirection] = useGradientDirectionState()
  const [, backgroundImageId] = useBackgroundImageIdState()
  const [, backgroundVideoId] = useBackgroundVideoIdState()
  const [, overlayColor] = useOverlayColorState()
  const [, overlayOpacity] = useOverlayOpacityState()

  const shape = useLayoutShape()
  const renderRef = useRef<HTMLDivElement>(null)
  const viewportScale = useViewportScale(renderRef, shape)

  const unitSymbol = '°'
  const unitLabel = temperatureUnits === 'fahrenheit' ? '°F' : '°C'

  const effectiveCities = useMemo(() => {
    if (locationMode === 'automatic') return [{ cityName: '', displayName: 'Current location' }]
    return cities.filter((c) => c.cityName.trim() !== '')
  }, [locationMode, cities])

  const [cityIndex, setCityIndex] = useState(0)
  const currentCity = effectiveCities[cityIndex % Math.max(1, effectiveCities.length)] ?? effectiveCities[0]

  useEffect(() => {
    if (effectiveCities.length <= 1) return
    const id = setInterval(() => {
      setCityIndex((i) => i + 1)
    }, cycleDuration * 1000)
    return () => clearInterval(id)
  }, [effectiveCities.length, cycleDuration])

  const [isLoadingCache, weatherCache] = useWeatherCacheState()
  const [fallbackEntry, setFallbackEntry] = useState<WeatherCacheEntry | null>(null)
  const [fallbackLoading, setFallbackLoading] = useState(false)
  const fallbackForCityRef = useRef<string | null>(null)
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null)
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>(null)

  const cityQuery = useMemo(() => {
    if (locationMode === 'automatic') return null
    const name = currentCity?.cityName?.trim()
    return name || null
  }, [locationMode, currentCity])

  const cacheEntry = cityQuery ? weatherCache[cityQuery] : null
  const fallbackMatchesCity = cityQuery && fallbackEntry && fallbackForCityRef.current === cityQuery
  const dataEntry = cacheEntry ?? (fallbackMatchesCity ? fallbackEntry : null)

  const [displayCity, setDisplayCity] = useState<string | null>(null)
  const [displayData, setDisplayData] = useState<WeatherCacheEntry | null>(null)

  useEffect(() => {
    if (cityQuery && dataEntry) {
      setDisplayCity(cityQuery)
      setDisplayData(dataEntry)
    }
  }, [cityQuery, dataEntry])

  const apiKey = getOpenWeatherApiKey()
  useEffect(() => {
    if (!cityQuery || !apiKey?.trim() || cacheEntry) {
      setFallbackEntry(null)
      fallbackForCityRef.current = null
      return
    }
    fallbackForCityRef.current = null
    setFallbackEntry(null)
    let cancelled = false
    setFallbackLoading(true)
    fetchOpenWeather(apiKey, cityQuery)
      .then((entry) => {
        if (!cancelled && entry) {
          fallbackForCityRef.current = cityQuery
          setFallbackEntry(entry)
        }
      })
      .catch(() => {
        if (!cancelled) setFallbackEntry(null)
      })
      .finally(() => {
        if (!cancelled) setFallbackLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [cityQuery, cacheEntry, apiKey])

  const conditions: WeatherCacheConditions | null = displayData?.conditions ?? null
  const rawForecast = displayData?.forecast ?? []
  const forecastRows: WeatherCacheForecastRow[] = useMemo(() => {
    if (rawForecast.length === 0) return []
    if (forecastRange === '24-hour') return rawForecast.slice(0, 8)
    if (forecastRange === '3-day') return [rawForecast[0], rawForecast[8], rawForecast[16]].filter(Boolean)
    if (forecastRange === '7-day') return [rawForecast[0], rawForecast[8], rawForecast[16], rawForecast[24], rawForecast[32]].filter(Boolean)
    return rawForecast.slice(0, 8)
  }, [rawForecast, forecastRange])

  /** 3-day labels (Mon, Tue, Wed) from dt_txt for portrait-bar, skyscraper, chiron. */
  const portraitBarForecastRows: WeatherCacheForecastRow[] = useMemo(() => {
    const dayRows = [rawForecast[0], rawForecast[8], rawForecast[16]].filter(
      (r): r is WeatherCacheForecastRow => Boolean(r)
    )
    return dayRows.map((row) => {
      const dayLabel = row.dt_txt
        ? new Date(row.dt_txt).toLocaleDateString(TIME_DATE_LOCALE, { weekday: 'short' })
        : row.label.includes(',')
          ? row.label.split(',')[0].trim()
          : row.label.slice(0, 3)
      return { ...row, label: dayLabel }
    })
  }, [rawForecast])
  const loading = Boolean(cityQuery && !displayData && (isLoadingCache || fallbackLoading))

  useEffect(() => {
    if (backgroundType !== 'image' || !backgroundImageId) {
      setBgImageUrl(null)
      return
    }
    let cancelled = false
    media()
      .getById(backgroundImageId)
      .then((item) => {
        if (!cancelled && item?.publicUrls?.length) setBgImageUrl(item.publicUrls[0])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [backgroundType, backgroundImageId])

  useEffect(() => {
    if (backgroundType !== 'video' || !backgroundVideoId) {
      setBgVideoUrl(null)
      return
    }
    let cancelled = false
    media()
      .getById(backgroundVideoId)
      .then((item) => {
        if (!cancelled && item?.publicUrls?.length) setBgVideoUrl(item.publicUrls[0])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [backgroundType, backgroundVideoId])

  const configLoading = isLoadingMode || isLoadingCities || isLoadingUnits || isLoadingForecast || isLoadingBg
  const hasNoCity = locationMode === 'manual' && effectiveCities.length === 0
  const hasError = !configLoading && !loading && !displayData && !hasNoCity && cityQuery !== null
  const automaticNoData = locationMode === 'automatic'

  if (configLoading) return null
  if (hasNoCity || hasError || automaticNoData) return <div className="render render--transparent" aria-hidden />

  const showP2Content = showP2(shape)
  const showP3Content = showP3(shape)
  const displayCityEntry = effectiveCities.find((c) => c.cityName.trim() === displayCity)
  const locationLabel = displayCityEntry?.displayName?.trim() || displayCityEntry?.cityName?.trim() || displayCity || '—'

  const temp = conditions
    ? temperatureUnits === 'fahrenheit'
      ? conditions.temperatureF
      : conditions.temperatureC
    : 0
  const iconCategory = conditions ? getWeatherIconCategory(conditions.weatherCode) : 'sun'
  const nowSec = Math.floor(Date.now() / 1000)
  const isNight =
    conditions?.sunriseSec != null && conditions?.sunsetSec != null
      ? nowSec < conditions.sunriseSec || nowSec > conditions.sunsetSec
      : undefined

  let backgroundStyle: React.CSSProperties = {}
  if (backgroundType === 'default' && conditions) {
    const { bg } = getBackgroundFromWeather(iconCategory)
    backgroundStyle = { background: bg }
  } else if (backgroundType === 'solid') {
    backgroundStyle = { backgroundColor: solidColor }
  } else if (backgroundType === 'gradient') {
    const dir =
      gradientDirection === 'top-to-bottom'
        ? '180deg'
        : gradientDirection === 'bottom-to-top'
          ? '0deg'
          : gradientDirection === 'left-to-right'
            ? '90deg'
            : '270deg'
    backgroundStyle = {
      background: `linear-gradient(${dir}, ${gradientColor1}, ${gradientColor2})`,
    }
  } else if (backgroundType === 'default') {
    backgroundStyle = { background: 'hsl(220 15% 8%)' }
  }

  const overlayStyle =
    (backgroundType === 'image' && bgImageUrl) || (backgroundType === 'video' && bgVideoUrl)
      ? {
          backgroundColor: `rgba(${hexToRgb(overlayColor).join(',')}, ${overlayOpacity / 100})`,
        }
      : undefined

  return (
    <div className="render-viewport" aria-hidden={false}>
      <div
        ref={renderRef}
        className={`render weather weather--${shape}`}
        style={{
          ...backgroundStyle,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${viewportScale})`,
        }}
        data-transition={transitionStyle}
      >
      {backgroundType === 'image' && bgImageUrl && (
        <div className="weather__bg-image" style={{ backgroundImage: `url(${bgImageUrl})` }} />
      )}
      {backgroundType === 'video' && bgVideoUrl && (
        <div className="weather__bg-video">
          <video src={bgVideoUrl} autoPlay loop muted playsInline aria-hidden />
        </div>
      )}
      {(backgroundType === 'image' && bgImageUrl) || (backgroundType === 'video' && bgVideoUrl) ? (
        <div className="weather__overlay" style={overlayStyle} aria-hidden />
      ) : null}

      {loading ? (
        <WeatherSkeleton shape={shape} />
      ) : shape === 'chiron' ? (
        <div key={displayCity ?? ''} className="weather__content-wrapper weather__content-transition">
          <div className="weather__chiron-left">
            <div className="weather__chiron-time">{formatTime(new Date().toISOString())}</div>
            <div className="weather__chiron-temp-row">
              <span className="weather__chiron-icon" aria-hidden>
                <WeatherIcon category={iconCategory} weatherCode={conditions?.weatherCode} isNight={isNight} sizeRem={5} />
              </span>
              <span className="weather__chiron-temp" aria-label={`Temperature ${Math.round(temp)} ${unitLabel}`}>
                {Math.round(temp)}{unitSymbol}
              </span>
            </div>
          </div>
          {portraitBarForecastRows.length > 0 && (
            <footer className="weather__chiron-footer">
              {portraitBarForecastRows.map((row, i) => {
                const displayTemp = temperatureUnits === 'fahrenheit' ? (row.temp * 9) / 5 + 32 : row.temp
                const rowCategory = row.weatherCode != null ? getWeatherIconCategory(row.weatherCode) : iconCategory
                return (
                  <div key={i} className="weather__chiron-footer-group">
                    {i > 0 && <span className="weather__chiron-footer-divider" aria-hidden />}
                    <div className="weather__chiron-footer-row">
                      <span className="weather__chiron-footer-day">{row.label}</span>
                      <span className="weather__chiron-footer-icon" aria-hidden>
                        <WeatherIcon category={rowCategory} weatherCode={row.weatherCode} isNight={isNight} sizeRem={2.5} />
                      </span>
                      <span className="weather__chiron-footer-temp">{Math.round(displayTemp)}{unitSymbol}</span>
                    </div>
                  </div>
                )
              })}
            </footer>
          )}
        </div>
      ) : shape === 'large-square' || shape === 'small-square' ? (
        <div key={displayCity ?? ''} className="weather__content-wrapper weather__content-transition">
          <div className="weather__square-main">
            <h1 className="weather__square-city">{locationLabel || '—'}</h1>
            <div className="weather__square-time">{formatTime(new Date().toISOString())}</div>
          </div>
          <div className="weather__square-bottom">
            <div className="weather__square-temp-row">
              <span className="weather__square-icon" aria-hidden>
                <WeatherIcon category={iconCategory} weatherCode={conditions?.weatherCode} isNight={isNight} sizeRem={5} />
              </span>
              <span className="weather__square-temp" aria-label={`Temperature ${Math.round(temp)} ${unitLabel}`}>
                {Math.round(temp)}{unitSymbol}
              </span>
            </div>
            {showP2Content && conditions && (
              <span className="weather__square-conditions" title={conditions.weatherDescription}>{conditions.weatherDescription}</span>
            )}
          </div>
        </div>
      ) : shape === 'large-portrait' ? (
        <div key={displayCity ?? ''} className="weather__content-wrapper weather__content-transition">
          <div className="weather__large-portrait-main">
            <h1 className="weather__large-portrait-city">{locationLabel || '—'}</h1>
            <div className="weather__large-portrait-time">{formatTime(new Date().toISOString())}</div>
          </div>
          <div className="weather__large-portrait-temp-block">
            <span className="weather__large-portrait-icon" aria-hidden>
              <WeatherIcon category={iconCategory} weatherCode={conditions?.weatherCode} isNight={isNight} sizeRem={5} />
            </span>
            <span className="weather__large-portrait-temp" aria-label={`Temperature ${Math.round(temp)} ${unitLabel}`}>
              {Math.round(temp)}{unitSymbol}
            </span>
          </div>
          {showP2Content && conditions && (
            <div className="weather__large-portrait-conditions" title={conditions.weatherDescription}>{conditions.weatherDescription}</div>
          )}
        </div>
      ) : shape === 'skyscraper' ? (
        <div key={displayCity ?? ''} className="weather__content-wrapper weather__content-transition">
          <div className="weather__skyscraper-time">{formatTime(new Date().toISOString())}</div>
          <div className="weather__skyscraper-temp-block">
            <span className="weather__skyscraper-icon" aria-hidden>
              <WeatherIcon category={iconCategory} weatherCode={conditions?.weatherCode} isNight={isNight} sizeRem={5} />
            </span>
            <span className="weather__skyscraper-temp" aria-label={`Temperature ${Math.round(temp)} ${unitLabel}`}>
              {Math.round(temp)}{unitSymbol}
            </span>
          </div>
          {portraitBarForecastRows.length > 0 && (
            <footer className="weather__skyscraper-footer">
              {portraitBarForecastRows.map((row, i) => {
                const displayTemp = temperatureUnits === 'fahrenheit' ? (row.temp * 9) / 5 + 32 : row.temp
                const rowCategory = row.weatherCode != null ? getWeatherIconCategory(row.weatherCode) : iconCategory
                return (
                  <div key={i} className="weather__skyscraper-footer-group">
                    {i > 0 && <span className="weather__skyscraper-footer-divider" aria-hidden />}
                    <div className="weather__skyscraper-footer-row">
                      <span className="weather__skyscraper-footer-day">{row.label}</span>
                      <span className="weather__skyscraper-footer-icon" aria-hidden>
                        <WeatherIcon category={rowCategory} weatherCode={row.weatherCode} isNight={isNight} sizeRem={3.5} />
                      </span>
                      <span className="weather__skyscraper-footer-temp">{Math.round(displayTemp)}{unitSymbol}</span>
                    </div>
                  </div>
                )
              })}
            </footer>
          )}
        </div>
      ) : shape === 'portrait-bar' ? (
        <div key={displayCity ?? ''} className="weather__content-wrapper weather__content-transition">
          <div className="weather__portrait-bar-main">
            <h1 className="weather__portrait-bar-city">{locationLabel || '—'}</h1>
            <div className="weather__portrait-bar-time">{formatTime(new Date().toISOString())}</div>
          </div>
          <div className="weather__portrait-bar-temp-block">
            <span className="weather__portrait-bar-icon" aria-hidden>
              <WeatherIcon category={iconCategory} weatherCode={conditions?.weatherCode} isNight={isNight} sizeRem={5} />
            </span>
            <span className="weather__portrait-bar-temp" aria-label={`Temperature ${Math.round(temp)} ${unitLabel}`}>
              {Math.round(temp)}{unitSymbol}
            </span>
            {showP2Content && conditions && (
              <span className="weather__portrait-bar-conditions" title={conditions.weatherDescription}>{conditions.weatherDescription}</span>
            )}
          </div>
          {showP3Content && portraitBarForecastRows.length > 0 && (
            <footer className="weather__portrait-bar-footer">
              {portraitBarForecastRows.map((row, i) => {
                const displayTemp = temperatureUnits === 'fahrenheit' ? (row.temp * 9) / 5 + 32 : row.temp
                const rowCategory = row.weatherCode != null ? getWeatherIconCategory(row.weatherCode) : iconCategory
                return (
                  <div key={i} className="weather__portrait-bar-footer-row">
                    <span className="weather__portrait-bar-footer-day">{row.label}</span>
                    <span className="weather__portrait-bar-footer-icon" aria-hidden>
                      <WeatherIcon category={rowCategory} weatherCode={row.weatherCode} isNight={isNight} sizeRem={3.5} />
                    </span>
                    <span className="weather__portrait-bar-footer-temp">{Math.round(displayTemp)}{unitSymbol}</span>
                  </div>
                )
              })}
            </footer>
          )}
        </div>
      ) : shape === 'landscape-bar' ? (
        <div key={displayCity ?? ''} className="weather__content-wrapper weather__content-transition">
          <div className="weather__bar-left">
            <h1 className="weather__bar-city">{locationLabel || '—'}</h1>
            <div className="weather__bar-time">{formatTime(new Date().toISOString())}</div>
            {(conditions?.sunriseSec != null || conditions?.sunsetSec != null) && (
              <div className="weather__bar-sun-row">
                {conditions?.sunriseSec != null && (
                  <span className="weather__sun-item">
                    <SunriseIcon sizeRem={2.5} />
                    {formatTimeFromSec(conditions.sunriseSec)}
                  </span>
                )}
                {conditions?.sunsetSec != null && (
                  <span className="weather__sun-item">
                    <SunsetIcon sizeRem={2.5} />
                    {formatTimeFromSec(conditions.sunsetSec)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="weather__bar-right">
            <div className="weather__bar-temp-row">
              <span className="weather__bar-icon" aria-hidden>
                <WeatherIcon category={iconCategory} weatherCode={conditions?.weatherCode} isNight={isNight} sizeRem={5} />
              </span>
              <span className="weather__bar-temp" aria-label={`Temperature ${Math.round(temp)} ${unitLabel}`}>
                {Math.round(temp)}{unitSymbol}
              </span>
            </div>
            {showP2Content && conditions && (
              <span className="weather__bar-conditions" title={conditions.weatherDescription}>{conditions.weatherDescription}</span>
            )}
          </div>
        </div>
      ) : (
        <div key={displayCity ?? ''} className="weather__content-wrapper">
          <div className="weather__main-block weather__content-transition">
            <h1 className="weather__city-name">{locationLabel || '—'}</h1>
            <div className="weather__temp-row">
              <span className="weather__icon weather__icon--current" aria-hidden>
                <WeatherIcon category={iconCategory} weatherCode={conditions?.weatherCode} isNight={isNight} sizeRem={7} />
              </span>
              <span className="weather__temp" aria-label={`Temperature ${Math.round(temp)} ${unitLabel}`}>
                {Math.round(temp)}{unitSymbol}
              </span>
            </div>
            {(showP2Content && conditions) || conditions?.sunriseSec != null || conditions?.sunsetSec != null ? (
              <div className="weather__conditions-row">
                {showP2Content && conditions && (
                  <span className="weather__conditions" title={conditions.weatherDescription}>{conditions.weatherDescription}</span>
                )}
                {conditions?.sunriseSec != null && (
                  <span className="weather__sun-item">
                    <SunriseIcon sizeRem={2.5} />
                    {formatTimeFromSec(conditions.sunriseSec)}
                  </span>
                )}
                {conditions?.sunsetSec != null && (
                  <span className="weather__sun-item">
                    <SunsetIcon sizeRem={2.5} />
                    {formatTimeFromSec(conditions.sunsetSec)}
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {showP3Content && forecastRows.length > 0 && (
            <footer className="weather__footer weather__content-transition">
              {forecastRows.slice(0, 6).map((row, i) => {
                const displayTemp = temperatureUnits === 'fahrenheit' ? (row.temp * 9) / 5 + 32 : row.temp
                const rowCategory = row.weatherCode != null ? getWeatherIconCategory(row.weatherCode) : iconCategory
                return (
                  <div key={i} className="weather__footer-card">
                    <span className="weather__footer-time">{row.label}</span>
                    <span className="weather__footer-icon" aria-hidden>
                      <WeatherIcon category={rowCategory} weatherCode={row.weatherCode} isNight={isNight} sizeRem={5} />
                    </span>
                    <span className="weather__footer-temp">{Math.round(displayTemp)}{unitSymbol}</span>
                  </div>
                )
              })}
            </footer>
          )}

          <div className="weather__time-date-bar">
            <span className="weather__time-date-time">{formatTime(new Date().toISOString())}</span>
            {showDate && (
              <>
                <span className="weather__time-date-sep" aria-hidden />
                <span className="weather__time-date-date">{formatDateLong(new Date().toISOString())}</span>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function WeatherSkeleton({ shape }: { shape: LayoutShape }) {
  if (shape === 'large-square' || shape === 'small-square') {
    return (
      <div className="weather__content-wrapper weather__skeleton">
        <div className="weather__square-main">
          <span className="weather__square-city weather__temp-skel" style={{ width: 141, height: 25 }} />
          <span className="weather__square-time weather__temp-skel" style={{ width: 217, height: 60 }} />
        </div>
        <div className="weather__square-bottom">
          <div className="weather__square-temp-row">
            <span className="weather__icon-skel" style={{ width: 80, height: 72 }} />
            <span className="weather__temp-skel" style={{ width: 101, height: 86 }} />
          </div>
          <span className="weather__square-conditions weather__temp-skel" style={{ width: 130, height: 25 }} />
        </div>
      </div>
    )
  }
  if (shape === 'skyscraper') {
    return (
      <div className="weather__content-wrapper weather__skeleton">
        <span className="weather__skyscraper-time weather__temp-skel" style={{ width: 92, height: 80 }} />
        <div className="weather__skyscraper-temp-block">
          <span className="weather__icon-skel" style={{ width: 80, height: 72 }} />
          <span className="weather__temp-skel" style={{ width: 101, height: 86 }} />
        </div>
        <footer className="weather__skyscraper-footer">
          {[1, 2, 3].map((i) => (
            <div key={i} className="weather__skyscraper-footer-group">
              {i > 0 && <span className="weather__skyscraper-footer-divider" />}
              <div className="weather__skyscraper-footer-row">
                <span className="weather__temp-skel" style={{ width: 50, height: 30 }} />
                <span className="weather__icon-skel" style={{ width: 56, height: 56 }} />
                <span className="weather__temp-skel" style={{ width: 50, height: 40 }} />
              </div>
            </div>
          ))}
        </footer>
      </div>
    )
  }
  if (shape === 'large-portrait') {
    return (
      <div className="weather__content-wrapper weather__skeleton">
        <div className="weather__large-portrait-main">
          <span className="weather__large-portrait-city weather__temp-skel" style={{ width: 254, height: 45 }} />
          <span className="weather__large-portrait-time weather__temp-skel" style={{ width: 200, height: 98 }} />
        </div>
        <div className="weather__large-portrait-temp-block">
          <span className="weather__icon-skel" style={{ width: 134, height: 122 }} />
          <span className="weather__temp-skel" style={{ width: 149, height: 126 }} />
        </div>
        <span className="weather__large-portrait-conditions weather__temp-skel" style={{ width: 207, height: 40 }} />
      </div>
    )
  }
  if (shape === 'portrait-bar') {
    return (
      <div className="weather__content-wrapper weather__skeleton">
        <div className="weather__portrait-bar-main">
          <span className="weather__portrait-bar-city weather__temp-skel" style={{ width: 170, height: 30 }} />
          <span className="weather__portrait-bar-time weather__temp-skel" style={{ width: 217, height: 60 }} />
        </div>
        <div className="weather__portrait-bar-temp-block">
          <span className="weather__icon-skel" style={{ width: 134, height: 122 }} />
          <span className="weather__temp-skel" style={{ width: 149, height: 126 }} />
          <span className="weather__temp-skel" style={{ width: 155, height: 30 }} />
        </div>
        <footer className="weather__portrait-bar-footer">
          {[1, 2, 3].map((i) => (
            <div key={i} className="weather__portrait-bar-footer-row">
              <span className="weather__temp-skel" style={{ width: 50, height: 30 }} />
              <span className="weather__icon-skel" style={{ width: 56, height: 56 }} />
              <span className="weather__temp-skel" style={{ width: 50, height: 40 }} />
            </div>
          ))}
        </footer>
      </div>
    )
  }
  if (shape === 'landscape-bar') {
    return (
      <div className="weather__content-wrapper weather__skeleton">
        <div className="weather__bar-left">
          <span className="weather__bar-city weather__temp-skel" style={{ width: 254, height: 45 }} />
          <span className="weather__bar-time weather__temp-skel" style={{ width: 200, height: 98 }} />
          <span className="weather__temp-skel" style={{ width: 318, height: 40 }} />
        </div>
        <div className="weather__bar-right">
          <div className="weather__bar-temp-row">
            <span className="weather__icon-skel" style={{ width: 134, height: 122 }} />
            <span className="weather__temp-skel" style={{ width: 190, height: 161 }} />
          </div>
          <span className="weather__temp-skel" style={{ width: 155, height: 30 }} />
        </div>
      </div>
    )
  }
  if (shape === 'chiron') {
    return (
      <div className="weather__content-wrapper weather__skeleton">
        <div className="weather__chiron-left">
          <span className="weather__chiron-time weather__temp-skel" style={{ width: 172, height: 48 }} />
          <div className="weather__chiron-temp-row">
            <span className="weather__chiron-icon weather__icon-skel" style={{ width: 80, height: 72 }} />
            <span className="weather__chiron-temp weather__temp-skel" style={{ width: 101, height: 86 }} />
          </div>
        </div>
        <footer className="weather__chiron-footer">
          {[1, 2, 3].map((i) => (
            <div key={i} className="weather__chiron-footer-group">
              {i > 0 && <span className="weather__chiron-footer-divider" />}
              <div className="weather__chiron-footer-row">
                <span className="weather__temp-skel" style={{ width: 50, height: 30 }} />
                <span className="weather__chiron-footer-icon weather__icon-skel" style={{ width: 40, height: 40 }} />
                <span className="weather__temp-skel" style={{ width: 50, height: 40 }} />
              </div>
            </div>
          ))}
        </footer>
      </div>
    )
  }
  return (
    <>
      <div className="weather__main-block weather__skeleton">
        <span className="weather__city-name weather__temp-skel" style={{ width: 254, height: 45 }} />
        <div className="weather__temp-row">
          <span className="weather__icon-skel" style={{ width: 134, height: 122 }} />
          <span className="weather__temp-skel" style={{ width: 217, height: 184 }} />
        </div>
        <span className="weather__conditions-skel" style={{ width: 155, height: 30 }} />
      </div>
      <div className="weather__footer weather__skeleton">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="weather__footer-card">
            <span className="weather__footer-time weather__temp-skel" />
            <span className="weather__footer-icon weather__icon-skel" />
            <span className="weather__footer-temp weather__temp-skel" />
          </div>
        ))}
      </div>
      <div className="weather__time-date-bar">
        <span className="weather__time-date-time weather__temp-skel" style={{ width: 112, height: 30 }} />
      </div>
    </>
  )
}
