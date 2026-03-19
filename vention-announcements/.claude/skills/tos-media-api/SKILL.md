---
name: tos-media-api
description: Access TelemetryOS Media Library for images, videos, and files. Use when building apps that display user-uploaded media content.
---

# TelemetryOS Media API

The Media API provides access to content uploaded to the TelemetryOS Media Library. Users manage their media through Studio and your app can display it.

## Quick Reference

```typescript
import { media } from '@telemetryos/sdk'

// Get all folders
const folders = await media().getAllFolders()

// Get content in a folder
const content = await media().getAllByFolderId('folder-id')

// Get content by tag
const tagged = await media().getAllByTag('banner')

// Get single item by ID
const item = await media().getById('content-id')
```

## Response Types

### MediaFolder

```typescript
interface MediaFolder {
  id: string
  parentId: string        // Parent folder ID (empty for root)
  name: string            // Folder name
  size: number            // Number of items
  default: boolean        // Is this the default folder?
  createdAt: Date
  updatedAt: Date
}
```

### MediaContent

```typescript
interface MediaContent {
  id: string
  contentFolderId: string // Parent folder
  contentType: string     // MIME type (image/jpeg, video/mp4, etc.)
  name: string            // File name
  description: string     // User description
  thumbnailUrl: string    // Thumbnail for preview
  keys: string[]          // Storage keys
  publicUrls: string[]    // CDN URLs for display
  hidden: boolean         // Hidden from listings
  validFrom?: Date        // Content scheduling
  validTo?: Date          // Content scheduling
  createdAt: Date
  updatedAt: Date
}
```

## Common Patterns

### Folder Picker in Settings

Let users select a folder, then display its contents in Render.

```typescript
// hooks/store.ts
import { createUseInstanceStoreState } from '@telemetryos/sdk/react'

export const useFolderIdState = createUseInstanceStoreState<string>('folderId', '')
```

```typescript
// views/Settings.tsx
import { useEffect, useState } from 'react'
import { media } from '@telemetryos/sdk'
import {
  SettingsContainer,
  SettingsField,
  SettingsLabel,
  SettingsSelectFrame,
} from '@telemetryos/sdk/react'
import { useFolderIdState } from '../hooks/store'

interface Folder {
  id: string
  name: string
}

export default function Settings() {
  const [isLoading, folderId, setFolderId] = useFolderIdState()
  const [folders, setFolders] = useState<Folder[]>([])

  useEffect(() => {
    media().getAllFolders().then(setFolders)
  }, [])

  return (
    <SettingsContainer>
      <SettingsField>
        <SettingsLabel>Media Folder</SettingsLabel>
        <SettingsSelectFrame>
          <select
            disabled={isLoading || folders.length === 0}
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
          >
            <option value="">Select a folder...</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </SettingsSelectFrame>
      </SettingsField>
    </SettingsContainer>
  )
}
```

### Image Gallery in Render

```typescript
// views/Render.tsx
import { useEffect, useState } from 'react'
import { media } from '@telemetryos/sdk'
import { useFolderIdState } from '../hooks/store'

interface MediaItem {
  id: string
  name: string
  url: string
  thumbnailUrl: string
}

export default function Render() {
  const [isLoading, folderId] = useFolderIdState()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoading || !folderId) return

    const fetchMedia = async () => {
      setLoading(true)
      try {
        const content = await media().getAllByFolderId(folderId)

        // Filter to images only
        const images = content
          .filter(item => item.contentType.startsWith('image/'))
          .map(item => ({
            id: item.id,
            name: item.name,
            url: item.publicUrls[0],
            thumbnailUrl: item.thumbnailUrl,
          }))

        setItems(images)
      } catch (err) {
        console.error('Failed to load media:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [folderId, isLoading])

  if (isLoading) return <div>Loading config...</div>
  if (!folderId) return <div>Select a folder in Settings</div>
  if (loading) return <div>Loading images...</div>
  if (items.length === 0) return <div>No images in folder</div>

  return (
    <div className="gallery">
      {items.map(item => (
        <img
          key={item.id}
          src={item.url}
          alt={item.name}
          loading="lazy"
        />
      ))}
    </div>
  )
}
```

### Video Player

```typescript
// views/Render.tsx
import { useEffect, useState } from 'react'
import { media } from '@telemetryos/sdk'
import { useVideoIdState } from '../hooks/store'

export default function Render() {
  const [isLoading, videoId] = useVideoIdState()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading || !videoId) return

    media().getById(videoId).then(item => {
      if (item.contentType.startsWith('video/')) {
        setVideoUrl(item.publicUrls[0])
      }
    })
  }, [videoId, isLoading])

  if (isLoading) return <div>Loading...</div>
  if (!videoUrl) return <div>No video selected</div>

  return (
    <video
      src={videoUrl}
      autoPlay
      loop
      muted
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
```

### Content Picker by Tag

```typescript
// Settings - let user select from tagged content
const [items, setItems] = useState<MediaContent[]>([])

useEffect(() => {
  media().getAllByTag('logo').then(setItems)
}, [])
```

### Slideshow with Auto-Advance

```typescript
import { useEffect, useState } from 'react'
import { media } from '@telemetryos/sdk'
import { useFolderIdState, useIntervalState } from '../hooks/store'

export default function Render() {
  const [, folderId] = useFolderIdState()
  const [, interval] = useIntervalState() // seconds

  const [images, setImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Load images
  useEffect(() => {
    if (!folderId) return

    media().getAllByFolderId(folderId).then(content => {
      const urls = content
        .filter(item => item.contentType.startsWith('image/'))
        .map(item => item.publicUrls[0])
      setImages(urls)
    })
  }, [folderId])

  // Auto-advance
  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % images.length)
    }, interval * 1000)

    return () => clearInterval(timer)
  }, [images.length, interval])

  if (images.length === 0) return <div>No images</div>

  return (
    <img
      src={images[currentIndex]}
      alt={`Slide ${currentIndex + 1}`}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  )
}
```

## Content Type Filtering

```typescript
const content = await media().getAllByFolderId(folderId)

// Images only
const images = content.filter(item => item.contentType.startsWith('image/'))

// Videos only
const videos = content.filter(item => item.contentType.startsWith('video/'))

// PDFs only
const pdfs = content.filter(item => item.contentType === 'application/pdf')

// Specific formats
const jpegs = content.filter(item => item.contentType === 'image/jpeg')
const mp4s = content.filter(item => item.contentType === 'video/mp4')
```

## Scheduling Support

Media items can have valid date ranges:

```typescript
const content = await media().getAllByFolderId(folderId)

const now = new Date()
const activeContent = content.filter(item => {
  // Check if within valid date range
  if (item.validFrom && new Date(item.validFrom) > now) return false
  if (item.validTo && new Date(item.validTo) < now) return false
  return true
})
```

## Tips

1. **Use publicUrls[0]** - First URL is the primary CDN URL
2. **Use thumbnailUrl for previews** - Smaller, faster loading
3. **Filter by contentType** - Ensure you're displaying compatible content
4. **Handle empty folders** - Show appropriate message when no content
5. **Lazy load images** - Use `loading="lazy"` for galleries
6. **Respect hidden flag** - Filter out hidden items unless intentional
