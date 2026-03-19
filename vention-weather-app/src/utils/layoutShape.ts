/**
 * 8 responsive layout shapes per design spec.
 * Content priority: P1 (all), P2 (hide in chiron/skyscraper), P3 (only in large shapes).
 */
export type LayoutShape =
  | 'landscape'
  | 'portrait'
  | 'large-square'
  | 'small-square'
  | 'large-portrait'
  | 'landscape-bar'
  | 'portrait-bar'
  | 'chiron'
  | 'skyscraper'

const LANDSCAPE_ASPECT = 16 / 9
const PORTRAIT_ASPECT = 9 / 16
const LANDSCAPE_BAR_ASPECT = 3
const PORTRAIT_BAR_ASPECT = 1 / 3
const CHIRON_ASPECT = 10
const SKYSCRAPER_ASPECT = 1 / 10
const SQUARE_LOW = 0.9
const SQUARE_HIGH = 1.1
const LARGE_PORTRAIT_ASPECT_MAX = 0.9
const LARGE_PORTRAIT_ASPECT_MIN = 0.7
const LANDSCAPE_BAR_MIN = 2.5
const CHIRON_MIN = 6
const PORTRAIT_BAR_MAX = 0.4
/* Aspect ≤0.2 skyscraper; ≤0.4 portrait-bar */
const SKYSCRAPER_MAX = 0.2
const SMALL_SQUARE_MAX_WIDTH = 500

/**
 * Classify current viewport into one of the 8 shapes.
 * Uses innerWidth/innerHeight so rem scaling doesn't change the result.
 */
export function getLayoutShape(): LayoutShape {
  const w = window.innerWidth
  const h = window.innerHeight
  const aspect = w / h

  if (aspect >= CHIRON_MIN) return 'chiron'
  if (aspect <= SKYSCRAPER_MAX) return 'skyscraper'
  if (aspect >= LANDSCAPE_BAR_MIN && aspect < CHIRON_MIN) return 'landscape-bar'
  if (aspect <= PORTRAIT_BAR_MAX && aspect > SKYSCRAPER_MAX) return 'portrait-bar'

  const isSquare = aspect >= SQUARE_LOW && aspect <= SQUARE_HIGH
  if (isSquare) {
    const minSide = Math.min(w, h)
    return minSide <= SMALL_SQUARE_MAX_WIDTH ? 'small-square' : 'large-square'
  }

  if (aspect >= LARGE_PORTRAIT_ASPECT_MIN && aspect < LARGE_PORTRAIT_ASPECT_MAX) return 'large-portrait'
  if (aspect >= PORTRAIT_ASPECT && aspect < SQUARE_LOW) return 'landscape'
  if (aspect <= LANDSCAPE_ASPECT && aspect > SQUARE_HIGH) return 'portrait'

  if (aspect > 1) return 'landscape'
  return 'portrait'
}

export function showP2(shape: LayoutShape): boolean {
  return shape !== 'chiron' && shape !== 'skyscraper'
}

export function showP3(shape: LayoutShape): boolean {
  return shape === 'landscape' || shape === 'portrait' || shape === 'large-square' || shape === 'portrait-bar' || shape === 'skyscraper' || shape === 'chiron'
}
