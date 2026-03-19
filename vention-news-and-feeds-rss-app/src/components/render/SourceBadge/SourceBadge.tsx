import './SourceBadge.css'

interface SourceBadgeProps {
  /** Source name (e.g., "BBC", "CNN", "Reuters") */
  sourceName: string
  /** Optional logo URL */
  logoUrl?: string
}

/**
 * SourceBadge - Displays source logo and name for brand recognition
 */
export function SourceBadge({ sourceName, logoUrl }: SourceBadgeProps) {
  return (
    <div className="source-badge">
      {logoUrl ? (
        <img src={logoUrl} alt={sourceName} className="source-badge__logo" />
      ) : (
        <div className="source-badge__logo-placeholder">{sourceName.charAt(0)}</div>
      )}
      <span className="source-badge__name">{sourceName}</span>
    </div>
  )
}
