/**
 * Background worker: fetches weather from OpenWeatherMap and writes to instance store.
 * API key is read from env: VITE_OPENWEATHER_API_KEY (.env file).
 * Cities are read from instance store (Settings).
 */
import { configure, store, proxy } from '@telemetryos/sdk'

function getApiKey(): string {
  return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENWEATHER_API_KEY) || ''
}

const APP_NAME = 'telemetryos-weather-app'

interface CityEntry {
  cityName: string
  displayName: string
}

interface WeatherCacheConditions {
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

interface WeatherCacheForecastRow {
  label: string
  temp: number
  precip?: number
  weatherCode?: number
}

interface WeatherCacheEntry {
  conditions: WeatherCacheConditions
  forecast: WeatherCacheForecastRow[]
  fetchedAt: number
}

type WeatherCache = Record<string, WeatherCacheEntry>
const REFRESH_MS = 10 * 60 * 1000
const OPENWEATHER_CURRENT = 'https://api.openweathermap.org/data/2.5/weather'
const OPENWEATHER_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast'

configure(APP_NAME)

interface OpenWeatherCurrent {
  main: { temp: number; feels_like: number; humidity: number }
  weather: Array<{ id: number; description: string }>
  wind: { speed: number }
  sys?: { sunrise: number; sunset: number }
}

interface OpenWeatherForecastItem {
  dt_txt: string
  main: { temp: number }
  pop?: number
  weather?: Array<{ id: number }>
}

interface OpenWeatherForecast {
  list: OpenWeatherForecastItem[]
}

function cToF(c: number): number {
  return (c * 9) / 5 + 32
}

function msToKph(ms: number): number {
  return ms * 3.6
}

function kphToMph(kph: number): number {
  return kph * 0.621371
}

function formatForecastLabel(dtTxt: string, isDaily: boolean): string {
  const d = new Date(dtTxt)
  return isDaily
    ? d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

async function fetchCityWeather(
  apiKey: string,
  cityName: string,
  forecastDays: number
): Promise<WeatherCacheEntry | null> {
  const units = 'metric'
  const q = encodeURIComponent(cityName.trim())
  const base = `appid=${apiKey}&units=${units}&q=${q}`

  try {
    const currentUrl = `${OPENWEATHER_CURRENT}?${base}`
    const currentRes = await proxy().fetch(currentUrl)
    if (!currentRes.ok) return null
    const current: OpenWeatherCurrent = await currentRes.json()

    const tempC = current.main.temp
    const feelsC = current.main.feels_like
    const windKph = msToKph(current.wind.speed)
    const weatherId = current.weather[0]?.id ?? 800
    const description = current.weather[0]?.description ?? ''

    let forecast: WeatherCacheEntry['forecast'] = []
    const forecastUrl = `${OPENWEATHER_FORECAST}?${base}&cnt=40`
    const forecastRes = await proxy().fetch(forecastUrl)
    if (forecastRes.ok) {
      const data: OpenWeatherForecast = await forecastRes.json()
      forecast = data.list.slice(0, 40).map((item, i) => ({
        label: formatForecastLabel(item.dt_txt, i >= 8),
        dt_txt: item.dt_txt,
        temp: item.main.temp,
        precip: item.pop != null ? Math.round(item.pop * 100) : undefined,
        weatherCode: item.weather?.[0]?.id,
      }))
    }

    return {
      conditions: {
        temperatureC: tempC,
        temperatureF: cToF(tempC),
        temperatureFeelsLikeC: feelsC,
        temperatureFeelsLikeF: cToF(feelsC),
        weatherDescription: description,
        weatherCode: weatherId,
        humidity: current.main.humidity,
        windSpeedKph: windKph,
        windSpeedMph: kphToMph(windKph),
        sunriseSec: current.sys?.sunrise,
        sunsetSec: current.sys?.sunset,
      },
      forecast,
      fetchedAt: Date.now(),
    }
  } catch {
    return null
  }
}

async function syncWeather(): Promise<void> {
  try {
    const apiKey = getApiKey()
    const cities = await store().instance.get<CityEntry[]>('cities')

    if (!apiKey?.trim() || !cities?.length) {
      await store().instance.set('weatherCache', {})
      return
    }

    const cache: WeatherCache = {}
    const cityNames = new Set<string>()

    for (const entry of cities) {
      const name = entry.cityName?.trim()
      if (!name || cityNames.has(name)) continue
      cityNames.add(name)
      const entryData = await fetchCityWeather(apiKey, name, 7)
      if (entryData) cache[name] = entryData
    }

    await store().instance.set('weatherCache', cache)
  } catch (e) {
    console.error('[weather-sync]', e)
  }
}

async function run(): Promise<void> {
  await syncWeather()
  setInterval(syncWeather, REFRESH_MS)
}

run()
