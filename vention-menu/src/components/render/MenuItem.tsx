import type { MenuItem as MenuItemType, ContentPriority, VisualSettings } from '../../types/menu'

interface MenuItemProps {
  item: MenuItemType
  priorities: ContentPriority[]
  visualSettings: VisualSettings
  compact?: boolean
}

/**
 * Menu item component with circular image design.
 * Price badge overlaps bottom of image.
 * P1: name, price (always visible)
 * P2: image (hidden in extreme layouts)
 * P3: description (only in large layouts)
 */
export function MenuItem({ item, priorities, visualSettings, compact = false }: MenuItemProps) {
  const showP2 = priorities.includes('P2')
  const showP3 = priorities.includes('P3')

  const isP1Only = !showP2 && !showP3

  if (isP1Only) {
    // Extreme layouts: just name and price in a compact row
    return (
      <div className="menu-item menu-item--p1-only">
        <span className="menu-item__name">{item.name}</span>
        <span
          className="menu-item__price menu-item__price--inline"
          style={{ backgroundColor: visualSettings.accentColor }}
        >
          {item.price}
        </span>
      </div>
    )
  }

  return (
    <div className={`menu-item ${compact ? 'menu-item--compact' : ''} ${item.featured ? 'menu-item--featured' : ''}`}>
      {/* P2: Circular Image */}
      {showP2 && (() => {
        const borderColor = visualSettings.featuredColor || visualSettings.accentColor || '#FF7A00'
        const badgeText = visualSettings.featuredText || 'Featured'
        return (
          <div className="menu-item__image-wrapper">
            {/* Featured badge on top-left */}
            {item.featured && (
              <div
                className="menu-item__featured-badge"
                style={{ backgroundColor: borderColor }}
              >
                {badgeText}
              </div>
            )}
            <div
              className="menu-item__image-container"
              style={item.featured ? {
                border: `0.3rem solid ${borderColor}`,
                boxShadow: `0 0 12px ${borderColor}40`
              } : undefined}
            >
              <img
                src={item.url || item.imageUrl || '/assets/images/default_placeholder.png'}
                alt={item.name}
                className="menu-item__image"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = '/assets/images/default_placeholder.png'
                }}
              />
            </div>
          </div>
        )
      })()}

      <div className="menu-item__info">
        {/* P1: Price - Badge overlapping image */}
        <div
          className="menu-item__price"
          style={{ backgroundColor: visualSettings.accentColor }}
        >
          {item.price}
        </div>

        {/* P1: Name - Always visible */}
        <h3 className="menu-item__name">{item.name}</h3>

        {/* P3: Description */}
        {showP3 && item.description && (
          <p className="menu-item__description">{item.description}</p>
        )}
      </div>
    </div>
  )
}
