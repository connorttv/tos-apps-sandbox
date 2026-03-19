---
name: tos-store-sync
description: REQUIRED for Settings↔Render data sync. MUST invoke BEFORE adding store keys or store hooks. Contains hook patterns, type definitions, and loading state handling.
---

# TelemetryOS Store Sync

Store hooks enable real-time synchronization between Settings and Render views. When a user changes a setting, the Render view updates automatically.

## From Requirements to Implementation

When you have a requirements table from `tos-requirements`, translate each row to a store hook:

| Key | Category | Scope | Type | Default |
|-----|----------|-------|------|---------|
| city | Localization | instance | string | '' |
| apiKey | Data Config | application | string | '' |
| units | Localization | instance | 'imperial' \| 'metric' | 'imperial' |
| brightness | Display | device | number | 100 |

**Becomes:**

```typescript
// hooks/store.ts
import {
  createUseInstanceStoreState,
  createUseApplicationStoreState,
  createUseDeviceStoreState,
} from '@telemetryos/sdk/react'

// Localization (instance scope)
export const useCityStoreState = createUseInstanceStoreState<string>('city', '')
export const useUnitsStoreState = createUseInstanceStoreState<'imperial' | 'metric'>('units', 'imperial')

// Data Config (application scope - shared across all instances)
export const useApiKeyStoreState = createUseApplicationStoreState<string>('apiKey', '')

// Display (device scope - Render only)
export const useBrightnessStoreState = createUseDeviceStoreState<number>('brightness', 100)
```

**Usage:**
```typescript
// Instance-scoped (Settings + Render) - 250ms debounce for text input
const [, city, setCity] = useCityStoreState(250)

// Application-scoped (shared across all instances) - 250ms debounce for text input
const [, apiKey, setApiKey] = useApiKeyStoreState(250)

// Device-scoped (Render only - NOT available in Settings) - 5ms for slider
const [, brightness, setBrightness] = useBrightnessStoreState(5)
```

## Quick Pattern

### 1. Define Hook (hooks/store.ts)

```typescript
import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

// One hook per store key
export const useCityStoreState = createUseInstanceStoreState<string>('city', '')
export const useUnitsStoreState = createUseInstanceStoreState<'imperial' | 'metric'>('units', 'imperial')
export const useRefreshIntervalStoreState = createUseInstanceStoreState<number>('refreshInterval', 30)
export const useShowForecastStoreState = createUseInstanceStoreState<boolean>('showForecast', true)
```

### 2. Use in Settings (read + write)

```typescript
import { useCityStoreState } from '../hooks/store'

export function Settings() {
  const [isLoading, city, setCity] = useCityStoreState(250) // 250ms debounce for text input

  return (
    <input
      disabled={isLoading}
      value={city}
      onChange={(e) => setCity(e.target.value)}
    />
  )
}
```

### 3. Use in Render (read only)

```typescript
import { useCityStoreState } from '../hooks/store'

export function Render() {
  const [isLoading, city] = useCityStoreState()

  if (isLoading) return <div>Loading...</div>
  if (!city) return <div>Configure city in Settings</div>

  return <div>Weather for {city}</div>
}
```

## Store Scopes

### createUseInstanceStoreState (Most Common)

Use for Settings ↔ Render communication. Each app instance has its own storage.

```typescript
import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export const useCityStoreState = createUseInstanceStoreState<string>('city', '')

// Usage - add 250ms debounce for text inputs
const [isLoading, city, setCity] = useCityStoreState(250)
```

**Use cases:**
- App configuration (city, team name, colors)
- User preferences (units, refresh rate)
- Selected items (folder ID, content ID)

### createUseApplicationStoreState

Shared across ALL instances of this app in the account.

```typescript
import { createUseApplicationStoreState } from '@telemetryos/sdk/react'

export const useApiKeyStoreState = createUseApplicationStoreState<string>('apiKey', '')

// Usage - add 250ms debounce for text inputs
const [isLoading, apiKey, setApiKey] = useApiKeyStoreState(250)
```

**Use cases:**
- API keys (configured once, used everywhere)
- Account-wide defaults
- Shared lookup data

### createUseDeviceStoreState (Render Only)

Local to the physical device. NOT available in Settings. Use for interactive apps where the Render view needs to persist data beyond the current playlist display cycle.

```typescript
import { createUseDeviceStoreState } from '@telemetryos/sdk/react'

export const useBrightnessStoreState = createUseDeviceStoreState<number>('brightness', 100)

// Only in Render.tsx - 5ms debounce for slider
const [isLoading, brightness, setBrightness] = useBrightnessStoreState(5)
```

**Use cases:**
- Interactive app state (user selections, game progress, form inputs)
- Data that should persist when the app cycles out of a playlist and back
- Local cache for expensive computations or API responses
- Device-specific runtime state (not configurable via Settings)

**Note:** Device storage is only available in the Render mount point.

### createUseSharedStoreState

Inter-app communication. Apps can publish/subscribe to shared namespaces.

```typescript
import { createUseSharedStoreState } from '@telemetryos/sdk/react'

export const useTempStoreState = createUseSharedStoreState<string>('temp', '', 'weather-data')

// Weather app publishes
const [, , setTemp] = useTempStoreState()
setTemp('72°F')

// Other apps subscribe
const [isLoading, temp] = useTempStoreState()
```

**Use cases:**
- Data sharing between apps
- Event broadcasting
- Coordinated updates

## Return Value

All hooks return a tuple:

```typescript
const [isLoading, value, setValue] = useCityStoreState()
```

| Index | Name | Type | Description |
|-------|------|------|-------------|
| 0 | isLoading | boolean | `true` until first value received |
| 1 | value | T | Current value (from store or optimistic update) |
| 2 | setValue | Dispatch<SetStateAction<T>> | Updates both local state and store |

The default debounce delay is 0ms (immediate updates). Pass a value for debounced updates:

```typescript
const [isLoading, city, setCity] = useCityStoreState(250) // 250ms debounce for text inputs
```

## TypeScript Types

### Primitive Types

```typescript
export const useNameStoreState = createUseInstanceStoreState<string>('name', '')
export const useCountStoreState = createUseInstanceStoreState<number>('count', 0)
export const useEnabledStoreState = createUseInstanceStoreState<boolean>('enabled', true)
```

### Union Types (Enums)

```typescript
export const useUnitsStoreState = createUseInstanceStoreState<'imperial' | 'metric'>('units', 'imperial')
export const useThemeStoreState = createUseInstanceStoreState<'light' | 'dark' | 'system'>('theme', 'system')
```

### Arrays

```typescript
interface Slide {
  id: string
  title: string
  imageUrl: string
}

export const useSlidesStoreState = createUseInstanceStoreState<Slide[]>('slides', [])
```

### Complex Objects

```typescript
interface WeatherConfig {
  city: string
  units: 'imperial' | 'metric'
  showForecast: boolean
  refreshInterval: number
}

export const useWeatherConfigStoreState = createUseInstanceStoreState<WeatherConfig>('weatherConfig', {
  city: '',
  units: 'imperial',
  showForecast: true,
  refreshInterval: 30,
})
```

## Data Organization Patterns

### Recommended: Separate Keys

One store key per setting. Best for most cases.

```typescript
// hooks/store.ts
export const useCityStoreState = createUseInstanceStoreState<string>('city', '')
export const useUnitsStoreState = createUseInstanceStoreState<'imperial' | 'metric'>('units', 'imperial')
export const useShowForecastStoreState = createUseInstanceStoreState<boolean>('showForecast', true)
```

**Benefits:**
- Granular updates (changing city doesn't re-render units)
- Simpler TypeScript types
- Easier to add/remove settings

### Alternative: Config Object

Single object for tightly related data.

```typescript
interface WeatherConfig {
  city: string
  units: 'imperial' | 'metric'
}

export const useWeatherConfigStoreState = createUseInstanceStoreState<WeatherConfig>('weatherConfig', {
  city: '',
  units: 'imperial',
})
```

**Use when:**
- Settings are always read/written together
- You need atomic updates across multiple fields

### Array Pattern (Lists)

For managing lists of items (slideshow, playlist, etc.)

```typescript
interface Slide {
  id: string
  title: string
  duration: number
}

export const useSlidesStoreState = createUseInstanceStoreState<Slide[]>('slides', [])

// In Settings - 250ms debounce since array contains text fields
const [isLoading, slides, setSlides] = useSlidesStoreState(250)

const addSlide = (slide: Slide) => setSlides([...slides, slide])
const removeSlide = (id: string) => setSlides(slides.filter(s => s.id !== id))
const updateSlide = (id: string, updates: Partial<Slide>) =>
  setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s))
```

## Common Patterns

### Loading State

```typescript
const [isLoading, city] = useCityStoreState()

if (isLoading) return <div>Loading...</div>
```

### Empty State

```typescript
const [isLoading, city] = useCityStoreState()

if (isLoading) return <div>Loading...</div>
if (!city) return <div>Please configure city in Settings</div>

return <WeatherDisplay city={city} />
```

### Conditional Rendering

```typescript
const [, showForecast] = useShowForecastStoreState()

return (
  <div>
    <CurrentWeather />
    {showForecast && <ForecastDisplay />}
  </div>
)
```

### Dependent Values

```typescript
const [isLoadingCity, city] = useCityStoreState()
const [isLoadingUnits, units] = useUnitsStoreState()

useEffect(() => {
  if (isLoadingCity || isLoadingUnits || !city) return

  // Fetch weather when config is ready
  fetchWeather(city, units)
}, [city, units, isLoadingCity, isLoadingUnits])
```

## Advanced

For more control, the SDK also exports `useStoreState` and `createUseStoreState` which allow passing the store slice explicitly. The low-level `store()` API provides direct `get`, `set`, `subscribe`, and `delete` methods. See the store-hooks documentation for details.
