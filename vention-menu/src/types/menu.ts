// Menu Board Types

export interface MenuItem {
  id: string
  name: string
  price: string // Currency formatted "$8.99"
  description?: string
  imageUrl?: string // Selection from predefined list
  url?: string // Custom image URL (overrides imageUrl)
  featured: boolean
  hidden?: boolean // Hide from grid display
}

export interface VisualSettings {
  primaryColor: string // Red sidebar gradient start
  secondaryColor: string // Red sidebar gradient end
  accentColor: string // Orange for price badges
  featuredColor: string // Color for featured item border
  featuredText: string // Text for featured badge
  textColor: string
  fontSize: 'small' | 'medium' | 'large'
  logoUrl?: string
}

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  primaryColor: '#000000',
  secondaryColor: '#1a1a1a',
  accentColor: '#FF7A00', // Orange for price badges and menu text
  featuredColor: '#FF7A00', // Default to accent color for featured border
  featuredText: 'Featured', // Default text for featured badge
  textColor: '#FFFFFF',
  fontSize: 'medium',
}

export interface RotationSettings {
  enabled: boolean
  durationSec: number // 5, 10, 15, 20, 30, 60
}

export const DEFAULT_ROTATION_SETTINGS: RotationSettings = {
  enabled: false,
  durationSec: 20,
}

export const ROTATION_DURATIONS = [5, 10, 15, 20, 30, 60]

// Predefined food images for dropdown selection (local assets)
export interface FoodImage {
  id: string
  label: string
  url: string
}

export const FOOD_IMAGES: FoodImage[] = [
  { id: 'none', label: 'No Image', url: '' },
  // Breakfast items
  { id: 'scrambled-eggs', label: 'Scrambled Eggs', url: '/assets/images/dish/breakfast/scrambled_eggs.jpg' },
  { id: 'avocado-toast', label: 'Avocado Toast', url: '/assets/images/dish/breakfast/avacado_toast.jpg' },
  { id: 'oatmeal-bowl', label: 'Oatmeal Bowl', url: '/assets/images/dish/breakfast/oatmeal_bowl.jpg' },
  { id: 'belgian-waffles', label: 'Belgian Waffles', url: '/assets/images/dish/breakfast/belgian_waffles.jpg' },
  { id: 'pancake-stack', label: 'Pancake Stack', url: '/assets/images/dish/breakfast/pancake_stack.jpg' },
  { id: 'italian-croissant', label: 'Butter Croissant', url: '/assets/images/dish/breakfast/italian_croissant.jpg' },
  { id: 'breakfast-burrito', label: 'Breakfast Burrito', url: '/assets/images/dish/breakfast/breakfast_burrito.jpg' },
  { id: 'sandwich', label: 'Sandwich', url: '/assets/images/dish/breakfast/sandwichh.jpg' },
]

// Helper to get image URL from selection
export function getImageUrl(imageId: string | undefined): string {
  if (!imageId) return ''
  const image = FOOD_IMAGES.find(img => img.id === imageId)
  return image?.url || imageId // Fall back to treating it as URL if not found
}

// Layout shape types for responsive design
export type LayoutShape =
  | 'landscape' // 16:9
  | 'portrait' // 9:16
  | 'large-square' // 1:1 large
  | 'small-square' // 1:1 small
  | 'landscape-bar' // 3:1
  | 'portrait-bar' // 1:3
  | 'chiron-banner' // 10:1
  | 'skyscraper' // 1:10

// Content priority levels
export type ContentPriority = 'P1' | 'P2' | 'P3'

// P1: Item name, price (visible in ALL shapes)
// P2: Item image, section headers, featured badge (hidden in extreme shapes)
// P3: Item description, promotional messages, logo (only in large shapes)
export function getContentPriorities(shape: LayoutShape): ContentPriority[] {
  switch (shape) {
    case 'landscape':
    case 'portrait':
    case 'large-square':
      return ['P1', 'P2', 'P3']
    case 'small-square':
    case 'landscape-bar':
    case 'portrait-bar':
      return ['P1', 'P2']
    case 'chiron-banner':
    case 'skyscraper':
      return ['P1']
  }
}

// Sample menu data for testing (matching the Figma design)
export const SAMPLE_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Scrambled Eggs', price: '$6.50', description: 'Fluffy scrambled eggs served with toasted sourdough bread and butter', featured: false, imageUrl: '/assets/images/dish/breakfast/scrambled_eggs.jpg' },
  { id: '2', name: 'Avocado Toast', price: '$7.90', description: 'Smashed avocado on toasted multigrain bread, topped with cherry tomatoes and oil', featured: false, imageUrl: '/assets/images/dish/breakfast/avacado_toast.jpg' },
  { id: '3', name: 'Oatmeal Bowl', price: '$5.80', description: 'Warm oatmeal with honey, banana slices, and nuts', featured: false, imageUrl: '/assets/images/dish/breakfast/oatmeal_bowl.jpg' },
  { id: '4', name: 'Belgian Waffles', price: '$8.20', description: 'Crispy waffles with cream and strawberry', featured: false, imageUrl: '/assets/images/dish/breakfast/belgian_waffles.jpg' },
  { id: '5', name: 'Pancake Stack', price: '$8.50', description: 'Three pancakes served with maple syrup and fresh berries', featured: false, imageUrl: '/assets/images/dish/breakfast/pancake_stack.jpg' },
  { id: '6', name: 'Butter Croissant', price: '$4.20', description: 'Freshly baked croissant served with jam and butter', featured: false, imageUrl: '/assets/images/dish/breakfast/italian_croissant.jpg' },
  { id: '7', name: 'Breakfast Burrito', price: '$5.80', description: 'Eggs, sausage, potatoes, cheese', featured: false, imageUrl: '/assets/images/dish/breakfast/breakfast_burrito.jpg' },
  { id: '8', name: 'Sandwich', price: '$8.20', description: 'Crispy waffles with cream and strawberry', featured: false, imageUrl: '/assets/images/dish/breakfast/sandwichh.jpg' },
]
