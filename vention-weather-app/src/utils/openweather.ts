/**
 * Fetch current weather and forecast from OpenWeatherMap (used by Render fallback when worker cache is empty).
 */
import { proxy } from '@telemetryos/sdk'
import type { WeatherCacheEntry } from '../hooks/store'

const OPENWEATHER_CURRENT = 'https://api.openweathermap.org/data/2.5/weather'
const OPENWEATHER_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast'

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

export async function fetchOpenWeather(
  apiKey: string,
  cityName: string
): Promise<WeatherCacheEntry | null> {
  const q = encodeURIComponent(cityName.trim())
  const units = 'metric'
  const base = `appid=${apiKey}&units=${units}&q=${q}`

  try {
    const currentRes = await proxy().fetch(`${OPENWEATHER_CURRENT}?${base}`)
    if (!currentRes.ok) return null

    const current = await currentRes.json()
    const tempC = current.main.temp
    const feelsC = current.main.feels_like
    const windKph = msToKph(current.wind.speed)
    const weatherId = current.weather?.[0]?.id ?? 800
    const description = current.weather?.[0]?.description ?? ''

    let forecast: WeatherCacheEntry['forecast'] = []
    const forecastRes = await proxy().fetch(`${OPENWEATHER_FORECAST}?${base}&cnt=40`)
    if (forecastRes.ok) {
      const data = await forecastRes.json()
      const list = data.list ?? []
      forecast = list.slice(0, 40).map(
        (
          item: {
            dt_txt: string
            main: { temp: number }
            pop?: number
            weather?: Array<{ id: number }>
          },
          i: number
        ) => ({
          label: formatForecastLabel(item.dt_txt, i >= 8),
          dt_txt: item.dt_txt,
          temp: item.main.temp,
          precip: item.pop != null ? Math.round(item.pop * 100) : undefined,
          weatherCode: item.weather?.[0]?.id,
        })
      )
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
