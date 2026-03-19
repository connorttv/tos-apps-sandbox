import type { MenuItem as MenuItemType, ContentPriority, VisualSettings } from '../../types/menu'
import { MenuItem } from './MenuItem'

interface MenuGridProps {
  items: MenuItemType[]
  priorities: ContentPriority[]
  visualSettings: VisualSettings
  columns: number
  maxItems: number
}

/**
 * Menu grid component that displays items in a responsive grid.
 */
export function MenuGrid({
  items,
  priorities,
  visualSettings,
  columns,
  maxItems,
}: MenuGridProps) {
  const showP2 = priorities.includes('P2')
  // Filter out hidden items, then limit to maxItems
  const visibleItems = items.filter(item => !item.hidden)
  const displayItems = visibleItems.slice(0, maxItems)

  // For P1-only layouts (extreme), render as a simple list
  if (!showP2) {
    return (
      <div className="menu-grid menu-grid--p1-only">
        {displayItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            priorities={priorities}
            visualSettings={visualSettings}
          />
        ))}
      </div>
    )
  }

  // Simple grid
  return (
    <div
      className="menu-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {displayItems.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          priorities={priorities}
          visualSettings={visualSettings}
        />
      ))}
    </div>
  )
}
