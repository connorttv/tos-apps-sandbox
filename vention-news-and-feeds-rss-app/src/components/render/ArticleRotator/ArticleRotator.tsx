import { useEffect, useState, useRef } from 'react'
import { ArticleStage } from '../ArticleStage/ArticleStage'
import { EmptyState } from '../EmptyState/EmptyState'
import type { Article, TransitionStyle } from '../../../types'
import type { RssFeed } from '../../../types'
import './ArticleRotator.css'

interface ArticleRotatorProps {
  /** Array of articles to rotate through */
  articles: Article[]
  /** Array of feeds for source name lookup */
  feeds: RssFeed[]
  /** Duration each article is displayed (seconds) */
  durationSec: number
  /** Transition style */
  transitionStyle: TransitionStyle
  /** Whether content may be stale/offline */
  isOffline?: boolean
}

/**
 * ArticleRotator - Rotates through articles with configured transitions
 * 
 * Features:
 * - Continuous rotation loop
 * - Configurable duration per article
 * - Transition styles: fade, slide, cut
 * - Automatically restarts when articles change
 */
export function ArticleRotator({
  articles,
  feeds,
  durationSec,
  transitionStyle,
  isOffline = false,
}: ArticleRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset to first article when articles change
  useEffect(() => {
    setCurrentIndex(0)
    setIsTransitioning(false)
  }, [articles])

  // Set up rotation interval
  useEffect(() => {
    if (articles.length === 0) {
      return
    }

    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    const durationMs = durationSec * 1000
    const transitionDurationMs = transitionStyle === 'cut' ? 0 : 300 // 300ms for fade/slide

    const rotate = () => {
      if (articles.length === 0) return

      // For cut transition, change immediately
      if (transitionStyle === 'cut') {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length)
        return
      }

      // For fade/slide, start transition
      setIsTransitioning(true)

      // After transition starts, change article
      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          // Loop back to start
          const nextIndex = (prevIndex + 1) % articles.length
          return nextIndex
        })
        // End transition after a brief moment to show new article
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, transitionDurationMs)
    }

    // Start rotation after initial display
    intervalRef.current = setInterval(rotate, durationMs)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [articles, durationSec, transitionStyle])

  // Handle empty state
  if (articles.length === 0) {
    return <EmptyState message="No articles available. Feeds are being fetched..." />
  }

  const currentArticle = articles[currentIndex]
  const nextIndex = (currentIndex + 1) % articles.length
  const nextArticle = articles[nextIndex]

  const currentFeed = feeds.find((f) => f.id === currentArticle.sourceId)
  const currentSourceName = currentFeed?.name || currentArticle.sourceId

  const nextFeed = feeds.find((f) => f.id === nextArticle.sourceId)
  const nextSourceName = nextFeed?.name || nextArticle.sourceId

  // For slide transition, show both articles during transition
  const showBothArticles = transitionStyle === 'slide' && isTransitioning

  return (
    <div className={`article-rotator article-rotator--${transitionStyle}`}>
      {/* Current article */}
      <div
        className={`article-rotator__slide ${
          isTransitioning && transitionStyle === 'slide' ? 'article-rotator__slide--out' : ''
        } ${isTransitioning && transitionStyle === 'fade' ? 'article-rotator__slide--fade-out' : ''}`}
      >
        <ArticleStage article={currentArticle} sourceName={currentSourceName} isOffline={isOffline} />
      </div>

      {/* Next article (only visible during slide transition) */}
      {showBothArticles && (
        <div className="article-rotator__slide article-rotator__slide--in">
          <ArticleStage article={nextArticle} sourceName={nextSourceName} isOffline={isOffline} />
        </div>
      )}
    </div>
  )
}
