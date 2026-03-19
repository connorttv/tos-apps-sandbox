/**
 * Layout shape from viewport aspect ratio (innerWidth / innerHeight).
 * Used to choose canvas dimensions and CSS layout (16:9 vs 9:16).
 */

export type LayoutShape = 'landscape' | 'portrait' | 'landscapeBar' | 'largePortrait' | 'portraitBar' | 'skyscraper' | 'square' | 'chiron'

/**
 * Returns layout shape from current viewport dimensions (CSS pixels).
 * Does not use rem or root font-size.
 */
export function getLayoutShape(width: number, height: number): LayoutShape {
  const aspect = width / height
  if (aspect >= 5.5) return 'chiron' /* 10:1 one-line strip */
  if (aspect >= 2.2 && aspect <= 4) return 'landscapeBar' /* 3:1 */
  if (aspect >= 0.92 && aspect <= 1.08) return 'square' /* 1:1 */
  if (aspect >= 1) return 'landscape'
  if (aspect >= 0.72 && aspect < 0.95) return 'largePortrait' /* 4:5 large */
  if (aspect >= 0.3 && aspect < 0.5) return 'portraitBar' /* 1:3 */
  if (aspect < 0.2) return 'skyscraper' /* 1:10 */
  return 'portrait' /* 9:16 */
}
