/**
 * Maps viewport aspect ratio (and size for square) to the 8 layout shapes
 * from announcement-project.md.
 */
export type LayoutShape =
  | 'landscape-16-9'
  | 'portrait-9-16'
  | 'square-large'
  | 'square-small'
  | 'landscape-bar-3-1'
  | 'portrait-bar-1-3'
  | 'chiron-10-1'
  | 'skyscraper-1-10'

const SMALL_SQUARE_MAX_PX = 600

export function getLayoutShape(aspectRatio: number, minDimensionPx: number): LayoutShape {
  const ratio = aspectRatio

  if (ratio >= 8) return 'chiron-10-1'
  if (ratio >= 2.4 && ratio < 8) return 'landscape-bar-3-1'
  if (ratio >= 1.4 && ratio < 2.4) return 'landscape-16-9'
  if (ratio >= 0.9 && ratio <= 1.1) {
    return minDimensionPx < SMALL_SQUARE_MAX_PX ? 'square-small' : 'square-large'
  }
  if (ratio >= 0.5 && ratio < 0.9) return 'portrait-9-16'
  if (ratio >= 0.2 && ratio < 0.5) return 'portrait-bar-1-3'
  return 'skyscraper-1-10'
}

const EXTREME_SHAPES: LayoutShape[] = ['chiron-10-1', 'skyscraper-1-10']
const LARGE_SHAPES: LayoutShape[] = ['landscape-16-9', 'portrait-9-16', 'square-large']

export function isExtremeShape(shape: LayoutShape): boolean {
  return EXTREME_SHAPES.includes(shape)
}

export function isLargeShape(shape: LayoutShape): boolean {
  return LARGE_SHAPES.includes(shape)
}

/** P1 = all shapes. P2 = not extreme. P3 = large only. */
export function showP2(shape: LayoutShape): boolean {
  return !isExtremeShape(shape)
}

export function showP3(shape: LayoutShape): boolean {
  return isLargeShape(shape)
}
