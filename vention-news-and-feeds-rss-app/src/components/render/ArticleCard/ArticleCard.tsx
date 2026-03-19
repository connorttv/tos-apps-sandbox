import type { Article } from '../../../types'
import './ArticleCard.css'

interface ArticleCardProps {
  /** Article to display */
  article: Article
  /** Whether to show image at top (for vertical layout) */
  showImageAtTop?: boolean
}

/**
 * ArticleCard - Displays headline and summary for an article
 * 
 * Optimized for 10-20 foot viewing with large typography and high contrast
 * - Vertical layout: image (if exists) -> title -> description
 * - Horizontal layout: title -> description (image shown separately)
 */
export function ArticleCard({ article, showImageAtTop = false }: ArticleCardProps) {
  return (
    <div className="article-card">
      {showImageAtTop && article.imageUrl && (
        <div className="article-card__image-container">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="article-card__image" 
          />
        </div>
      )}
      <h1 className="article-card__title">{article.title}</h1>
      <p className="article-card__description">{article.description}</p>
    </div>
  )
}
