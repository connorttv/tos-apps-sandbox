import { useState, useEffect } from 'react'
import { useUiScaleToSetRem } from '@telemetryos/sdk/react'
import {
  useUiScaleStoreState,
  useMenuItemsStoreState,
  useVisualSettingsStoreState,
  usePromoMessageStoreState,
  useMenuLabelStoreState,
  useRoundedCornersStoreState,
  useDarkModeStoreState,
  useRotationSettingsStoreState,
} from '../hooks/store'
import { useLayoutShape, getGridColumns, getMaxItems } from '../hooks/useLayoutShape'
import { getContentPriorities } from '../types/menu'
import { Sidebar } from '../components/render/Sidebar'
import { MenuGrid } from '../components/render/MenuGrid'
import './Render.css'

export function Render() {
  // Store hooks
  const [isLoadingScale, uiScale] = useUiScaleStoreState()
  const [isLoadingItems, menuItems] = useMenuItemsStoreState()
  const [isLoadingVisual, visualSettings] = useVisualSettingsStoreState()
  const [isLoadingPromo, promoMessage] = usePromoMessageStoreState()
  const [isLoadingLabel, menuLabel] = useMenuLabelStoreState()
  const [isLoadingRounded, roundedCorners] = useRoundedCornersStoreState()
  const [isLoadingDarkMode, darkMode] = useDarkModeStoreState()
  const [isLoadingRotation, rotationSettings] = useRotationSettingsStoreState()

  // Section rotation state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  // Apply UI scaling
  useUiScaleToSetRem(uiScale)

  // Detect layout shape
  const layoutShape = useLayoutShape()
  const priorities = getContentPriorities(layoutShape)
  const columns = getGridColumns(layoutShape)
  const maxItems = getMaxItems(layoutShape)

  // Calculate number of sections based on maxItems
  const visibleItems = menuItems.filter((item) => !item.hidden)
  const totalSections = Math.ceil(visibleItems.length / maxItems)

  // Section rotation effect
  useEffect(() => {
    if (!rotationSettings.enabled || totalSections <= 1) {
      setCurrentSectionIndex(0)
      return
    }

    const intervalId = setInterval(() => {
      setCurrentSectionIndex((prev) => (prev + 1) % totalSections)
    }, rotationSettings.durationSec * 1000)

    return () => clearInterval(intervalId)
  }, [rotationSettings.enabled, rotationSettings.durationSec, totalSections])

  // Get items for current section
  const getDisplayItems = () => {
    if (!rotationSettings.enabled || totalSections <= 1) {
      return visibleItems.slice(0, maxItems)
    }
    const startIndex = currentSectionIndex * maxItems
    return visibleItems.slice(startIndex, startIndex + maxItems)
  }

  // Loading state
  const isLoading =
    isLoadingScale ||
    isLoadingItems ||
    isLoadingVisual ||
    isLoadingVisual ||
    isLoadingPromo ||
    isLoadingLabel ||
    isLoadingRounded ||
    isLoadingDarkMode ||
    isLoadingRotation

  if (isLoading) {
    return null // Fail silently during loading
  }

  // Determine if we should show sidebar (P2/P3 layouts only, and landscape-ish)
  const showSidebar =
    priorities.includes('P2') &&
    (layoutShape === 'landscape' || layoutShape === 'large-square')

  // Get layout class
  const layoutClass = `render--${layoutShape}`
  const cornerClass = roundedCorners ? 'render--rounded-corners' : ''
  const themeClass = darkMode ? 'render--dark' : 'render--light'

  return (
    <div className={`render ${layoutClass} ${cornerClass} ${themeClass}`}>
      {showSidebar && (
        <Sidebar
          visualSettings={visualSettings}
          priorities={priorities}
          promoMessage={promoMessage}
          menuLabel={menuLabel}
        />
      )}

      <main className="render__content">
        <div key={currentSectionIndex} className="fade-in" style={{ width: '100%', height: '100%' }}>
          <MenuGrid
            items={getDisplayItems()}
            priorities={priorities}
            visualSettings={visualSettings}
            columns={columns}
            maxItems={maxItems}
          />
        </div>
      </main>
    </div>
  )
}
