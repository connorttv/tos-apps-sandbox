import { useState, useEffect } from 'react'
import { getLayoutShape, type LayoutShape } from '../utils/layoutShape'

export function useLayoutShape(): LayoutShape {
  const [shape, setShape] = useState<LayoutShape>(() => getLayoutShape())

  useEffect(() => {
    const update = () => setShape(getLayoutShape())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return shape
}
