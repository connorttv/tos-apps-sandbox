import { useEffect, useState } from 'react'
import { getLayoutShape, type LayoutShape } from '../utils/layoutShape'

export function useLayoutShape(): LayoutShape {
  const [shape, setShape] = useState<LayoutShape>(() =>
    getLayoutShape(window.innerWidth, window.innerHeight)
  )

  useEffect(() => {
    const update = () => setShape(getLayoutShape(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return shape
}
