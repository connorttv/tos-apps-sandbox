/**
 * OpenWeatherMap Geocoding API for city suggestions.
 * Same API key as weather (no separate registration).
 * @see https://openweathermap.org/api/geocoding-api
 */
import { proxy } from '@telemetryos/sdk'

const GEO_DIRECT = 'https://api.openweathermap.org/geo/1.0/direct'

export interface CitySuggestion {
  cityName: string
  displayName: string
}

interface GeoItem {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

export async function fetchCitySuggestions(
  query: string,
  apiKey: string,
  limit = 5
): Promise<CitySuggestion[]> {
  const q = query.trim()
  if (!q || q.length < 2 || !apiKey?.trim()) return []

  const url = `${GEO_DIRECT}?q=${encodeURIComponent(q)}&limit=${limit}&appid=${apiKey}`
  const res = await proxy().fetch(url)
  if (!res.ok) return []

  const data = (await res.json()) as GeoItem[]
  if (!Array.isArray(data)) return []

  return data.map((item) => {
    const cityName = item.state
      ? `${item.name},${item.state},${item.country}`
      : `${item.name},${item.country}`
    const displayName = item.state
      ? `${item.name}, ${item.state}, ${item.country}`
      : `${item.name}, ${item.country}`
    return { cityName, displayName }
  })
}
