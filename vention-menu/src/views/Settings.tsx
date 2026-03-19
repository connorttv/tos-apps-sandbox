import { useState } from 'react'
import {
  SettingsContainer,
  SettingsBox,
  SettingsHeading,
  SettingsDivider,
  SettingsField,
  SettingsLabel,
  SettingsHint,
  SettingsInputFrame,
  SettingsTextAreaFrame,
  SettingsSelectFrame,
  SettingsSliderFrame,
  SettingsColorFrame,
  SettingsSwitchFrame,
  SettingsSwitchLabel,
  SettingsCheckboxFrame,
  SettingsCheckboxLabel,
  SettingsButtonFrame,
} from '@telemetryos/sdk/react'
import {
  useUiScaleStoreState,
  useMenuItemsStoreState,
  useVisualSettingsStoreState,
  useRotationSettingsStoreState,
  usePromoMessageStoreState,
  useMenuLabelStoreState,
  useRoundedCornersStoreState,
  useDarkModeStoreState,
} from '../hooks/store'
import {
  ROTATION_DURATIONS,
  DEFAULT_VISUAL_SETTINGS,
  FOOD_IMAGES,
} from '../types/menu'
import type { MenuItem } from '../types/menu'

export function Settings() {
  // Store hooks with appropriate debounce
  const [isLoadingScale, uiScale, setUiScale] = useUiScaleStoreState(5)
  const [isLoadingItems, menuItems, setMenuItems] = useMenuItemsStoreState(250)
  const [isLoadingVisual, visualSettings, setVisualSettings] = useVisualSettingsStoreState(5)
  const [isLoadingRotation, rotationSettings, setRotationSettings] = useRotationSettingsStoreState()
  const [isLoadingPromo, promoMessage, setPromoMessage] = usePromoMessageStoreState(250)
  const [isLoadingLabel, menuLabel, setMenuLabel] = useMenuLabelStoreState(250)
  const [isLoadingRounded, roundedCorners, setRoundedCorners] = useRoundedCornersStoreState()
  const [isLoadingDarkMode, darkMode, setDarkMode] = useDarkModeStoreState()

  // Local state for UI items
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [isMenuItemsSectionExpanded, setIsMenuItemsSectionExpanded] = useState(true)

  const isLoading =
    isLoadingScale ||
    isLoadingItems ||
    isLoadingVisual ||
    isLoadingRotation ||
    isLoadingPromo ||
    isLoadingLabel ||
    isLoadingRounded ||
    isLoadingDarkMode

  // Menu item helpers
  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      name: 'New Item',
      price: '',
      featured: false,
    }
    setMenuItems([...menuItems, newItem])
    setExpandedItemId(newItem.id)
    setIsMenuItemsSectionExpanded(true)
  }

  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id))
    if (expandedItemId === id) setExpandedItemId(null)
  }

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(
      menuItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === menuItems.length - 1) return

    const newItems = [...menuItems]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
      ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]
    setMenuItems(newItems)
  }

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id)
  }

  return (
    <SettingsContainer>
      {/* Menu Label - at the top */}
      <SettingsHeading>Menu Title</SettingsHeading>

      <SettingsField>
        <SettingsLabel>Menu Label</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="text"
            placeholder="e.g., BREAKFAST, LUNCH, DINNER"
            disabled={isLoading}
            value={menuLabel}
            onChange={(e) => setMenuLabel(e.target.value.toUpperCase())}
          />
        </SettingsInputFrame>
        <SettingsHint>Displayed on the sidebar (e.g., BREAKFAST, LUNCH, DINNER)</SettingsHint>
      </SettingsField>

      <SettingsDivider />

      {/* UI Scale */}
      <SettingsHeading>Display</SettingsHeading>

      <SettingsField>
        <SettingsLabel>UI Scale</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            disabled={isLoading}
            value={uiScale}
            onChange={(e) => setUiScale(parseFloat(e.target.value))}
          />
          <span>{uiScale.toFixed(2)}x</span>
        </SettingsSliderFrame>
        <SettingsHint>Adjust text and element sizes for your display</SettingsHint>
      </SettingsField>


      <SettingsField>
        <SettingsCheckboxFrame>
          <input
            type="checkbox"
            disabled={isLoading}
            checked={roundedCorners}
            onChange={(e) => setRoundedCorners(e.target.checked)}
          />
          <SettingsCheckboxLabel>Rounded Window Corners</SettingsCheckboxLabel>
        </SettingsCheckboxFrame>
        <SettingsHint>Toggle between rounded and straight corners for the menu window</SettingsHint>
      </SettingsField>

      <SettingsField>
        <SettingsCheckboxFrame>
          <input
            type="checkbox"
            disabled={isLoading}
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          <SettingsCheckboxLabel>Dark Mode</SettingsCheckboxLabel>
        </SettingsCheckboxFrame>
        <SettingsHint>Dark background with light text, or light background with dark text</SettingsHint>
      </SettingsField>

      <SettingsDivider />

      {/* Menu Items */}
      <div
        onClick={() => setIsMenuItemsSectionExpanded(!isMenuItemsSectionExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          paddingBottom: '0.5rem',
        }}
      >
        <SettingsHeading>Menu Items</SettingsHeading>
        <span style={{ fontSize: '1.2rem', color: '#fff' }}>
          {isMenuItemsSectionExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isMenuItemsSectionExpanded && (
        <>
          {menuItems.map((item, index) => (
            <SettingsBox key={item.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', width: '100%' }}>
                {/* Clickable Header for expanding/collapsing */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flex: 1,
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '1.5em' }}>
                    {index + 1}. {item.name || 'New Item'}
                  </span>
                  <span style={{ fontSize: '0.81em', color: '#888' }}>
                    {expandedItemId === item.id ? '▲' : '▼'}
                  </span>
                </div>

                {/* Reordering Controls */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    disabled={isLoading || index === 0}
                    onClick={() => moveItem(index, 'up')}
                    style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={isLoading || index === menuItems.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    ↓
                  </button>
                </div>
              </div>

              {expandedItemId === item.id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #444', paddingTop: '1.5rem', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <SettingsLabel>Item Name</SettingsLabel>
                    <SettingsInputFrame>
                      <input
                        type="text"
                        placeholder="e.g., Classic Burger"
                        disabled={isLoading}
                        value={item.name}
                        onChange={(e) => updateMenuItem(item.id, { name: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </SettingsInputFrame>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <SettingsLabel>Price</SettingsLabel>
                    <SettingsInputFrame>
                      <input
                        type="text"
                        placeholder="e.g., $8.99"
                        disabled={isLoading}
                        value={item.price}
                        onChange={(e) => updateMenuItem(item.id, { price: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </SettingsInputFrame>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <SettingsLabel>Description (optional)</SettingsLabel>
                    <SettingsTextAreaFrame>
                      <textarea
                        placeholder="Brief description..."
                        disabled={isLoading}
                        value={item.description || ''}
                        onChange={(e) => updateMenuItem(item.id, { description: e.target.value })}
                        rows={2}
                        style={{ width: '100%' }}
                      />
                    </SettingsTextAreaFrame>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <SettingsLabel>Image URL (optional)</SettingsLabel>
                    <SettingsInputFrame>
                      <input
                        type="text"
                        placeholder="https://..."
                        disabled={isLoading}
                        value={item.url || ''}
                        onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </SettingsInputFrame>
                    <SettingsHint>Overrides the selected image below</SettingsHint>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <SettingsLabel>Image Selector</SettingsLabel>
                    <SettingsSelectFrame>
                      <select
                        disabled={isLoading}
                        value={item.imageUrl || ''}
                        onChange={(e) => updateMenuItem(item.id, { imageUrl: e.target.value })}
                        style={{ width: '100%' }}
                      >
                        {FOOD_IMAGES.map(({ id, label, url }) => (
                          <option key={id} value={url}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </SettingsSelectFrame>
                  </div>

                  <SettingsField>
                    <SettingsCheckboxFrame>
                      <input
                        type="checkbox"
                        disabled={isLoading}
                        checked={item.featured}
                        onChange={(e) => updateMenuItem(item.id, { featured: e.target.checked })}
                      />
                      <SettingsCheckboxLabel>Featured Item</SettingsCheckboxLabel>
                    </SettingsCheckboxFrame>
                  </SettingsField>

                  <SettingsField>
                    <SettingsCheckboxFrame>
                      <input
                        type="checkbox"
                        disabled={isLoading}
                        checked={item.hidden || false}
                        onChange={(e) => updateMenuItem(item.id, { hidden: e.target.checked })}
                      />
                      <SettingsCheckboxLabel>Hide from Grid</SettingsCheckboxLabel>
                    </SettingsCheckboxFrame>
                    <SettingsHint>Temporarily hide this item from the menu display</SettingsHint>
                  </SettingsField>

                  <SettingsButtonFrame>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => removeMenuItem(item.id)}
                    >
                      Remove Item
                    </button>
                  </SettingsButtonFrame>
                </div>
              )}
            </SettingsBox>
          ))}

          <SettingsButtonFrame>
            <button type="button" disabled={isLoading} onClick={addMenuItem}>
              + Add Menu Item
            </button>
          </SettingsButtonFrame>
        </>
      )}

      <SettingsDivider />

      {/* Section Rotation */}
      <SettingsHeading>Section Rotation</SettingsHeading>

      <SettingsField>
        <SettingsSwitchFrame>
          <input
            type="checkbox"
            role="switch"
            disabled={isLoading}
            checked={rotationSettings.enabled}
            onChange={(e) =>
              setRotationSettings({ ...rotationSettings, enabled: e.target.checked })
            }
          />
          <SettingsSwitchLabel>Enable Rotation</SettingsSwitchLabel>
        </SettingsSwitchFrame>
        <SettingsHint>Automatically cycle through menu sections</SettingsHint>
      </SettingsField>

      {rotationSettings.enabled && (
        <SettingsField>
          <SettingsLabel>Rotation Duration</SettingsLabel>
          <SettingsSelectFrame>
            <select
              disabled={isLoading}
              value={rotationSettings.durationSec}
              onChange={(e) =>
                setRotationSettings({
                  ...rotationSettings,
                  durationSec: Number(e.target.value),
                })
              }
            >
              {ROTATION_DURATIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec} seconds
                </option>
              ))}
            </select>
          </SettingsSelectFrame>
        </SettingsField>
      )}

      <SettingsDivider />

      {/* Visual Customization */}
      <SettingsHeading>Visual Customization</SettingsHeading>

      <SettingsField>
        <SettingsLabel>Accent Color (Price Badges)</SettingsLabel>
        <SettingsColorFrame>
          <input
            type="color"
            disabled={isLoading}
            value={visualSettings.accentColor}
            onChange={(e) =>
              setVisualSettings({ ...visualSettings, accentColor: e.target.value })
            }
          />
          <span>{visualSettings.accentColor}</span>
        </SettingsColorFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Featured Item Border Color</SettingsLabel>
        <SettingsColorFrame>
          <input
            type="color"
            disabled={isLoading}
            value={visualSettings.featuredColor}
            onChange={(e) =>
              setVisualSettings({ ...visualSettings, featuredColor: e.target.value })
            }
          />
          <span>{visualSettings.featuredColor}</span>
        </SettingsColorFrame>
        <SettingsHint>Circle border color for featured menu items</SettingsHint>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Featured Badge Text</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="text"
            placeholder="Featured"
            disabled={isLoading}
            value={visualSettings.featuredText || ''}
            onChange={(e) =>
              setVisualSettings({ ...visualSettings, featuredText: e.target.value })
            }
          />
        </SettingsInputFrame>
        <SettingsHint>Text shown on the featured badge (e.g., "Featured", "Special", "New")</SettingsHint>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Logo URL (optional)</SettingsLabel>
        <SettingsInputFrame>
          <input
            type="text"
            placeholder="https://..."
            disabled={isLoading}
            value={visualSettings.logoUrl || ''}
            onChange={(e) =>
              setVisualSettings({ ...visualSettings, logoUrl: e.target.value })
            }
          />
        </SettingsInputFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Promotional Message (optional)</SettingsLabel>
        <SettingsTextAreaFrame>
          <textarea
            placeholder="Daily specials, announcements..."
            disabled={isLoading}
            value={promoMessage}
            onChange={(e) => setPromoMessage(e.target.value)}
            rows={2}
          />
        </SettingsTextAreaFrame>
      </SettingsField>

      <SettingsButtonFrame>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setVisualSettings(DEFAULT_VISUAL_SETTINGS)}
        >
          Reset to Defaults
        </button>
      </SettingsButtonFrame>
    </SettingsContainer>
  )
}
