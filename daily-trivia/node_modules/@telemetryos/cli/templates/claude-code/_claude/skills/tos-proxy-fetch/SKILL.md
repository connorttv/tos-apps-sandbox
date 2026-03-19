---
name: tos-proxy-fetch
description: REQUIRED for external API calls in TelemetryOS. MUST invoke BEFORE using proxy().fetch() or adding any third-party API integration. Contains CORS workaround patterns, useEffect dependencies, refresh intervals, and error handling.
---

# TelemetryOS Proxy Fetch

When external APIs don't include CORS headers, browsers block requests from your app. The TelemetryOS proxy solves this by routing requests through the platform.

## When to Use

### Use proxy().fetch() when:
- API returns CORS error in browser console
- API doesn't include `Access-Control-Allow-Origin` header
- You need to call APIs that weren't designed for browser use

### Use regular fetch() when:
- API includes CORS headers
- API is designed for browser/client-side use
- You want to use the player's advanced caching (regular fetch has better caching on devices)

## Quick Reference

```typescript
import { proxy } from '@telemetryos/sdk'

// Simple GET
const response = await proxy().fetch('https://api.example.com/data')
const data = await response.json()

// With headers
const response = await proxy().fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
})

// POST request
const response = await proxy().fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ key: 'value' })
})
```

## Complete Example

### Settings (API Key + Endpoint Config)

```typescript
// hooks/store.ts
import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export const useApiKeyState = createUseInstanceStoreState<string>('apiKey', '')
export const useEndpointState = createUseInstanceStoreState<string>('endpoint', '')
```

```typescript
// views/Settings.tsx
import {
  SettingsContainer,
  SettingsField,
  SettingsLabel,
  SettingsInputFrame,
} from '@telemetryos/sdk/react'
import { useApiKeyState, useEndpointState } from '../hooks/store'

export default function Settings() {
  const [isLoadingKey, apiKey, setApiKey] = useApiKeyState()
  const [isLoadingEndpoint, endpoint, setEndpoint] = useEndpointState()

  return (
    <SettingsContainer>
      <SettingsField>
        <SettingsLabel>API Key</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="password"
            placeholder="Enter API key..."
            disabled={isLoadingKey}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </SettingsInputFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>API Endpoint</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="url"
            placeholder="https://api.example.com/data"
            disabled={isLoadingEndpoint}
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </SettingsInputFrame>
      </SettingsField>
    </SettingsContainer>
  )
}
```

### Render (Data Display)

```typescript
// views/Render.tsx
import { useEffect, useState } from 'react'
import { proxy } from '@telemetryos/sdk'
import { useApiKeyState, useEndpointState } from '../hooks/store'

interface ApiData {
  // Define your API response type
  items: Array<{
    id: string
    name: string
    value: number
  }>
}

export default function Render() {
  const [isLoadingKey, apiKey] = useApiKeyState()
  const [isLoadingEndpoint, endpoint] = useEndpointState()

  const [data, setData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoadingKey || isLoadingEndpoint || !apiKey || !endpoint) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await proxy().fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [apiKey, endpoint, isLoadingKey, isLoadingEndpoint])

  // Loading states
  if (isLoadingKey || isLoadingEndpoint) return <div>Loading config...</div>
  if (!apiKey || !endpoint) return <div>Configure API in Settings</div>
  if (loading && !data) return <div>Loading data...</div>
  if (error && !data) return <div>Error: {error}</div>

  return (
    <div>
      {data?.items.map(item => (
        <div key={item.id}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  )
}
```

## Common API Patterns

### RSS Feed

```typescript
const response = await proxy().fetch('https://example.com/feed.xml')
const xml = await response.text()

// Parse XML (use DOMParser or a library)
const parser = new DOMParser()
const doc = parser.parseFromString(xml, 'text/xml')
const items = doc.querySelectorAll('item')
```

### JSON API with Query Params

```typescript
const params = new URLSearchParams({
  apiKey: apiKey,
  city: city,
  format: 'json',
})

const response = await proxy().fetch(`https://api.example.com/data?${params}`)
const data = await response.json()
```

### Sports Data API

```typescript
const response = await proxy().fetch(
  `https://api.sportsdata.io/v3/nfl/scores/json/Games/${season}`,
  {
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
    }
  }
)

const games = await response.json()
```

### News/Headlines API

```typescript
const response = await proxy().fetch(
  `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`
)

const news = await response.json()
```

## Error Handling

```typescript
try {
  const response = await proxy().fetch(endpoint)

  // Check HTTP status
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key')
    } else if (response.status === 404) {
      throw new Error('Endpoint not found')
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded')
    } else {
      throw new Error(`API error: ${response.status}`)
    }
  }

  const data = await response.json()
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes('timeout')) {
      // SDK timeout (30 seconds)
      console.error('Request timed out')
    } else if (err.message.includes('network')) {
      // Network error
      console.error('Network error')
    } else {
      console.error(err.message)
    }
  }
}
```

## Request Options

The proxy supports all standard fetch options:

```typescript
await proxy().fetch(url, {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token',
    // Any custom headers
  },
  body: JSON.stringify(data), // For POST/PUT/PATCH
})
```

## Response Handling

```typescript
const response = await proxy().fetch(url)

// JSON
const json = await response.json()

// Text
const text = await response.text()

// Blob (for binary data)
const blob = await response.blob()

// Check content type
const contentType = response.headers.get('Content-Type')
if (contentType?.includes('application/json')) {
  return response.json()
} else {
  return response.text()
}
```

## Tips

1. **Check CORS first** - Try regular `fetch()` first; only use proxy if CORS fails
2. **Handle errors** - Always check `response.ok` before parsing
3. **Add refresh interval** - External data goes stale; refresh periodically
4. **Store API keys securely** - Use instance or application store hooks
5. **Show stale data** - Display last known data while refreshing
6. **Log errors** - Help users troubleshoot configuration issues
7. **Timeout awareness** - SDK times out after 30 seconds
