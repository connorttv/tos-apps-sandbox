import { createUseInstanceStoreState } from '@telemetryos/sdk/react'
import type {
  MenuItem,
  VisualSettings,
  RotationSettings,
} from '../types/menu'
import {
  DEFAULT_VISUAL_SETTINGS,
  DEFAULT_ROTATION_SETTINGS,
  SAMPLE_MENU_ITEMS,
} from '../types/menu'

// UI Scale (from init project)
export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)

// Menu Items
export const useMenuItemsStoreState = createUseInstanceStoreState<MenuItem[]>('menu-items', SAMPLE_MENU_ITEMS)

// Visual Settings
export const useVisualSettingsStoreState = createUseInstanceStoreState<VisualSettings>('visual-settings', DEFAULT_VISUAL_SETTINGS)

// Rotation Settings
export const useRotationSettingsStoreState = createUseInstanceStoreState<RotationSettings>('rotation-settings', DEFAULT_ROTATION_SETTINGS)

// Promotional message
export const usePromoMessageStoreState = createUseInstanceStoreState<string>('promo-message', '')

// Menu label (e.g., "BREAKFAST", "LUNCH", "DINNER")
export const useMenuLabelStoreState = createUseInstanceStoreState<string>('menu-label', 'BREAKFAST')

// Rounded corners for window
export const useRoundedCornersStoreState = createUseInstanceStoreState<boolean>('rounded-corners', true)

// Dark mode (dark background with white text) vs Light mode (white background with dark text)
export const useDarkModeStoreState = createUseInstanceStoreState<boolean>('dark-mode', true)
