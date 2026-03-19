---
name: tos-architecture
description: Understand TelemetryOS two-mount-point architecture (Render vs Settings). Use when debugging mount-point issues or understanding how Settings and Render communicate.
---

# TelemetryOS Architecture

TelemetryOS applications run on digital signage devices (TVs, kiosks, displays). Understanding the architecture is key to building effective apps.

## Two Mount Points

Every standard TOS app has two entry points:

### /render - Device Display

```
┌─────────────────────────────────┐
│         Physical Device         │
│   (TV, Kiosk, Digital Sign)     │
│                                 │
│  ┌───────────────────────────┐  │
│  │     Chrome Browser        │  │
│  │  ┌─────────────────────┐  │  │
│  │  │    Your App         │  │  │
│  │  │   /render route     │  │  │
│  │  │                     │  │  │
│  │  │  Shows content to   │  │  │
│  │  │  end users/viewers  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Characteristics:**
- Runs on physical device (TelemetryOS player)
- Chrome browser in iframe sandbox
- Has access to `store().device` (device-local storage)
- Displays content to viewers/customers
- Full screen, optimized for viewing from distance
- Can access device hardware info

### /settings - Admin Configuration

```
┌─────────────────────────────────┐
│      Admin's Browser            │
│   (Desktop/Laptop/Tablet)       │
│                                 │
│  ┌───────────────────────────┐  │
│  │    TelemetryOS Studio     │  │
│  │  ┌─────────────────────┐  │  │
│  │  │    Your App         │  │  │
│  │  │   /settings route   │  │  │
│  │  │                     │  │  │
│  │  │  Configuration UI   │  │  │
│  │  │  for administrators │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Characteristics:**
- Runs in Studio admin portal (user's browser)
- NO access to `store().device` (throws error!)
- Admin-facing UI for configuration
- Side panel in Studio editor
- Form-based controls for settings

## Communication Flow

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│  Settings   │  ───▶   │  store().       │  ───▶   │   Render    │
│  /settings  │  WRITE  │  instance       │  READ   │   /render   │
│             │         │                 │  +SUB   │             │
│  Admin sets │         │  { city: 'NYC'  │         │  Displays   │
│  city='NYC' │         │    units: 'F' } │         │  NYC weather│
└─────────────┘         └─────────────────┘         └─────────────┘
```

1. **Settings writes** to instance store via hooks
2. **Render subscribes** to instance store via same hooks
3. Changes sync automatically (real-time)
4. Same hooks work in both mount points

## Project Structure

```
src/
├── index.tsx           # Entry point - configure SDK here
├── App.tsx             # Router - directs to correct view
├── views/
│   ├── Settings.tsx    # /settings mount point
│   └── Render.tsx      # /render mount point
├── hooks/
│   └── store.ts        # Shared store hooks (used in both views)
├── components/         # Reusable UI components
├── types/              # TypeScript interfaces
└── utils/              # Helper functions
```

## Routing

```typescript
// App.tsx
import Settings from './views/Settings'
import Render from './views/Render'

export function App() {
  const path = window.location.pathname

  if (path === '/settings') return <Settings />
  if (path === '/render') return <Render />

  return <div>Invalid mount point: {path}</div>
}
```

Or with React Router:

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router'
import Settings from './views/Settings'
import Render from './views/Render'

const router = createBrowserRouter([
  { path: '/render', element: <Render /> },
  { path: '/settings', element: <Settings /> },
])

export function App() {
  return <RouterProvider router={router} />
}
```

## Runtime Environment

### Both Mount Points

- **Browser:** Modern Chrome (platform-controlled version)
- **Execution:** Iframe sandbox
- **Runtime:** Client-side only (no SSR, no Node.js)
- **APIs:** Full browser APIs (Fetch, WebSocket, Canvas, WebGL)
- **SDK:** `@telemetryos/sdk` for platform communication

### Render Only

- `store().device` - Device-local storage
- `devices().getInformation()` - Hardware info
- Physical display output
- Background worker communication

### Settings Only

- SettingsUI components (`@telemetryos/sdk/react`)
- Runs in Studio portal
- Form-based interaction
- Preview pane integration

## telemetry.config.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "mountPoints": {
    "render": "/render",
    "settings": "/settings"
  },
  "devServer": {
    "runCommand": "vite --port 3000",
    "url": "http://localhost:3000"
  }
}
```

### Mount Point Configuration

| Mount Point | Purpose | Route |
|-------------|---------|-------|
| render | Device display | /render |
| settings | Admin config UI | /settings |

### Optional: Workers

```json
{
  "backgroundWorkers": {
    "sync": "workers/sync.js"
  },
  "serverWorkers": {
    "api": "workers/api.js"
  }
}
```

## Store Scopes

```
┌────────────────────────────────────────────────────────────────┐
│                        Account                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  store().application                                     │  │
│  │  Shared across ALL instances of this app                 │  │
│  │  (API keys, account-wide settings)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │  App Instance 1     │  │  App Instance 2     │             │
│  │  instance store     │  │  instance store     │             │
│  │  (Settings↔Render)  │  │  (Settings↔Render)  │             │
│  └─────────────────────┘  └─────────────────────┘             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Physical Device                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  store().device                                          │  │
│  │  Local to this device only (Render only!)                │  │
│  │  (Cache, calibration, device-specific data)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  store().shared('namespace')                                   │
│  Inter-app communication (any app can read/write)              │
│  (Weather data sharing, event broadcasting)                    │
└────────────────────────────────────────────────────────────────┘
```

## Development Workflow

### Local Development

```bash
# Start dev server
tos serve
# Or: npm run dev

# Access locally:
# Settings: http://localhost:3000/settings
# Render:   http://localhost:3000/render
```

### Build & Deploy

```bash
# Build production
npm run build

# Deploy via Git
git add . && git commit -m "Update" && git push
# GitHub integration auto-deploys
```

## Common Patterns

### Check Mount Point

```typescript
const isSettings = window.location.pathname === '/settings'
const isRender = window.location.pathname === '/render'
```

### Conditional Features

```typescript
// In a shared component
const isRender = window.location.pathname === '/render'

// Only fetch external data in Render
useEffect(() => {
  if (!isRender) return
  fetchExternalData()
}, [isRender])
```

### Handle Missing Config

```typescript
// In Render.tsx
const [isLoading, city] = useCityStoreState()

if (isLoading) return <div>Loading...</div>
if (!city) return <div>Please configure city in Settings</div>

return <WeatherDisplay city={city} />
```

## Debugging

### Check Current Path

```typescript
console.log('Current path:', window.location.pathname)
console.log('Is Settings:', window.location.pathname === '/settings')
console.log('Is Render:', window.location.pathname === '/render')
```

### Verify SDK Configuration

```typescript
// In index.tsx - name must match telemetry.config.json
configure('my-app')
```

### Check Store Values

```typescript
// Temporary debug
const value = await store().instance.get('myKey')
console.log('Store value:', value)
```
