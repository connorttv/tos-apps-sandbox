---
name: tos-render-design
description: Design patterns for TelemetryOS Render views. Use when building or reviewing Render view layouts, handling responsive scaling, or ensuring digital signage best practices.
---

# Render View Design

TelemetryOS Render views display on digital signage—TVs, video walls, and displays viewed from a distance with no user interaction. This fundamentally shapes how to design them.

> **Note:** The init project already provides base styles in `index.css` (viewport scaling, box-sizing) and `Render.css` (`.render` class with padding, overflow, flexbox). Build on these—don't override them.

## Digital Signage Constraints

### No User Interaction

Unless building for kiosk/touchscreen scenarios, assume **no mouse, keyboard, or touch input**:

```css
/* WRONG - No one will hover */
.button:hover {
  background: blue;
}

/* WRONG - No one will focus */
.input:focus {
  outline: 2px solid blue;
}
```

Avoid `:hover`, `:focus`, `:active`, and similar interaction pseudo-classes.

### No Scrolling

Content **must fit the viewport**. There's no user to scroll:

```css
/* WRONG - Creates scrollbar no one can use */
.container {
  overflow-y: scroll;
}

/* WRONG - Content disappears off-screen */
.content {
  height: 150vh;
}
```

```css
/* CORRECT - Content contained */
.container {
  height: 100vh;
  overflow: hidden;
}
```

If content might overflow, truncate it or conditionally hide elements—never show a scrollbar.

## UI Scale Hooks

Displays range from tablets to 8K video walls. Standard CSS pixels create inconsistent sizing. The SDK provides hooks that redefine `rem` as viewport-relative:

### useUiScaleToSetRem(uiScale)

Sets the document's root font-size based on viewport. **Call once in your Render view:**

```typescript
import { useUiScaleToSetRem } from '@telemetryos/sdk/react'
import { useUiScaleStoreState } from '../hooks/store'

export function Render() {
  const [_isLoading, uiScale] = useUiScaleStoreState()
  useUiScaleToSetRem(uiScale)

  return <div className="content">...</div>
}
```

**How it works:**
- At scale 1: `1rem` = 1% of viewport's longest dimension
- At scale 2: `1rem` = 2% of viewport's longest dimension
- A 2rem font occupies identical screen percentage on Full HD and 4K

### useUiAspectRatio()

Returns current aspect ratio, updating on resize:

```typescript
import { useUiAspectRatio } from '@telemetryos/sdk/react'

export function Render() {
  const aspectRatio = useUiAspectRatio()

  // > 1 = landscape, < 1 = portrait, = 1 = square
  const isPortrait = aspectRatio < 1

  return (
    <div className={isPortrait ? 'portrait-layout' : 'landscape-layout'}>
      ...
    </div>
  )
}
```

## Best Practices

### Use rem for Everything

All sizing should use `rem` to scale with the UI scale setting:

```css
/* CORRECT - Scales with viewport */
.title {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.card {
  padding: 2rem;
  border-radius: 0.5rem;
}
```

```css
/* WRONG - Fixed pixels don't scale */
.title {
  font-size: 48px;
  margin-bottom: 12px;
}
```

### Title Safe Zone

The init project's `.render` class already applies ~3rem padding from screen edges (SMPTE ST 2046-1 standard for avoiding bezel cutoff). Keep this padding when building your layout.

### Minimum Text Size

Text should be no smaller than ~2rem for comfortable viewing at typical distances (approximately 4% of screen height):

```css
.body-text {
  font-size: 2rem; /* Minimum readable size */
}

.headline {
  font-size: 4rem;
}

.small-label {
  font-size: 1.5rem; /* Use sparingly */
}
```

### Constrain Layouts

The init project's `index.css` and `.render` class already set up the base layout with `overflow: hidden` and flexbox. When adding child elements, use `min-height: 0` or `min-width: 0` on flex children to allow them to shrink:

```css
.my-content {
  flex: 1;
  min-height: 0; /* Allows flex children to shrink below content size */
}
```

### Text Truncation

When text might overflow, truncate gracefully:

```css
.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Multi-line truncation */
.description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Adaptive Content

Use `useUiAspectRatio()` to adapt layouts for portrait vs landscape:

```typescript
function Dashboard() {
  const aspectRatio = useUiAspectRatio()
  const isPortrait = aspectRatio < 1

  return (
    <div className={`dashboard ${isPortrait ? 'dashboard--portrait' : ''}`}>
      <PrimaryContent />
      {/* Hide sidebar in portrait mode */}
      {!isPortrait && <Sidebar />}
    </div>
  )
}
```

## Complete Example

```typescript
// Render.tsx - Building on the init project's .render class
import { useUiScaleToSetRem, useUiAspectRatio } from '@telemetryos/sdk/react'
import { useUiScaleStoreState } from '../hooks/store'
import './Render.css'

export function Render() {
  const [isLoading, uiScale] = useUiScaleStoreState()
  const aspectRatio = useUiAspectRatio()

  useUiScaleToSetRem(uiScale)

  if (isLoading) return null

  const isPortrait = aspectRatio < 1

  return (
    <div className="render">
      <header className="render__header">
        <h1 className="render__title">Dashboard</h1>
      </header>

      <main className={`render__content ${isPortrait ? 'render__content--portrait' : ''}`}>
        <div className="render__primary">
          <MainDisplay />
        </div>

        {!isPortrait && (
          <aside className="render__sidebar">
            <SecondaryInfo />
          </aside>
        )}
      </main>
    </div>
  )
}
```

```css
/* Render.css - Add to existing styles, don't override .render base */
.render__header {
  flex-shrink: 0;
  margin-bottom: 2rem;
}

.render__title {
  font-size: 4rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.render__content {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 2rem;
}

.render__content--portrait {
  flex-direction: column;
}

.render__primary {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.render__sidebar {
  width: 25rem;
  flex-shrink: 0;
}
```

## Store Hook for UI Scale

Create a store hook to let admins adjust the UI scale:

```typescript
// hooks/store.ts
import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)
```

```typescript
// Settings.tsx - Add slider control
import { SettingsSliderFrame, SettingsField, SettingsLabel } from '@telemetryos/sdk/react'
import { useUiScaleStoreState } from '../hooks/store'

export function Settings() {
  // Pass 0 debounce for instant slider updates
  const [isLoading, uiScale, setUiScale] = useUiScaleStoreState(0)

  return (
    <SettingsField>
      <SettingsLabel>UI Scale</SettingsLabel>
      <SettingsSliderFrame>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          disabled={isLoading}
          value={uiScale}
          onChange={(e) => setUiScale(parseFloat(e.target.value))}
        />
        <span>{uiScale}x</span>
      </SettingsSliderFrame>
    </SettingsField>
  )
}
```

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using `px` units | Won't scale across resolutions | Use `rem` everywhere |
| Adding `:hover` styles | No mouse on digital signage | Remove interaction states |
| Using `overflow: scroll` | No user to scroll | Use `overflow: hidden`, truncate content |
| Fixed heights in `px` | Breaks on different aspect ratios | Use `vh`, `%`, or flex |
| Forgetting `useUiScaleToSetRem()` | `rem` units won't scale properly | Call it once in Render view with the uiScale from `useUiScaleStoreState()` |
| Text below 2rem | Unreadable from viewing distance | Minimum 2rem for body text |
| Removing `.render` padding | Content cut off by bezels | Keep the ~3rem padding from init project |
| Overriding `index.css` base styles | Breaks viewport scaling | Add new styles, don't modify base setup |
