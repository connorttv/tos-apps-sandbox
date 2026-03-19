# TelemetryOS Application

**Application:** telemetryos-rss-app

## Quick Start

```bash
npm install        # Install dependencies
npm run build      # Build and check for TypeScript errors
tos serve          # Start dev server (or: npm run dev)
```

**IMPORTANT:** Always run `npm run build` after making changes to check for TypeScript errors. Do not rely solely on the dev server.

**Development Host:** http://localhost:2026
- Settings: http://localhost:2026/settings
- Render: http://localhost:2026/render

## Architecture

TelemetryOS apps have two mount points:

| Mount | Purpose | Runs On |
|-------|---------|---------|
| `/render` | Content displayed on devices | Physical device (TV, kiosk) |
| `/settings` | Configuration UI | Studio admin portal |

Settings and Render communicate via instance store hooks.

## Project Structure

```
src/
├── index.tsx        # Entry point (configure SDK here)
├── App.tsx          # Mount point routing
├── views/
│   ├── Settings.tsx # Configuration UI
│   └── Render.tsx   # Display content
└── hooks/
    └── store.ts     # Store state hooks
```

## Core Pattern

### Store Hooks (Settings ↔ Render sync)

```typescript
// hooks/store.ts
import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export const useCityState = createUseInstanceStoreState<string>('city', '')
export const useUnitsState = createUseInstanceStoreState<'imperial' | 'metric'>('units', 'imperial')
```

```typescript
// In Settings.tsx or Render.tsx
import { useCityState } from '../hooks/store'

const [isLoading, city, setCity] = useCityState()
```

### Settings Components

```typescript
import {
  SettingsContainer,
  SettingsField,
  SettingsLabel,
  SettingsInputFrame,
} from '@telemetryos/sdk/react'
```

### External APIs

```typescript
import { proxy } from '@telemetryos/sdk'

// Use proxy for APIs without CORS headers
const response = await proxy().fetch('https://api.example.com/data')
```

## Hard Constraints

1. **No device storage in Settings** - Use instance store hooks instead
2. **CORS on external APIs** - Use `proxy().fetch()` when needed
3. **configure() required** - Call in index.tsx before React renders

## Commands

| Command | Purpose |
|---------|---------|
| `/add-setting` | Add a Settings control |
| `/add-store-key` | Add a store key with hook |
| `/add-api-fetch` | Add external API integration |
| `/build-deploy` | Build and deploy workflow |
| `/debug-render` | Debug render view issues |

## Skills (REQUIRED)

**IMPORTANT:** You MUST invoke the relevant skill BEFORE writing code for these tasks:

| Task | Required Skill | Why |
|------|----------------|-----|
| Building Render views | `tos-render-design` | Digital signage constraints, UI scaling, no hover/scroll |
| Adding ANY Settings UI | `tos-settings-ui` | SDK components are required - raw HTML won't work |
| Calling external APIs | `tos-proxy-fetch` | Proxy patterns prevent CORS errors |
| Adding store keys | `tos-store-sync` | Hook patterns ensure Settings↔Render sync |
| Weather integration | `tos-weather-api` | API-specific patterns and credentials |
| Media library access | `tos-media-api` | SDK media methods and types |
| Starting new project | `tos-requirements` | Gather requirements before coding |
| Debugging issues | `tos-debugging` | Common errors and fixes |

**Never write Render layouts, Settings components, or proxy.fetch code without invoking the skill first.**

## Documentation

- [SDK Getting Started](https://docs.telemetryos.com/docs/sdk-getting-started)
- [SDK Method Reference](https://docs.telemetryos.com/docs/sdk-method-reference)
- [Building Applications](https://docs.telemetryos.com/docs/applications)
