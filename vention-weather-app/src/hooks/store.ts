import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

// --- OpenWeather (worker writes, Render reads; API key from .env) ---
export interface WeatherCacheConditions {
  temperatureC: number
  temperatureF: number
  temperatureFeelsLikeC: number
  temperatureFeelsLikeF: number
  weatherDescription: string
  weatherCode: number
  humidity: number
  windSpeedKph: number
  windSpeedMph: number
  sunriseSec?: number
  sunsetSec?: number
}

export interface WeatherCacheForecastRow {
  label: string
  /** ISO date-time from API for 3-day strip weekday label */
  dt_txt?: string
  temp: number
  precip?: number
  weatherCode?: number
}

export interface WeatherCacheEntry {
  conditions: WeatherCacheConditions
  forecast: WeatherCacheForecastRow[]
  fetchedAt: number
}

export type WeatherCache = Record<string, WeatherCacheEntry>

export const useWeatherCacheState = createUseInstanceStoreState<WeatherCache>('weatherCache', {})

// --- Location ---
export type LocationMode = 'manual' | 'automatic'
export interface CityEntry {
  cityName: string
  displayName: string
}

export const useLocationModeState = createUseInstanceStoreState<LocationMode>('locationMode', 'manual')
export const useCitiesState = createUseInstanceStoreState<CityEntry[]>('cities', [{ cityName: '', displayName: '' }])

// --- Multi-City ---
export type TransitionStyle = 'fade' | 'slide' | 'instant'
export const useCycleDurationState = createUseInstanceStoreState<number>('cycleDuration', 15)
export const useTransitionStyleState = createUseInstanceStoreState<TransitionStyle>('transitionStyle', 'fade')

// --- Display ---
export type TemperatureUnits = 'celsius' | 'fahrenheit'
export type ForecastRange = '24-hour' | '3-day' | '7-day'
export const useTemperatureUnitsState = createUseInstanceStoreState<TemperatureUnits>('temperatureUnits', 'celsius')
export const useForecastRangeState = createUseInstanceStoreState<ForecastRange>('forecastRange', '24-hour')
export const useShowDateState = createUseInstanceStoreState<boolean>('showDate', true)

// --- Background ---
export type BackgroundType = 'default' | 'solid' | 'gradient' | 'image' | 'video'
export type GradientDirection = 'top-to-bottom' | 'bottom-to-top' | 'left-to-right' | 'right-to-left'
export const useBackgroundTypeState = createUseInstanceStoreState<BackgroundType>('backgroundType', 'default')
export const useSolidColorState = createUseInstanceStoreState<string>('solidColor', '#000000')
export const useGradientColor1State = createUseInstanceStoreState<string>('gradientColor1', '#000000')
export const useGradientColor2State = createUseInstanceStoreState<string>('gradientColor2', '#333333')
export const useGradientDirectionState = createUseInstanceStoreState<GradientDirection>('gradientDirection', 'top-to-bottom')
export const useBackgroundImageIdState = createUseInstanceStoreState<string>('backgroundImageId', '')
export const useBackgroundVideoIdState = createUseInstanceStoreState<string>('backgroundVideoId', '')
export const useOverlayColorState = createUseInstanceStoreState<string>('overlayColor', '#000000')
export const useOverlayOpacityState = createUseInstanceStoreState<number>('overlayOpacity', 40)

// --- UI Scale (for REM scaling) ---
export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)
