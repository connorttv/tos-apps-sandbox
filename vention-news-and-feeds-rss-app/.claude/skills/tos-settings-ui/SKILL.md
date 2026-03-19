---
name: tos-settings-ui
description: REQUIRED for TelemetryOS Settings UI. MUST invoke BEFORE writing ANY Settings components - raw HTML won't work, SDK components are mandatory. Contains SettingsContainer, SettingsField, SettingsInputFrame, and all input patterns.
---

# TelemetryOS Settings UI Components

All Settings components are imported from `@telemetryos/sdk/react`. Always use these styled components - raw HTML won't match Studio's design system.

## Quick Reference

```typescript
import {
  // Layout
  SettingsContainer,
  SettingsHeading,
  SettingsBox,
  SettingsDivider,
  // Fields
  SettingsField,
  SettingsLabel,
  SettingsHint,
  SettingsError,
  // Inputs
  SettingsInputFrame,
  SettingsTextAreaFrame,
  SettingsSelectFrame,
  SettingsSliderFrame,
  SettingsSliderRuler,
  SettingsColorFrame,
  // Toggles
  SettingsSwitchFrame,
  SettingsSwitchLabel,
  SettingsCheckboxFrame,
  SettingsCheckboxLabel,
  SettingsRadioFrame,
  SettingsRadioLabel,
  // Actions
  SettingsButtonFrame,
} from '@telemetryos/sdk/react'
```

## Debounce Guidelines

Store hooks accept an optional debounce delay (default 0ms - immediate). Choose based on input type:

| Input Type | Debounce | Reason |
|------------|----------|--------|
| Text input | 250ms | Wait for typing to pause |
| Textarea | 250ms | Wait for typing to pause |
| Select/Dropdown | 0ms (default) | Immediate feedback expected |
| Switch/Toggle | 0ms (default) | Immediate feedback expected |
| Checkbox | 0ms (default) | Immediate feedback expected |
| Radio | 0ms (default) | Immediate feedback expected |
| Slider | 5ms | Responsive feel, reduced message traffic |
| Color picker | 5ms | Responsive feel while dragging |

**Usage:**
```typescript
// Text input - debounce to wait for typing to pause
const [isLoading, city, setCity] = useCityStoreState(250)

// Dropdown - immediate (default, no argument needed)
const [isLoading, league, setLeague] = useLeagueStoreState()

// Slider - responsive (5ms)
const [isLoading, volume, setVolume] = useVolumeStoreState(5)
```

## Component Patterns

### Container (Required)

Every Settings view must wrap content in `SettingsContainer`:

```typescript
import { SettingsContainer } from '@telemetryos/sdk/react'

export function Settings() {
  return (
    <SettingsContainer>
      {/* All settings content here */}
    </SettingsContainer>
  )
}
```

### Section Heading

Use `SettingsHeading` to divide settings into logical sections:

```typescript
import { SettingsHeading, SettingsDivider } from '@telemetryos/sdk/react'

<SettingsHeading>Display Options</SettingsHeading>
{/* Fields for this section */}

<SettingsDivider />

<SettingsHeading>Advanced Settings</SettingsHeading>
{/* Fields for next section */}
```

### Text Input

```typescript
import {
  SettingsContainer,
  SettingsField,
  SettingsLabel,
  SettingsInputFrame,
} from '@telemetryos/sdk/react'
import { useTeamStoreState } from '../hooks/store'

export function Settings() {
  const [isLoading, team, setTeam] = useTeamStoreState(250) // 250ms debounce for text input

  return (
    <SettingsContainer>
      <SettingsField>
        <SettingsLabel>Team Name</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="text"
            placeholder="Enter team name..."
            disabled={isLoading}
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
        </SettingsInputFrame>
      </SettingsField>
    </SettingsContainer>
  )
}
```

### Textarea (Multiline)

```typescript
import { SettingsTextAreaFrame } from '@telemetryos/sdk/react'

<SettingsField>
  <SettingsLabel>Description</SettingsLabel>
  <SettingsTextAreaFrame>
    <textarea
      placeholder="Enter description..."
      disabled={isLoading}
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={4}
    />
  </SettingsTextAreaFrame>
</SettingsField>
```

### Hint Text

Add helper text below any field with `SettingsHint`:

```typescript
import { SettingsHint } from '@telemetryos/sdk/react'

<SettingsField>
  <SettingsLabel>API Key</SettingsLabel>
  <SettingsInputFrame>
    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
  </SettingsInputFrame>
  <SettingsHint>Found in your dashboard under Settings → API</SettingsHint>
</SettingsField>
```

### Error Message

Display validation errors with `SettingsError`:

```typescript
import { SettingsError } from '@telemetryos/sdk/react'

<SettingsField>
  <SettingsLabel>Email</SettingsLabel>
  <SettingsInputFrame>
    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  </SettingsInputFrame>
  {error && <SettingsError>{error}</SettingsError>}
</SettingsField>
```

### Dropdown Select

```typescript
import { SettingsSelectFrame } from '@telemetryos/sdk/react'
import { useLeagueStoreState } from '../hooks/store'

const [isLoading, league, setLeague] = useLeagueStoreState(0) // 0ms for immediate feedback

<SettingsField>
  <SettingsLabel>League</SettingsLabel>
  <SettingsSelectFrame>
    <select
      disabled={isLoading}
      value={league}
      onChange={(e) => setLeague(e.target.value)}
    >
      <option value="nfl">NFL</option>
      <option value="nba">NBA</option>
      <option value="mlb">MLB</option>
      <option value="nhl">NHL</option>
    </select>
  </SettingsSelectFrame>
</SettingsField>
```

### Slider

```typescript
import { SettingsSliderFrame } from '@telemetryos/sdk/react'
import { useVolumeStoreState } from '../hooks/store'

const [isLoading, volume, setVolume] = useVolumeStoreState(5) // 5ms for responsive feel

<SettingsField>
  <SettingsLabel>Volume</SettingsLabel>
  <SettingsSliderFrame>
    <input
      type="range"
      min="0"
      max="100"
      disabled={isLoading}
      value={volume}
      onChange={(e) => setVolume(Number(e.target.value))}
    />
    <span>{volume}%</span>
  </SettingsSliderFrame>
</SettingsField>
```

The frame uses flexbox - add a `<span>` after the input to show the current value.

### Slider with Ruler

Add tick labels below a slider with `SettingsSliderRuler`:

```typescript
import { SettingsSliderFrame, SettingsSliderRuler } from '@telemetryos/sdk/react'
import { useQualityStoreState } from '../hooks/store'

const [isLoading, quality, setQuality] = useQualityStoreState(5) // 5ms for responsive feel

<SettingsField>
  <SettingsLabel>Quality</SettingsLabel>
  <SettingsSliderFrame>
    <input
      type="range"
      min="1"
      max="3"
      disabled={isLoading}
      value={quality}
      onChange={(e) => setQuality(Number(e.target.value))}
    />
    <span>{quality}</span>
  </SettingsSliderFrame>
  <SettingsSliderRuler>
    <span>Low</span>
    <span>Medium</span>
    <span>High</span>
  </SettingsSliderRuler>
</SettingsField>
```

### Color Picker

```typescript
import { SettingsColorFrame } from '@telemetryos/sdk/react'
import { useColorStoreState } from '../hooks/store'

const [isLoading, color, setColor] = useColorStoreState(5) // 5ms for responsive feel while dragging

<SettingsField>
  <SettingsLabel>Brand Color</SettingsLabel>
  <SettingsColorFrame>
    <input
      type="color"
      disabled={isLoading}
      value={color}
      onChange={(e) => setColor(e.target.value)}
    />
    <span>{color}</span>
  </SettingsColorFrame>
</SettingsField>
```

### Toggle Switch

```typescript
import { SettingsSwitchFrame, SettingsSwitchLabel } from '@telemetryos/sdk/react'
import { useShowScoresStoreState } from '../hooks/store'

const [isLoading, showScores, setShowScores] = useShowScoresStoreState(0) // 0ms for immediate feedback

<SettingsField>
  <SettingsSwitchFrame>
    <input
      type="checkbox"
      role="switch"
      disabled={isLoading}
      checked={showScores}
      onChange={(e) => setShowScores(e.target.checked)}
    />
    <SettingsSwitchLabel>Show Live Scores</SettingsSwitchLabel>
  </SettingsSwitchFrame>
</SettingsField>
```

Note: Use `role="switch"` on the checkbox for proper switch styling.

### Checkbox

```typescript
import { SettingsCheckboxFrame, SettingsCheckboxLabel } from '@telemetryos/sdk/react'
import { useAutoRefreshStoreState } from '../hooks/store'

const [isLoading, autoRefresh, setAutoRefresh] = useAutoRefreshStoreState(0) // 0ms for immediate feedback

<SettingsField>
  <SettingsCheckboxFrame>
    <input
      type="checkbox"
      disabled={isLoading}
      checked={autoRefresh}
      onChange={(e) => setAutoRefresh(e.target.checked)}
    />
    <SettingsCheckboxLabel>Enable Auto-Refresh</SettingsCheckboxLabel>
  </SettingsCheckboxFrame>
</SettingsField>
```

### Radio Group

```typescript
import { SettingsRadioFrame, SettingsRadioLabel } from '@telemetryos/sdk/react'
import { useDisplayModeStoreState } from '../hooks/store'

const [isLoading, displayMode, setDisplayMode] = useDisplayModeStoreState(0) // 0ms for immediate feedback

<SettingsField>
  <SettingsLabel>Display Mode</SettingsLabel>
  <SettingsRadioFrame>
    <input
      type="radio"
      name="displayMode"
      value="compact"
      disabled={isLoading}
      checked={displayMode === 'compact'}
      onChange={(e) => setDisplayMode(e.target.value)}
    />
    <SettingsRadioLabel>Compact</SettingsRadioLabel>
  </SettingsRadioFrame>
  <SettingsRadioFrame>
    <input
      type="radio"
      name="displayMode"
      value="expanded"
      disabled={isLoading}
      checked={displayMode === 'expanded'}
      onChange={(e) => setDisplayMode(e.target.value)}
    />
    <SettingsRadioLabel>Expanded</SettingsRadioLabel>
  </SettingsRadioFrame>
</SettingsField>
```

### Button

```typescript
import { SettingsButtonFrame } from '@telemetryos/sdk/react'

<SettingsButtonFrame>
  <button onClick={handleReset}>Reset to Defaults</button>
</SettingsButtonFrame>
```

## Layout Components

### SettingsBox (Grouping)

Bordered container, typically used for individual items in a repeatable list:

```typescript
import { SettingsBox, SettingsHeading, SettingsButtonFrame } from '@telemetryos/sdk/react'

<SettingsHeading>Teams</SettingsHeading>

{teams.map((team, index) => (
  <SettingsBox key={index}>
    <SettingsHeading>Team {index + 1}</SettingsHeading>
    {/* Team fields */}
    <SettingsButtonFrame>
      <button onClick={() => removeTeam(index)}>Remove</button>
    </SettingsButtonFrame>
  </SettingsBox>
))}

<SettingsButtonFrame>
  <button onClick={addTeam}>+ Add Team</button>
</SettingsButtonFrame>
```

### SettingsDivider (Separator)

Add a horizontal rule between sections:

```typescript
import { SettingsDivider } from '@telemetryos/sdk/react'

<SettingsField>...</SettingsField>
<SettingsDivider />
<SettingsField>...</SettingsField>
```

## Dynamic Lists

For settings with repeatable items (teams, locations, etc.), use store hooks with array types:

```typescript
// hooks/store.ts defines: useTeamsStoreState
import { useTeamsStoreState } from '../hooks/store'

const [isLoading, teams, setTeams] = useTeamsStoreState(250) // contains text inputs

const addTeam = () => {
  setTeams([...teams, { name: '', league: 'nfl' }])
}

const removeTeam = (index: number) => {
  setTeams(teams.filter((_, i) => i !== index))
}

const updateTeam = (index: number, updates: Partial<typeof teams[0]>) => {
  const updated = [...teams]
  updated[index] = { ...updated[index], ...updates }
  setTeams(updated)
}
```

## Complete Example

A complete Settings view with dynamic lists, sections, and multiple input types:

```typescript
// Store hooks - see tos-store-sync skill for how to define these in hooks/store.ts
import {
  useTeamsStoreState,
  useRefreshIntervalStoreState,
  useShowScoresStoreState,
  useBackgroundColorStoreState,
} from '../hooks/store'
import {
  SettingsContainer,
  SettingsBox,
  SettingsHeading,
  SettingsDivider,
  SettingsField,
  SettingsLabel,
  SettingsHint,
  SettingsInputFrame,
  SettingsSelectFrame,
  SettingsSliderFrame,
  SettingsColorFrame,
  SettingsSwitchFrame,
  SettingsSwitchLabel,
  SettingsButtonFrame,
} from '@telemetryos/sdk/react'

export function Settings() {
  // Store hooks return [isLoading, value, setValue]
  // Debounce: 250ms for text inputs, 0ms (default) for toggles, 5ms for sliders/colors
  const [isLoadingTeams, teams, setTeams] = useTeamsStoreState(250) // contains text inputs
  const [isLoadingInterval, interval, setInterval] = useRefreshIntervalStoreState(5)
  const [isLoadingScores, showScores, setShowScores] = useShowScoresStoreState()
  const [isLoadingBg, backgroundColor, setBackgroundColor] = useBackgroundColorStoreState(5)

  const isLoading = isLoadingTeams || isLoadingInterval || isLoadingScores || isLoadingBg

  const addTeam = () => {
    setTeams([...teams, { name: '', league: 'nfl' }])
  }

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index))
  }

  const updateTeam = (index: number, updates: Partial<typeof teams[0]>) => {
    const updated = [...teams]
    updated[index] = { ...updated[index], ...updates }
    setTeams(updated)
  }

  return (
    <SettingsContainer>
      <SettingsHeading>Teams</SettingsHeading>

      {teams.map((team, index) => (
        <SettingsBox key={index}>
          <SettingsHeading>Team {index + 1}</SettingsHeading>

          <SettingsField>
            <SettingsLabel>Team Name</SettingsLabel>
            <SettingsInputFrame>
              <input
                type="text"
                placeholder="Enter team name..."
                disabled={isLoading}
                value={team.name}
                onChange={(e) => updateTeam(index, { name: e.target.value })}
              />
            </SettingsInputFrame>
            <SettingsHint>This name appears in the header</SettingsHint>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>League</SettingsLabel>
            <SettingsSelectFrame>
              <select
                disabled={isLoading}
                value={team.league}
                onChange={(e) => updateTeam(index, { league: e.target.value })}
              >
                <option value="nfl">NFL</option>
                <option value="nba">NBA</option>
                <option value="mlb">MLB</option>
                <option value="nhl">NHL</option>
              </select>
            </SettingsSelectFrame>
          </SettingsField>

          <SettingsButtonFrame>
            <button type="button" disabled={isLoading} onClick={() => removeTeam(index)}>
              Remove Team
            </button>
          </SettingsButtonFrame>
        </SettingsBox>
      ))}

      <SettingsButtonFrame>
        <button type="button" disabled={isLoading} onClick={addTeam}>+ Add Team</button>
      </SettingsButtonFrame>

      <SettingsDivider />

      <SettingsHeading>Display</SettingsHeading>

      <SettingsField>
        <SettingsLabel>Refresh Interval (seconds)</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min="10"
            max="120"
            disabled={isLoading}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
          />
          <span>{interval}s</span>
        </SettingsSliderFrame>
      </SettingsField>

      <SettingsField>
        <SettingsSwitchFrame>
          <input
            type="checkbox"
            role="switch"
            disabled={isLoading}
            checked={showScores}
            onChange={(e) => setShowScores(e.target.checked)}
          />
          <SettingsSwitchLabel>Show Live Scores</SettingsSwitchLabel>
        </SettingsSwitchFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Background Color</SettingsLabel>
        <SettingsColorFrame>
          <input
            type="color"
            disabled={isLoading}
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
          <span>{backgroundColor}</span>
          <SettingsButtonFrame>
            <button type="button" disabled={isLoading} onClick={() => setBackgroundColor('transparent')}>
              Clear
            </button>
          </SettingsButtonFrame>
        </SettingsColorFrame>
      </SettingsField>
    </SettingsContainer>
  )
}
```

## Component Reference

| Component | Purpose |
|-----------|---------|
| `SettingsContainer` | Root wrapper, handles color scheme |
| `SettingsHeading` | Section heading |
| `SettingsBox` | Container for list items |
| `SettingsDivider` | Horizontal separator |
| `SettingsField` | Wrapper for each field (renders as label) |
| `SettingsLabel` | Field label |
| `SettingsHint` | Help text below a field |
| `SettingsError` | Error message below a field |
| `SettingsInputFrame` | Text input wrapper |
| `SettingsTextAreaFrame` | Multiline text wrapper |
| `SettingsSelectFrame` | Dropdown wrapper |
| `SettingsSliderFrame` | Range slider wrapper |
| `SettingsSliderRuler` | Tick labels below a slider |
| `SettingsColorFrame` | Color picker wrapper |
| `SettingsSwitchFrame` | Toggle switch wrapper |
| `SettingsSwitchLabel` | Toggle switch label |
| `SettingsCheckboxFrame` | Checkbox wrapper |
| `SettingsCheckboxLabel` | Checkbox label |
| `SettingsRadioFrame` | Radio button wrapper |
| `SettingsRadioLabel` | Radio button label |
| `SettingsButtonFrame` | Action button wrapper |

## Common Mistakes

1. **Missing SettingsContainer** - Always wrap in SettingsContainer
2. **Forgetting disabled={isLoading}** - Disable inputs while loading from store
3. **Using raw HTML** - Always use Frame components for proper styling
4. **Missing role="switch"** - Required on toggle switches for proper styling
5. **Wrong onChange for sliders** - Use `Number(e.target.value)` for numeric values
6. **Missing SettingsHeading** - Use headings to organize sections
7. **Not using SettingsHint** - Add helpful context for complex fields
