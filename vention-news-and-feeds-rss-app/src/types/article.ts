/**
 * Article DTO - Represents a normalized news article from any RSS/Atom feed
 */
export interface Article {
  /** Article headline/title (required) */
  title: string
  /** Article description or summary (required) */
  description: string
  /** Link to the full article (required) */
  link: string
  /** Publication timestamp (required) */
  publishedAt: number
  /** Unique identifier for the source feed (required) */
  sourceId: string
  /** Article image URL (optional) */
  imageUrl?: string
  /** Source logo/brand image URL (optional) */
  sourceLogoUrl?: string
}
