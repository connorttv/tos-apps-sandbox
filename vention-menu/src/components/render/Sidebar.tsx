import type { VisualSettings, ContentPriority } from '../../types/menu'
import backgroundImage from '../../../assets/images/main_background_logo.png'

interface SidebarProps {
  visualSettings: VisualSettings
  priorities: ContentPriority[]
  promoMessage?: string
  menuLabel: string
}

/**
 * Sidebar component with food image background and menu text.
 * Uses main_background_logo.png as the background.
 * 
 * Design:
 * - menuLabel (e.g., "BREAKFAST"): White text on orange pill background
 * - "MENU": Orange text on white pill background, overlapping the label above
 * - Text container is centered and takes ~80% width
 */
export function Sidebar({ visualSettings, priorities, promoMessage, menuLabel }: SidebarProps) {
  const showP3 = priorities.includes('P3')

  return (
    <aside className="sidebar">
      {/* Background food image */}
      <img
        src={backgroundImage}
        alt=""
        className="sidebar__background"
      />

      <div className="sidebar__content">
        {/* Logo - P3 content */}
        {showP3 && visualSettings.logoUrl && (
          <div className="sidebar__logo">
            <img src={visualSettings.logoUrl} alt="Logo" />
          </div>
        )}

        {/* Promo Message - P3 content */}
        {showP3 && promoMessage && (
          <div className="sidebar__promo">
            <p>{promoMessage}</p>
          </div>
        )}

        {/* Spacer to push text to bottom */}
        <div className="sidebar__spacer" />

        {/* Menu label - centered, ~80% width, MENU overlaps BREAKFAST */}
        <div className="sidebar__text-container">
          {/* BREAKFAST - White text on orange pill */}
          <div
            className="sidebar__menu-label"
            style={{
              backgroundColor: visualSettings.accentColor,
              color: '#FFFFFF'
            }}
          >
            {menuLabel}
          </div>

          {/* MENU - Orange text on white pill, overlapping above */}
          <div
            className="sidebar__menu-text"
            style={{
              backgroundColor: '#FFFFFF',
              color: visualSettings.accentColor
            }}
          >
            MENU
          </div>
        </div>
      </div>
    </aside>
  )
}

