---
name: tos-weather-api
description: Integrate TelemetryOS Weather API for current conditions and forecasts. Use when building weather displays or any app that needs location-based weather data.
---

# TelemetryOS Weather API

The Weather API provides current conditions, hourly forecasts, and daily forecasts for any location.

## Quick Reference

```typescript
import { weather } from '@telemetryos/sdk'

// Current conditions
const conditions = await weather().getConditions({
  city: 'New York',
  units: 'imperial'
})

// Hourly forecast (next 24 hours)
const hourly = await weather().getHourlyForecast({
  city: 'New York',
  units: 'imperial',
  hours: 24
})

// Daily forecast (next 7 days)
const daily = await weather().getDailyForecast({
  city: 'New York',
  units: 'imperial',
  days: 7
})
```

## Location Parameters

Specify location using ONE of these methods:

### By City Name

```typescript
// City only
{ city: 'New York' }

// City with country
{ city: 'London, UK' }

// City with state (US)
{ city: 'Portland, OR' }
```

### By Postal Code

```typescript
{ postalCode: '10001' }
```

### By Coordinates

```typescript
{ lat: '40.7128', lon: '-74.0060' }
```

## Units

```typescript
// Fahrenheit, miles, etc.
{ units: 'imperial' }

// Celsius, kilometers, etc.
{ units: 'metric' }
```

## Response Types

### WeatherConditions (Current)

```typescript
interface WeatherConditions {
  EpochTime: number
  WeatherText: string
  WeatherIcon: number
  HasPrecipitation: boolean
  PrecipitationType: string | null
  IsDayTime: boolean
  Temperature: {
    Metric: { Value: number; Unit: string }
    Imperial: { Value: number; Unit: string }
  }
  RealFeelTemperature: {
    Metric: { Value: number; Unit: string }
    Imperial: { Value: number; Unit: string }
  }
  RelativeHumidity: number
  Wind: {
    Direction: { Degrees: number; English: string }
    Speed: {
      Metric: { Value: number; Unit: string }
      Imperial: { Value: number; Unit: string }
    }
  }
  UVIndex: number
  UVIndexText: string
  Visibility: {
    Metric: { Value: number; Unit: string }
    Imperial: { Value: number; Unit: string }
  }
  CloudCover: number
  Pressure: {
    Metric: { Value: number; Unit: string }
    Imperial: { Value: number; Unit: string }
  }
}
```

### WeatherForecast (Hourly/Daily)

```typescript
interface WeatherForecast {
  DateTime: string
  EpochDateTime: number
  WeatherIcon: number
  IconPhrase: string
  HasPrecipitation: boolean
  PrecipitationType?: string
  PrecipitationIntensity?: string
  IsDaylight: boolean
  Temperature: {
    Value: number
    Unit: string
  }
  RealFeelTemperature: {
    Value: number
    Unit: string
  }
  Wind: {
    Speed: { Value: number; Unit: string }
    Direction: { Degrees: number; English: string }
  }
  RelativeHumidity: number
  PrecipitationProbability: number
}
```

## Complete Example

### Settings (City + Units Selection)

```typescript
// hooks/store.ts
import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export const useCityState = createUseInstanceStoreState<string>('city', '')
export const useUnitsState = createUseInstanceStoreState<'imperial' | 'metric'>('units', 'imperial')
```

```typescript
// views/Settings.tsx
import {
  SettingsContainer,
  SettingsField,
  SettingsLabel,
  SettingsInputFrame,
  SettingsSelectFrame,
} from '@telemetryos/sdk/react'
import { useCityState, useUnitsState } from '../hooks/store'

export default function Settings() {
  const [isLoadingCity, city, setCity] = useCityState()
  const [isLoadingUnits, units, setUnits] = useUnitsState()

  return (
    <SettingsContainer>
      <SettingsField>
        <SettingsLabel>City</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="text"
            placeholder="Enter city name..."
            disabled={isLoadingCity}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </SettingsInputFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Temperature Units</SettingsLabel>
        <SettingsSelectFrame>
          <select
            disabled={isLoadingUnits}
            value={units}
            onChange={(e) => setUnits(e.target.value as 'imperial' | 'metric')}
          >
            <option value="imperial">Fahrenheit</option>
            <option value="metric">Celsius</option>
          </select>
        </SettingsSelectFrame>
      </SettingsField>
    </SettingsContainer>
  )
}
```

### Render (Weather Display)

```typescript
// views/Render.tsx
import { useEffect, useState } from 'react'
import { weather } from '@telemetryos/sdk'
import { useCityState, useUnitsState } from '../hooks/store'

interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
}

export default function Render() {
  const [isLoadingCity, city] = useCityState()
  const [isLoadingUnits, units] = useUnitsState()

  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoadingCity || isLoadingUnits || !city) return

    const fetchWeather = async () => {
      setLoading(true)
      setError(null)

      try {
        const conditions = await weather().getConditions({ city, units })

        const tempKey = units === 'imperial' ? 'Imperial' : 'Metric'

        setData({
          temperature: conditions.Temperature[tempKey].Value,
          description: conditions.WeatherText,
          humidity: conditions.RelativeHumidity,
          windSpeed: conditions.Wind.Speed[tempKey].Value,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [city, units, isLoadingCity, isLoadingUnits])

  // Loading states
  if (isLoadingCity || isLoadingUnits) return <div>Loading config...</div>
  if (!city) return <div>Configure city in Settings</div>
  if (loading && !data) return <div>Loading weather...</div>
  if (error && !data) return <div>Error: {error}</div>

  const unitSymbol = units === 'imperial' ? '°F' : '°C'
  const speedUnit = units === 'imperial' ? 'mph' : 'km/h'

  return (
    <div className="weather-display">
      <h1>{city}</h1>
      {data && (
        <>
          <div className="temperature">
            {Math.round(data.temperature)}{unitSymbol}
          </div>
          <div className="description">{data.description}</div>
          <div className="details">
            <span>Humidity: {data.humidity}%</span>
            <span>Wind: {data.windSpeed} {speedUnit}</span>
          </div>
        </>
      )}
    </div>
  )
}
```

## Forecast Example

```typescript
import { weather } from '@telemetryos/sdk'

// Get 5-day forecast
const forecast = await weather().getDailyForecast({
  city: 'New York',
  units: 'imperial',
  days: 5
})

forecast.forEach(day => {
  console.log(`${day.DateTime}: ${day.Temperature.Value}° - ${day.IconPhrase}`)
})
```

## Weather Icons

The API returns `WeatherIcon` as a number (1-44). Map to your icon set:

```typescript
const iconMap: Record<number, string> = {
  1: 'sunny',
  2: 'mostly-sunny',
  3: 'partly-sunny',
  4: 'intermittent-clouds',
  5: 'hazy-sunshine',
  6: 'mostly-cloudy',
  7: 'cloudy',
  8: 'dreary',
  11: 'fog',
  12: 'showers',
  13: 'mostly-cloudy-showers',
  14: 'partly-sunny-showers',
  15: 'thunderstorms',
  16: 'mostly-cloudy-thunderstorms',
  17: 'partly-sunny-thunderstorms',
  18: 'rain',
  19: 'flurries',
  20: 'mostly-cloudy-flurries',
  21: 'partly-sunny-flurries',
  22: 'snow',
  23: 'mostly-cloudy-snow',
  24: 'ice',
  25: 'sleet',
  26: 'freezing-rain',
  29: 'rain-and-snow',
  30: 'hot',
  31: 'cold',
  32: 'windy',
  33: 'clear-night',
  34: 'mostly-clear-night',
  35: 'partly-cloudy-night',
  36: 'intermittent-clouds-night',
  37: 'hazy-moonlight',
  38: 'mostly-cloudy-night',
  39: 'partly-cloudy-showers-night',
  40: 'mostly-cloudy-showers-night',
  41: 'partly-cloudy-thunderstorms-night',
  42: 'mostly-cloudy-thunderstorms-night',
  43: 'mostly-cloudy-flurries-night',
  44: 'mostly-cloudy-snow-night',
}

function getIconName(iconNumber: number): string {
  return iconMap[iconNumber] || 'unknown'
}
```

## Error Handling

```typescript
try {
  const conditions = await weather().getConditions({ city, units })
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes('timeout')) {
      // Request timed out (30 second limit)
    } else if (err.message.includes('not found')) {
      // City not found
    } else {
      // Other error
    }
  }
}
```

## Tips

1. **Cache results** - Weather doesn't change rapidly; refresh every 10-30 minutes
2. **Handle loading** - Show skeleton or spinner while fetching
3. **Show stale data** - Display last known data while refreshing
4. **Validate city** - Weather API may fail for invalid city names
5. **Use coordinates** - More reliable than city names for precise locations
