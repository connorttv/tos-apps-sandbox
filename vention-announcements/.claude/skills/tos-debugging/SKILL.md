---
name: tos-debugging
description: Debug common TelemetryOS application issues and errors. Use when encountering SDK errors, sync issues, or render problems.
---

# TelemetryOS Debugging Guide

Common errors, their causes, and solutions.

## Error Reference

### "SDK not configured"

**Cause:** SDK methods called before `configure()`.

**Solution:**
```typescript
// index.tsx - MUST call configure before React renders
import { configure } from '@telemetryos/sdk'

configure('my-app')  // Name must match telemetry.config.json

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

**Check:**
- Is `configure()` called in index.tsx?
- Is it called BEFORE ReactDOM.createRoot()?
- Does the name match `telemetry.config.json`?

---

### "device storage not available"

**Cause:** Using `store().device` in Settings view.

**Why:** Settings runs in Studio (admin's browser), not on devices. Device storage is only available on physical TelemetryOS devices.

**Solution:**
```typescript
// WRONG - in Settings.tsx
const [, value, setValue] = useMyState() // using createUseDeviceStoreState

// CORRECT - use instance scope
const [, value, setValue] = useMyState() // using createUseInstanceStoreState
```

**Scope guide:**
- `createUseInstanceStoreState` - Settings ↔ Render communication
- `createUseApplicationStoreState` - Shared across all instances
- `createUseDeviceStoreState` - Render ONLY (device-local)

---

### CORS Error

**Symptom:** Browser console shows:
```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Cause:** External API doesn't include CORS headers.

**Solution:**
```typescript
// WRONG - blocked by CORS
const response = await fetch('https://api.example.com/data')

// CORRECT - use proxy
import { proxy } from '@telemetryos/sdk'
const response = await proxy().fetch('https://api.example.com/data')
```

---

### "Request timeout"

**Cause:** SDK operation exceeded 30-second timeout.

**Solution:**
```typescript
try {
  const response = await proxy().fetch(url)
  // ...
} catch (err) {
  if (err instanceof Error && err.message.includes('timeout')) {
    // Handle timeout - maybe retry or show error
    console.error('Request timed out')
  }
}
```

**Prevention:**
- Check if API endpoint is slow or unreachable
- Add loading states to prevent user confusion
- Consider retry logic for intermittent issues

---

### Render Not Updating

**Symptoms:**
- Settings changes don't appear in Render
- Render shows stale data
- Preview in Studio doesn't update

**Causes & Solutions:**

**1. Missing store hook in Render:**
```typescript
// Render.tsx - MUST use same hook as Settings
import { useCityState } from '../hooks/store'

const [isLoading, city] = useCityState()
```

**2. Not using instance scope:**
```typescript
// WRONG - different scopes don't sync
// Settings: createUseApplicationStoreState
// Render: createUseInstanceStoreState

// CORRECT - same scope
// Both use: createUseInstanceStoreState
```

**3. Missing subscription (low-level API):**
```typescript
// If using manual subscription
useEffect(() => {
  const handler = (value) => setValue(value)
  store().instance.subscribe('key', handler)

  return () => store().instance.unsubscribe('key', handler)  // IMPORTANT!
}, [])
```

---

### Memory Leak Warning

**Symptom:** React warning about memory leak or state update on unmounted component.

**Cause:** Not cleaning up store subscriptions.

**Solution - Use SDK hooks (recommended):**
```typescript
// Automatic cleanup
const [isLoading, value, setValue] = useMyState()
```

**Solution - Manual subscription:**
```typescript
useEffect(() => {
  const handler = (value) => setValue(value)
  store().instance.subscribe('key', handler)

  // MUST return cleanup function
  return () => {
    store().instance.unsubscribe('key', handler)
  }
}, [])
```

---

### Blank Screen

**Check these in order:**

1. **Browser console for errors**
   - Open DevTools (F12)
   - Check Console tab for red errors

2. **Correct route**
   ```
   http://localhost:3000/render   ← for Render view
   http://localhost:3000/settings ← for Settings view
   ```

3. **App.tsx routing**
   ```typescript
   if (path === '/settings') return <Settings />
   if (path === '/render') return <Render />
   ```

4. **SDK configured**
   ```typescript
   // index.tsx
   configure('app-name')  // Before React renders
   ```

5. **telemetry.config.json matches**
   ```json
   {
     "name": "app-name",  // Must match configure()
     "mountPoints": {
       "render": "/render",
       "settings": "/settings"
     }
   }
   ```

---

### TypeScript Errors

**"Cannot find module '@telemetryos/sdk'"**
```bash
npm install @telemetryos/sdk
```

**"Property does not exist on type"**
```typescript
// Add type parameter to store operations
const value = await store().instance.get<MyType>('key')

// Or define interfaces
interface Config {
  city: string
  units: 'imperial' | 'metric'
}
```

**"Type 'string | undefined' is not assignable"**
```typescript
// Handle undefined from store
const config = await store().instance.get<Config>('config')
if (config) {
  // config is now Config, not Config | undefined
}
```

---

## Debugging Techniques

### Console Logging

```typescript
// Check current path
console.log('Path:', window.location.pathname)

// Check store values
useEffect(() => {
  store().instance.get('myKey').then(value => {
    console.log('Store value:', value)
  })
}, [])

// Check hook values
const [isLoading, value] = useMyState()
console.log('isLoading:', isLoading, 'value:', value)
```

### Network Tab

1. Open DevTools → Network tab
2. Look for failed requests (red)
3. Check request/response details
4. Verify API endpoints and headers

### React DevTools

1. Install React DevTools browser extension
2. Inspect component props and state
3. Check hook values
4. Trace re-renders

### Local Development URLs

```
Settings:  http://localhost:3000/settings
Render:    http://localhost:3000/render
```

---

## Quick Fixes Checklist

- [ ] `configure()` called before React in index.tsx
- [ ] App name matches telemetry.config.json
- [ ] Using `createUseInstanceStoreState` (not device) in Settings
- [ ] Same store hooks in Settings and Render
- [ ] `disabled={isLoading}` on form inputs
- [ ] Error handling with try/catch
- [ ] Cleanup in useEffect return
- [ ] CORS issues → use `proxy().fetch()`

---

## Getting Help

1. **Check browser console** - Most errors show here first
2. **Check network tab** - API failures visible here
3. **Read error message** - SDK errors are descriptive
4. **Simplify** - Remove code until error disappears, then add back
5. **Compare to template** - Check working template code
