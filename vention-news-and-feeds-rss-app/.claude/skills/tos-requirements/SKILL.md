---
name: tos-requirements
description: Gather requirements for a new TelemetryOS app. Use at the START of any new app project to understand the developer's vision, render layout design, configuration fields, data sources, and implementation plan before writing code.
---

# TelemetryOS App Requirements Gathering

Use this skill at the START of any new TelemetryOS application project. Gather complete requirements before writing any code to ensure a successful "one-shot" implementation.

## Requirements Interview

**IMPORTANT: This is a conversation, not a survey.** Ask questions one phase at a time. Wait for answers before proceeding. Use earlier answers to skip irrelevant questions.

### Phase 1: Start with Vision

Ask ONE question to start:

> "What app do you want to build? Give me a quick description."

That's it. Wait for their answer. Their response will tell you:
- What data sources they need (weather? media? external API?)
- What the layout probably looks like
- What settings make sense

### Phase 2: Clarify Based on Their Answer

Based on what they described, ask only the relevant follow-ups:

**If they mentioned specific data** (weather, stocks, social media, etc.):
- "Do you have an API in mind, or should I suggest one?"
- "How often should it refresh?"

**If they mentioned media/images/video**:
- "Will these come from the TelemetryOS media library, or external URLs?"

**If the layout isn't clear**:
- "Quick layout check: fullscreen content, or split/grid layout?"

**If they gave a detailed description**: Skip to Phase 3 - you probably have enough.

### Phase 3: Fill Gaps

Only ask about things that aren't obvious from their description:

- Settings they'd want to configure (if not clear)
- Any specific constraints (refresh rates, data limits)
- Edge cases that matter for their use case

**Don't ask about:**
- Categories that don't apply to their app
- Settings with obvious defaults
- Technical details you can infer

### Reference: Layout Types

If you need to clarify layout:
- **Single panel** - fullscreen content
- **Split layout** - sidebar + main area
- **Grid** - multiple items in rows/columns
- **Fullscreen media** - image/video player

### Reference: Store Keys

Settings allow admins to configure the app. Use these categories to identify what settings make sense for their app (don't ask about every category).

#### Categories (consult as needed)

**Display Settings** - Visual appearance and layout
- Colors, fonts, background styles
- Layout options (columns, alignment, spacing)
- Show/hide toggles for UI elements
- Animation preferences

> Digital signage typically uses dark backgrounds (better contrast on TVs, reduces glare). Don't ask about light/dark "mode" unless the developer brings it up.

**Data Configuration** - How the app fetches and processes data
- API keys and credentials
- Endpoint URLs
- Refresh intervals
- Data limits (max items, page size)

**Content Selection** - What content to display
- Media folder IDs or tags
- Playlist/item selection
- Content filtering rules
- Sort order preferences

**Localization** - Regional and format preferences
- Timezone
- Units (imperial/metric, currency)
- Date/time formats
- Language/locale

#### Store Scope Rules

**Default to `instance`** - most settings are instance-scoped. Only use other scopes when the setting clearly fits the patterns below.

**Use `application` scope for:**
- API keys and credentials (shared cost, single billing)
- Account-wide branding (company logo URL, brand colors)
- License keys or subscription identifiers
- Shared service endpoints configured once per account

**Use `instance` scope for everything else:**
- Content selection (what to display)
- Layout options (how to display it)
- Refresh intervals and timing
- Localization (timezone, units, language)
- Visual preferences (colors, fonts, backgrounds)
- Filters, sort order, display limits

**Quick Reference:**
| Scope | Synced? | Shared Across | Common Use |
|-------|---------|---------------|------------|
| `instance` | Yes | Same instance on all devices | Per-widget config |
| `application` | Yes | All instances in account | API keys, credentials |

#### Capture Each Store Key

For each setting identified, record:

| Key | Category | Scope | Type | Default | Constraints | Required? |
|-----|----------|-------|------|---------|-------------|-----------|
| city | Localization | instance | string | '' | min 2 chars | Yes |
| apiKey | Data Config | application | string | '' | - | Yes |
| units | Localization | instance | 'imperial' \| 'metric' | 'imperial' | enum | Yes |
| refreshInterval | Data Config | instance | number | 30 | 10-300 | No |

#### Questions to Ask (spread across conversation)

After understanding the core app, circle back to fill in settings details:
- **What should admins be able to configure?** (prompt with relevant categories)
- **What are sensible defaults?** (app should work with minimal config)
- **Are there validation rules or constraints?** (min/max, patterns, enums)
- **Which settings are required vs optional?**

Ask these as follow-ups in later turns, not all upfront. Scope is typically inferred from the rules above—only ask about scope if a setting doesn't clearly fit.

### Reference: Data Sources

Consult this when you need to understand their data needs (don't ask about all of these):

**TelemetryOS Platform APIs:**
- `media()` - User-uploaded images/videos from media library
- `weather()` - Weather data (current, hourly, daily forecasts)
- `applications()` - Embedding other TOS apps

**External APIs:**
- Use `proxy().fetch()` for external APIs (handles CORS)
- Note: authentication method (API key, OAuth, none)
- Note: rate limits if known

**Refresh patterns:**
- Timer-based (every N seconds/minutes)
- Event-based (on user action)
- Most apps use 30-60 second refresh for live data

### Implementation Checklist

After gathering requirements, generate:

#### Store Hooks (hooks/store.ts)

```typescript
// Instance-scoped keys (most common - per-widget config)
export const use[Key]State = createUseInstanceStoreState<Type>('key', default)
// Usage: const [loading, value, setValue] = use[Key]State()

// Application-scoped keys (shared across all instances)
export const use[Key]State = createUseApplicationStoreState<Type>('key', default)
// Usage: const [loading, value, setValue] = use[Key]State()

// Device-scoped keys (stays on device, Render only)
export const use[Key]State = createUseDeviceStoreState<Type>('key', default)
// Usage: const [loading, value, setValue] = use[Key]State()
```

#### Settings UI Components

List each Settings control needed:
- [ ] Text input for X
- [ ] Dropdown for Y
- [ ] Slider for Z
- [ ] Toggle for W

#### Render View Structure

Describe the component hierarchy:
```
Render
├── Header (title, logo)
├── MainContent
│   └── DataDisplay
└── Footer (timestamp, refresh indicator)
```

#### SDK APIs Required

- [ ] createUseInstanceStoreState - Settings ↔ Render sync
- [ ] proxy().fetch() - External API calls
- [ ] weather() - Weather data
- [ ] media() - Media library

## Output Format

After gathering requirements, provide a structured summary:

```markdown
# [App Name] Requirements

## Vision
[One sentence description]

## Render View
- Layout: [single/split/grid/fullscreen]
- Content: [description]
- Refresh: [interval or trigger]

## Store Keys
| Key | Category | Scope | Type | Default | UI Component |
|-----|----------|-------|------|---------|--------------|
| ... | ... | instance/application/device | ... | ... | ... |

## Data Sources
- Internal: [list]
- External: [list with endpoints]

## Implementation Plan
1. Create store hooks
2. Build Settings UI
3. Build Render view
4. Add data fetching
5. Test and polish
```

## Tips for Success

1. **Don't skip requirements** - Incomplete requirements lead to rework
2. **Validate early** - Confirm understanding before coding
3. **Start simple** - MVP first, then add features
4. **Use SDK hooks** - `createUseInstanceStoreState` for all store keys
5. **Follow patterns** - Match existing Settings UI components exactly

## Next Steps

After gathering requirements, use these skills to implement:

- **`tos-store-sync`** - Create store hooks from the Store Keys table
- **`tos-settings-ui`** - Build the Settings UI components
- **`tos-proxy-fetch`** - Implement external API calls
- **`tos-weather-api`** - Integrate weather data (if needed)
- **`tos-media-api`** - Access media library (if needed)
