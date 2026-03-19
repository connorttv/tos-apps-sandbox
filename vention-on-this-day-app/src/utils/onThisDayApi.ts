import { proxy } from '@telemetryos/sdk'

/** Single event from Wikipedia On This Day API (any category) */
export interface OnThisDayItem {
  text: string
  year?: number
  pages: Array<{
    thumbnail?: { source: string; width: number; height: number }
    titles?: { display?: string }
  }>
}

/** Flattened item with category for tag display */
export interface OnThisDayDisplayItem extends OnThisDayItem {
  category: 'event' | 'birth' | 'death' | 'holiday' | 'selected'
}

/** Raw API response (type "all") */
interface WikipediaOnThisDayResponse {
  selected?: OnThisDayItem[]
  events?: OnThisDayItem[]
  births?: OnThisDayItem[]
  deaths?: OnThisDayItem[]
  holidays?: OnThisDayItem[]
}

const BASE_URL = 'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday'

/** API type parameter (path segment) */
export type OnThisDayApiType = 'all' | 'selected' | 'events' | 'births' | 'deaths' | 'holidays'

/**
 * Fetch "On this day" events for a given month/day and theme via TelemetryOS proxy (CORS-safe).
 * type: 'all' = all categories; otherwise only that category (births, deaths, events, etc.).
 */
export async function fetchOnThisDay(
  month: number,
  day: number,
  type: OnThisDayApiType = 'all'
): Promise<OnThisDayDisplayItem[]> {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  const url = `${BASE_URL}/${type}/${mm}/${dd}`

  const response = await proxy().fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'TelemetryOS-OnThisDay/1.0 (https://telemetryos.com)',
    },
  })

  if (!response.ok) {
    throw new Error(`On this day API error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as WikipediaOnThisDayResponse
  const result: OnThisDayDisplayItem[] = []

  const push = (items: OnThisDayItem[] | undefined, category: OnThisDayDisplayItem['category']) => {
    if (!items) return
    for (const item of items) {
      result.push({ ...item, category })
    }
  }

  if (type === 'all') {
    push(data.selected, 'selected')
    push(data.events, 'event')
    push(data.births, 'birth')
    push(data.deaths, 'death')
    push(data.holidays, 'holiday')
  } else {
    const map: Record<OnThisDayApiType, OnThisDayDisplayItem['category']> = {
      selected: 'selected',
      events: 'event',
      births: 'birth',
      deaths: 'death',
      holidays: 'holiday',
      all: 'event',
    }
    const category = map[type]
    const key = type as keyof WikipediaOnThisDayResponse
    push(data[key] as OnThisDayItem[] | undefined, category)
  }

  return result
}

/** Category label for UI tag */
export function getCategoryLabel(category: OnThisDayDisplayItem['category']): string {
  switch (category) {
    case 'selected':
      return 'Featured'
    case 'event':
      return 'History'
    case 'birth':
      return 'Births'
    case 'death':
      return 'Deaths'
    case 'holiday':
      return 'Holidays'
    default:
      return 'On this day'
  }
}

/** First image URL from event pages, or null */
export function getEventImageUrl(item: OnThisDayDisplayItem): string | null {
  for (const page of item.pages) {
    if (page.thumbnail?.source) return page.thumbnail.source
  }
  return null
}
