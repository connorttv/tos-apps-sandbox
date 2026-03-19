import {
  SettingsField,
  SettingsLabel,
  SettingsInputFrame,
  SettingsButtonFrame,
  SettingsBox,
  SettingsHeading,
  SettingsDivider,
  SettingsHint,
} from '@telemetryos/sdk/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRssFeedsStoreState } from '../../../hooks/store'
import { COMMON_CATEGORIES, DEFAULT_FEEDS } from '../../../types'
import type { RssFeed } from '../../../types'
import './RssFeedManager.css'

/**
 * RssFeedManager - Component for managing RSS feed URLs with accordion-style category grouping
 * 
 * Allows users to:
 * - Add new RSS feeds to specific categories
 * - Edit existing feeds
 * - Remove feeds
 * - Expand/collapse categories
 */
export function RssFeedManager() {
  const [isLoading, feeds, setFeeds] = useRssFeedsStoreState(250)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editLogoUrl, setEditLogoUrl] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Initialize with default feeds on first load if no feeds exist
  useEffect(() => {
    if (!isLoading && (!feeds || feeds.length === 0)) {
      console.log('Initializing with 14 pre-configured RSS feeds')
      setFeeds(DEFAULT_FEEDS)
    }
  }, [isLoading, feeds, setFeeds])

  const generateId = useCallback(() => {
    return `feed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  const handleAddToCategory = useCallback(
    (category: string) => {
      // Cancel any existing edit/add operation
      setEditingId(null)
      setAddingToCategory(category)
      setEditName('')
      setEditUrl('')
      setEditLogoUrl('')
      // Ensure category is expanded
      setExpandedCategories((prev) => new Set(prev).add(category))
    },
    []
  )

  const handleRemove = useCallback(
    (id: string) => {
      setFeeds(feeds.filter((feed) => feed.id !== id))
      if (editingId === id) {
        setEditingId(null)
        setEditName('')
        setEditUrl('')
        setEditLogoUrl('')
      }
    },
    [feeds, setFeeds, editingId]
  )

  const handleStartEdit = useCallback(
    (feed: RssFeed) => {
      // Cancel any existing add operation
      setAddingToCategory(null)
      setEditingId(feed.id)
      setEditName(feed.name)
      setEditUrl(feed.url)
      setEditLogoUrl(feed.logoUrl || '')
      // Ensure category is expanded
      setExpandedCategories((prev) => new Set(prev).add(feed.category))
    },
    []
  )

  const handleSaveEdit = useCallback(() => {
    if (!editingId && !addingToCategory) return

    if (addingToCategory) {
      // Creating a new feed
      const newFeed: RssFeed = {
        id: generateId(),
        name: editName.trim(),
        url: editUrl.trim(),
        category: addingToCategory,
        logoUrl: editLogoUrl.trim() || undefined,
      }
      setFeeds([...feeds, newFeed])
      setAddingToCategory(null)
    } else if (editingId) {
      // Updating existing feed
      const updatedFeeds = feeds.map((feed) =>
        feed.id === editingId
          ? {
              ...feed,
              name: editName.trim(),
              url: editUrl.trim(),
              logoUrl: editLogoUrl.trim() || undefined,
            }
          : feed
      )
      setFeeds(updatedFeeds)
      setEditingId(null)
    }

    // Reset form
    setEditName('')
    setEditUrl('')
    setEditLogoUrl('')
  }, [editingId, addingToCategory, editName, editUrl, editLogoUrl, feeds, setFeeds, generateId])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setAddingToCategory(null)
    setEditName('')
    setEditUrl('')
    setEditLogoUrl('')
  }, [])

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

  // Get all categories (both from feeds and common categories)
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>()
    // Add all categories from feeds
    feeds.forEach((feed) => {
      categorySet.add(feed.category || 'Other')
    })
    // Add common categories
    COMMON_CATEGORIES.forEach((cat) => categorySet.add(cat))
    return Array.from(categorySet).sort()
  }, [feeds])

  return (
    <>
      <SettingsHeading>RSS Feeds</SettingsHeading>
      <SettingsHint>
        Click on a category to expand and manage feeds. Add feeds directly to each category.
      </SettingsHint>

      {/* Category Accordions */}
      {allCategories.map((category) => {
        const categoryFeeds = feedsByCategory[category] || []
        const isExpanded = expandedCategories.has(category)
        const hasFeeds = categoryFeeds.length > 0

        return (
          <div key={category} className="category-accordion">
            <div
              className="category-header"
              onClick={() => toggleCategory(category)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleCategory(category)
                }
              }}
            >
              <div className="category-header-content">
                <span className="category-title">{category}</span>
                <span className="category-count">
                  ({categoryFeeds.length} {categoryFeeds.length === 1 ? 'feed' : 'feeds'})
                </span>
              </div>
              <span className={`category-toggle ${isExpanded ? 'expanded' : ''}`}>▼</span>
            </div>

            <div className={`category-content ${isExpanded ? 'expanded' : ''}`}>
              <div className="category-feeds">
                {categoryFeeds.map((feed) => {
                  const isEditing = editingId === feed.id

                  return (
                    <div key={feed.id} className="feed-item">
                      {isEditing ? (
                        <>
                          <SettingsField>
                            <SettingsLabel>Feed Name</SettingsLabel>
                            <SettingsInputFrame>
                              <input
                                type="text"
                                placeholder="e.g., BBC News"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                disabled={isLoading}
                              />
                            </SettingsInputFrame>
                          </SettingsField>

                          <SettingsField>
                            <SettingsLabel>Feed URL</SettingsLabel>
                            <SettingsInputFrame>
                              <input
                                type="url"
                                placeholder="https://example.com/feed.xml"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                disabled={isLoading}
                              />
                            </SettingsInputFrame>
                          </SettingsField>

                          <SettingsField>
                            <SettingsLabel>Logo URL (Optional)</SettingsLabel>
                            <SettingsInputFrame>
                              <input
                                type="url"
                                placeholder="https://example.com/logo.png"
                                value={editLogoUrl}
                                onChange={(e) => setEditLogoUrl(e.target.value)}
                                disabled={isLoading}
                              />
                            </SettingsInputFrame>
                            <SettingsHint>
                              URL to the feed's logo or brand image
                            </SettingsHint>
                          </SettingsField>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <SettingsButtonFrame>
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={
                                  isLoading ||
                                  !editName.trim() ||
                                  !editUrl.trim()
                                }
                              >
                                Save
                              </button>
                            </SettingsButtonFrame>
                            <SettingsButtonFrame>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isLoading}
                              >
                                Cancel
                              </button>
                            </SettingsButtonFrame>
                            <SettingsButtonFrame>
                              <button
                                type="button"
                                onClick={() => handleRemove(feed.id)}
                                disabled={isLoading}
                              >
                                Remove
                              </button>
                            </SettingsButtonFrame>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="feed-header">
                            <div className="feed-name">{feed.name || '(Unnamed Feed)'}</div>
                            <div className="feed-actions">
                              <SettingsButtonFrame>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(feed)}
                                  disabled={isLoading}
                                >
                                  Edit
                                </button>
                              </SettingsButtonFrame>
                              <SettingsButtonFrame>
                                <button
                                  type="button"
                                  onClick={() => handleRemove(feed.id)}
                                  disabled={isLoading}
                                >
                                  Remove
                                </button>
                              </SettingsButtonFrame>
                            </div>
                          </div>
                          <div className="feed-url">{feed.url || '(No URL)'}</div>
                          {feed.logoUrl && (
                            <div className="feed-logo-url">Logo: {feed.logoUrl}</div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}

                {/* Add Feed Form - shown when adding to this category */}
                {addingToCategory === category && (
                  <div className="feed-item">
                    <SettingsField>
                      <SettingsLabel>Feed Name</SettingsLabel>
                      <SettingsInputFrame>
                        <input
                          type="text"
                          placeholder="e.g., BBC News"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={isLoading}
                        />
                      </SettingsInputFrame>
                    </SettingsField>

                    <SettingsField>
                      <SettingsLabel>Feed URL</SettingsLabel>
                      <SettingsInputFrame>
                        <input
                          type="url"
                          placeholder="https://example.com/feed.xml"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          disabled={isLoading}
                        />
                      </SettingsInputFrame>
                    </SettingsField>

                    <SettingsField>
                      <SettingsLabel>Logo URL (Optional)</SettingsLabel>
                      <SettingsInputFrame>
                        <input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={editLogoUrl}
                          onChange={(e) => setEditLogoUrl(e.target.value)}
                          disabled={isLoading}
                        />
                      </SettingsInputFrame>
                      <SettingsHint>
                        URL to the feed's logo or brand image
                      </SettingsHint>
                    </SettingsField>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <SettingsButtonFrame>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={
                            isLoading ||
                            !editName.trim() ||
                            !editUrl.trim()
                          }
                        >
                          Save
                        </button>
                      </SettingsButtonFrame>
                      <SettingsButtonFrame>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </SettingsButtonFrame>
                    </div>
                  </div>
                )}

                {/* Add Feed Button for this category */}
                {addingToCategory !== category && (
                  <SettingsField>
                    <SettingsButtonFrame>
                      <button
                        type="button"
                        onClick={() => handleAddToCategory(category)}
                        disabled={isLoading || addingToCategory !== null}
                      >
                        + Add Feed to {category}
                      </button>
                    </SettingsButtonFrame>
                  </SettingsField>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Add New Category Button */}
      <SettingsDivider />
      {/* <SettingsField>
        <SettingsLabel>Add New Category</SettingsLabel>
        <SettingsButtonFrame>
          <button
            type="button"
            onClick={() => {
              const newCategory = prompt('Enter category name:')
              if (newCategory && newCategory.trim()) {
                handleAddToCategory(newCategory.trim())
              }
            }}
            disabled={isLoading}
          >
            + Add New Category
          </button>
        </SettingsButtonFrame>
        <SettingsHint>
          Create a new category and add your first feed to it
        </SettingsHint>
      </SettingsField> */}
    </>
  )
}
