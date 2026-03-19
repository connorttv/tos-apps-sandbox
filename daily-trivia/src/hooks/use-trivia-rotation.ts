import { useState, useEffect, useCallback, useRef } from 'react'
import { triviaItems, type Category, type TriviaItem } from '../data/trivia'

type Phase = 'entering' | 'visible' | 'exiting'

interface UseTriviaRotationOptions {
  selectedCategories: Category[]
  contentMode: string
  transitionSpeed: number
  answerRevealDelay: number
}

interface UseTriviaRotationResult {
  currentItem: TriviaItem | null
  showAnswer: boolean
  phase: Phase
  index: number
  queueLength: number
}

/** Fisher-Yates shuffle (in-place). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function filterItems(categories: Category[], mode: string): TriviaItem[] {
  return triviaItems.filter((item) => {
    if (!categories.includes(item.category)) return false
    if (mode === 'facts' && item.type !== 'fact') return false
    if (mode === 'qa' && item.type !== 'qa') return false
    return true
  })
}

export function useTriviaRotation({
  selectedCategories,
  contentMode,
  transitionSpeed,
  answerRevealDelay,
}: UseTriviaRotationOptions): UseTriviaRotationResult {
  const [queue, setQueue] = useState<TriviaItem[]>([])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('entering')
  const [showAnswer, setShowAnswer] = useState(false)

  // Stable serialized key for categories so we can use it in deps
  const categoriesKey = selectedCategories.join(',')

  const rebuildQueue = useCallback(() => {
    const filtered = filterItems(selectedCategories, contentMode)
    if (filtered.length === 0) return
    setQueue(shuffle([...filtered]))
    setIndex(0)
    setPhase('entering')
    setShowAnswer(false)
  }, [categoriesKey, contentMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild queue when filters change
  useEffect(() => {
    rebuildQueue()
  }, [rebuildQueue])

  const currentItem = queue.length > 0 ? queue[index] ?? null : null

  // Use ref to avoid stale closures in timers
  const stateRef = useRef({ transitionSpeed, answerRevealDelay, queue, index })
  useEffect(() => {
    stateRef.current = { transitionSpeed, answerRevealDelay, queue, index }
  })

  // Phase & timer management
  useEffect(() => {
    if (!currentItem) return

    const ENTER_MS = 600
    const EXIT_MS = 500
    const timers: ReturnType<typeof setTimeout>[] = []

    // entering → visible
    timers.push(
      setTimeout(() => {
        setPhase('visible')
      }, ENTER_MS),
    )

    // reveal answer for Q&A items
    if (currentItem.type === 'qa') {
      timers.push(
        setTimeout(() => {
          setShowAnswer(true)
        }, ENTER_MS + stateRef.current.answerRevealDelay * 1000),
      )
    }

    // visible → exiting
    timers.push(
      setTimeout(() => {
        setPhase('exiting')
      }, ENTER_MS + stateRef.current.transitionSpeed * 1000),
    )

    // exiting → advance to next item
    timers.push(
      setTimeout(() => {
        setShowAnswer(false)
        setPhase('entering')
        setIndex((prev) => {
          const next = prev + 1
          if (next >= stateRef.current.queue.length) {
            // Re-shuffle and restart
            setQueue((q) => shuffle([...q]))
            return 0
          }
          return next
        })
      }, ENTER_MS + stateRef.current.transitionSpeed * 1000 + EXIT_MS),
    )

    return () => timers.forEach(clearTimeout)
  }, [currentItem?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { currentItem, showAnswer, phase, index, queueLength: queue.length }
}
