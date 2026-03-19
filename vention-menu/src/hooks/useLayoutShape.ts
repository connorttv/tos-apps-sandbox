import { useUiAspectRatio } from '@telemetryos/sdk/react'
import type { LayoutShape } from '../types/menu'

/**
 * Detects the current layout shape based on viewport aspect ratio and size.
 * Returns one of the 8 standard TelemetryOS layout shapes.
 */
export function useLayoutShape(): LayoutShape {
  const aspectRatio = useUiAspectRatio()

  // Determine shape based on aspect ratio thresholds
  // aspectRatio = width / height
  // > 1 = landscape, < 1 = portrait, = 1 = square

  if (aspectRatio >= 8) {
    // Very wide: Chiron Banner (10:1)
    return 'chiron-banner'
  }

  if (aspectRatio <= 0.125) {
    // Very tall: Skyscraper (1:10)
    return 'skyscraper'
  }

  if (aspectRatio >= 2.5) {
    // Wide: Landscape Bar (3:1)
    return 'landscape-bar'
  }

  if (aspectRatio <= 0.4) {
    // Tall: Portrait Bar (1:3)
    return 'portrait-bar'
  }

  if (aspectRatio >= 1.5) {
    // Standard landscape (16:9 = 1.78)
    return 'landscape'
  }

  if (aspectRatio <= 0.67) {
    // Standard portrait (9:16 = 0.56)
    return 'portrait'
  }

  // Square-ish (between 0.67 and 1.5)
  // Use viewport size to determine large vs small square
  const viewportArea = window.innerWidth * window.innerHeight

  // Threshold: ~640x640 = 409600 pixels
  if (viewportArea > 500000) {
    return 'large-square'
  }

  return 'small-square'
}

/**
 * Returns the number of columns to use in the menu grid based on layout shape.
 */
export function getGridColumns(shape: LayoutShape): number {
  switch (shape) {
    case 'landscape':
      return 4
    case 'portrait':
      return 2
    case 'large-square':
      return 3
    case 'small-square':
      return 2
    case 'landscape-bar':
      return 4
    case 'portrait-bar':
      return 1
    case 'chiron-banner':
      return 6 // Horizontal scroll of items
    case 'skyscraper':
      return 1
  }
}

/**
 * Returns the number of rows to display based on layout shape.
 */
export function getGridRows(shape: LayoutShape): number {
  switch (shape) {
    case 'landscape':
      return 2
    case 'portrait':
      return 4
    case 'large-square':
      return 3
    case 'small-square':
      return 2
    case 'landscape-bar':
      return 1
    case 'portrait-bar':
      return 4
    case 'chiron-banner':
      return 1
    case 'skyscraper':
      return 6
  }
}

/**
 * Returns max items to display based on layout shape.
 */
export function getMaxItems(shape: LayoutShape): number {
  return getGridColumns(shape) * getGridRows(shape)
}
