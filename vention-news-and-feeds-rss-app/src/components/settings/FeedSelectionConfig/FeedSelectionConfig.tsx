import {
  SettingsField,
  SettingsLabel,
  SettingsButtonFrame,
  SettingsHeading,
  SettingsDivider,
  SettingsHint,
  SettingsSliderFrame,
  SettingsSelectFrame,
  SettingsCheckboxFrame,
  SettingsCheckboxLabel,
  SettingsBox,
  SettingsInputFrame,
} from '@telemetryos/sdk/react'
import { useCallback, useMemo, useState } from 'react'
import {
  useRssFeedsStoreState,
  useSelectedFeedsStoreState,
  useArticleDurationStoreState,
  useRefreshIntervalStoreState,
  useTransitionStyleStoreState,
} from '../../../hooks/store'
import { TRANSITION_STYLES } from '../../../types/config'
import type { RssFeed } from '../../../types'
import './FeedSelectionConfig.css'

/**
 * FeedSelectionConfig - Component for selecting active feeds and configuring app settings
 * 
 * Features:
 * - Checkbox selection of feeds organized by category
 * - Select All / Deselect All controls
 * - Article duration slider (5-60 seconds)
 * - Feed refresh interval slider (5-60 minutes)
 * - Transition style selection
 */
export function FeedSelectionConfig() {
  const [isLoadingFeeds, feeds] = useRssFeedsStoreState(0)
  const [isLoadingSelected, selectedFeeds, setSelectedFeeds] = useSelectedFeedsStoreState(0)
  const [isLoadingDuration, articleDurationSec, setArticleDurationSec] = useArticleDurationStoreState(5)
  const [isLoadingInterval, refreshIntervalMin, setRefreshIntervalMin] = useRefreshIntervalStoreState(5)
  const [isLoadingTransition, transitionStyle, setTransitionStyle] = useTransitionStyleStoreState(0)
  const [categoryFilter, setCategoryFilter] = useState('')

  const isLoading = isLoadingFeeds || isLoadingSelected || isLoadingDuration || isLoadingInterval || isLoadingTransition

  // Group feeds by category
  const feedsByCategory = useMemo(() => {
    const grouped: Record<string, RssFeed[]> = {}
    feeds.forEach((feed) => {
      const category = feed.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(feed)
    })
    // Sort categories alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key]
        return acc
      }, {} as Record<string, RssFeed[]>)
  }, [feeds])

  // Filter categories based on filter text
  const filteredCategories = useMemo(() => {
    if (!categoryFilter.trim()) {
      return feedsByCategory
    }

    const filterLower = categoryFilter.toLowerCase().trim()
    const filtered: Record<string, RssFeed[]> = {}

    Object.entries(feedsByCategory).forEach(([category, categoryFeeds]) => {
      // Show category if category name matches OR any feed name matches
      const categoryMatches = category.toLowerCase().includes(filterLower)
      const feedMatches = categoryFeeds.some((feed) =>
        feed.name.toLowerCase().includes(filterLower)
      )

      if (categoryMatches || feedMatches) {
        filtered[category] = categoryFeeds
      }
    })

    return filtered
  }, [feedsByCategory, categoryFilter])

  // Get all feed IDs
  const allFeedIds = useMemo(() => feeds.map((feed) => feed.id), [feeds])

  // Check if all feeds are selected
  const allSelected = useMemo(() => {
    return allFeedIds.length > 0 && allFeedIds.every((id) => selectedFeeds.includes(id))
  }, [allFeedIds, selectedFeeds])

  // Toggle individual feed selection
  const toggleFeed = useCallback(
    (feedId: string) => {
      if (selectedFeeds.includes(feedId)) {
        setSelectedFeeds(selectedFeeds.filter((id) => id !== feedId))
      } else {
        setSelectedFeeds([...selectedFeeds, feedId])
      }
    },
    [selectedFeeds, setSelectedFeeds]
  )

  // Select all feeds
  const handleSelectAll = useCallback(() => {
    setSelectedFeeds([...allFeedIds])
  }, [allFeedIds, setSelectedFeeds])

  // Deselect all feeds
  const handleDeselectAll = useCallback(() => {
    setSelectedFeeds([])
  }, [setSelectedFeeds])

  return (
    <>
      <SettingsHeading>Feed Selection & Configuration</SettingsHeading>
      <SettingsHint>
        Select which feeds to display and configure article rotation settings.
      </SettingsHint>

      {/* Select All / Deselect All and Category Filter */}
      <SettingsField>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <SettingsButtonFrame>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={isLoading || allFeedIds.length === 0 || allSelected}
            >
              Select All
            </button>
          </SettingsButtonFrame>
          <SettingsButtonFrame>
            <button
              type="button"
              onClick={handleDeselectAll}
              disabled={isLoading || selectedFeeds.length === 0}
            >
              Deselect All
            </button>
          </SettingsButtonFrame>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <SettingsInputFrame>
              <input
                type="text"
                placeholder="Filter by category or feed name..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={isLoading}
              />
            </SettingsInputFrame>
          </div>
        </div>
      </SettingsField>

      {/* Feed Selection by Category */}
      {Object.keys(feedsByCategory).length > 0 ? (
        <>
          {Object.keys(filteredCategories).length > 0 ? (
            Object.entries(filteredCategories).map(([category, categoryFeeds]) => (
            <div key={category} className="feed-selection-category">
              <SettingsHeading>
                {category}
              </SettingsHeading>
              <SettingsBox>
                {categoryFeeds.map((feed) => {
                  const isSelected = selectedFeeds.includes(feed.id)

                  return (
                    <SettingsField key={feed.id}>
                      <SettingsCheckboxFrame>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFeed(feed.id)}
                          disabled={isLoading}
                        />
                        <SettingsCheckboxLabel>
                          {feed.name || '(Unnamed Feed)'}
                        </SettingsCheckboxLabel>
                      </SettingsCheckboxFrame>
                    </SettingsField>
                  )
                })}
              </SettingsBox>
            </div>
            ))
          ) : (
            <SettingsHint>
              {categoryFilter.trim()
                ? `No categories or feeds match "${categoryFilter}"`
                : 'No feeds available. Add feeds in the RSS Feeds section above.'}
            </SettingsHint>
          )}
        </>
      ) : (
        <SettingsHint>No feeds available. Add feeds in the RSS Feeds section above.</SettingsHint>
      )}

      <SettingsDivider />

      {/* Article Duration */}
      <SettingsField>
        <SettingsLabel>Article Duration</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min={5}
            max={60}
            step={1}
            value={articleDurationSec}
            onChange={(e) => setArticleDurationSec(parseInt(e.target.value, 10))}
            disabled={isLoadingDuration}
          />
          <span>{articleDurationSec}s</span>
        </SettingsSliderFrame>
        <SettingsHint>How long each article is displayed (5-60 seconds)</SettingsHint>
      </SettingsField>

      <SettingsDivider />

      {/* Refresh Interval */}
      <SettingsField>
        <SettingsLabel>Feed Refresh Interval</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min={5}
            max={60}
            step={1}
            value={refreshIntervalMin}
            onChange={(e) => setRefreshIntervalMin(parseInt(e.target.value, 10))}
            disabled={isLoadingInterval}
          />
          <span>{refreshIntervalMin} min</span>
        </SettingsSliderFrame>
        <SettingsHint>How often to refresh feeds (5-60 minutes)</SettingsHint>
      </SettingsField>

      <SettingsDivider />

      {/* Transition Style */}
      <SettingsField>
        <SettingsLabel>Transition Style</SettingsLabel>
        <SettingsSelectFrame>
          <select
            value={transitionStyle}
            onChange={(e) => setTransitionStyle(e.target.value as typeof transitionStyle)}
            disabled={isLoadingTransition}
          >
            {TRANSITION_STYLES.map((style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </SettingsSelectFrame>
        <SettingsHint>Animation style when transitioning between articles</SettingsHint>
      </SettingsField>
    </>
  )
}
