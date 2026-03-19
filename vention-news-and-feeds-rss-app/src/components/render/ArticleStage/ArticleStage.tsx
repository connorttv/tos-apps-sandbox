import { useEffect, useState } from 'react'
import type { Article } from '../../../types'
import { ArticleCard } from '../ArticleCard/ArticleCard'
import { SourceBadge } from '../SourceBadge/SourceBadge'
import { TimeAgo } from '../TimeAgo/TimeAgo'
import './ArticleStage.css'

interface ArticleStageProps {
  /** Article to display */
  article: Article
  /** Source name for badge */
  sourceName?: string
  /** Whether content may be stale/offline */
  isOffline?: boolean
}

/**
 * ArticleStage - Full screen layout container for displaying a single article
 * 
 * Layout adapts based on aspect ratio:
 * - Horizontal (ratio >= 1): 2 columns (content left 4:1 image right)
 * - Vertical (ratio < 1): Image at top -> Title -> Content
 * - Footer with source badge (left) and timestamp (right)
 * - Optional offline indicator
 */
export function ArticleStage({ article, sourceName, isOffline = false }: ArticleStageProps) {
  const [isVertical, setIsVertical] = useState(false)

  useEffect(() => {
    const checkAspectRatio = () => {
      const ratio = window.innerWidth / window.innerHeight
      setIsVertical(ratio < 1)
    }

    checkAspectRatio()
    window.addEventListener('resize', checkAspectRatio)
    return () => window.removeEventListener('resize', checkAspectRatio)
  }, [])

  const hasImage = !!article.imageUrl

  if (isVertical) {
    // Vertical layout: image at top, then title and content
    return (
      <div className="article-stage article-stage--vertical">
        <div className="article-stage__main article-stage__main--vertical">
          <ArticleCard article={article} showImageAtTop={true} />
        </div>
        <div className="article-stage__footer">
          <SourceBadge sourceName={sourceName || article.sourceId} logoUrl={article.sourceLogoUrl} />
          <TimeAgo timestamp={article.publishedAt} />
          {isOffline && (
            <div className="article-stage__offline-indicator">
              Content may not be current
            </div>
          )}
        </div>
      </div>
    )
  }

  // Horizontal layout: 2 columns (content left, image right)
  return (
    <div className="article-stage article-stage--horizontal">
      <div className={`article-stage__main article-stage__main--horizontal ${hasImage ? '' : 'article-stage__main--no-image'}`}>
        <div className="article-stage__content">
          <ArticleCard article={article} showImageAtTop={false} />
        </div>
        {hasImage && (
          <div className="article-stage__image">
            <img src={article.imageUrl} alt={article.title} className="article-stage__image-img" />
          </div>
        )}
      </div>
      <div className="article-stage__footer">
        <SourceBadge sourceName={sourceName || article.sourceId} logoUrl={article.sourceLogoUrl} />
        <TimeAgo timestamp={article.publishedAt} />
        {isOffline && (
          <div className="article-stage__offline-indicator">
            Content may not be current
          </div>
        )}
      </div>
    </div>
  )
}
