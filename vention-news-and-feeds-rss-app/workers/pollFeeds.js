import { configure, store, proxy } from '@telemetryos/sdk'
import { parseFeed } from './feedMapper/index.js'

// Configure SDK - REQUIRED for workers to function
configure('telemetryos-rss-app')

const FETCH_TIMEOUT_MS = 30000 // 30 seconds
const DEFAULT_REFRESH_INTERVAL_MIN = 15

/**
 * Fetch a single feed and parse articles
 * @param {Object} feed - Feed object with id, url, name, logoUrl
 * @returns {Promise<Array>} Array of parsed articles
 */
async function fetchFeed(feed) {
  try {
    console.log(`Fetching feed: ${feed.name} (${feed.id})`)

    // Fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const response = await proxy().fetch(feed.url, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const xmlText = await response.text()

      if (!xmlText || xmlText.trim().length === 0) {
        throw new Error('Empty response from feed')
      }

      // Parse feed and normalize articles
      const articles = parseFeed(xmlText, feed.id, feed.logoUrl)

      console.log(`Successfully parsed ${articles.length} articles from ${feed.name}`)
      return articles
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    // Log error but don't throw - continue with other feeds
    console.warn(`Failed to fetch feed ${feed.name} (${feed.id}):`, error.message)
    return []
  }
}

/**
 * Fetch all selected feeds and update cached articles
 */
async function pollFeeds() {
  try {
    console.log('Starting feed poll...')

    // Get feeds and selected feeds from storage
    const feeds = await store().instance.get('rssFeeds', [])
    const selectedFeeds = await store().instance.get('selectedFeeds', [])

    if (!feeds || feeds.length === 0) {
      console.log('No feeds configured')
      return
    }

    if (!selectedFeeds || selectedFeeds.length === 0) {
      console.log('No feeds selected')
      return
    }

    // Filter to only selected feeds
    const feedsToPoll = feeds.filter((feed) => selectedFeeds.includes(feed.id))

    if (feedsToPoll.length === 0) {
      console.log('No selected feeds to poll')
      return
    }

    console.log(`Polling ${feedsToPoll.length} selected feed(s)...`)

    // Fetch all feeds in parallel (with error handling per feed)
    const articleArrays = await Promise.all(
      feedsToPoll.map((feed) => fetchFeed(feed))
    )

    // Count successful vs failed feeds
    const successfulFeeds = articleArrays.filter((articles) => articles.length > 0).length
    const allFeedsFailed = successfulFeeds === 0 && feedsToPoll.length > 0

    // Flatten and merge all articles
    const allArticles = articleArrays.flat()

    // Deduplicate articles by link (same article from different feeds or duplicates)
    const uniqueArticlesMap = new Map()
    allArticles.forEach((article) => {
      // Use link as unique identifier
      if (article.link && !uniqueArticlesMap.has(article.link)) {
        uniqueArticlesMap.set(article.link, article)
      } else if (article.link && uniqueArticlesMap.has(article.link)) {
        // If duplicate found, keep the one with the most recent publishedAt
        const existing = uniqueArticlesMap.get(article.link)
        if (article.publishedAt > existing.publishedAt) {
          uniqueArticlesMap.set(article.link, article)
        }
      }
    })

    // Convert map back to array
    const uniqueArticles = Array.from(uniqueArticlesMap.values())

    // Sort by publication date (newest first)
    uniqueArticles.sort((a, b) => b.publishedAt - a.publishedAt)

    // Log deduplication stats
    if (allArticles.length > uniqueArticles.length) {
      console.log(`Deduplicated ${allArticles.length - uniqueArticles.length} duplicate article(s) (${allArticles.length} → ${uniqueArticles.length})`)
    }

    // Log articles with images for debugging
    const articlesWithImages = uniqueArticles.filter((article) => article.imageUrl)
    if (articlesWithImages.length > 0) {
      console.log(`Found ${articlesWithImages.length} article(s) with images:`)
      articlesWithImages.forEach((article) => {
        console.log(`  - "${article.title}" (${article.sourceId}): ${article.imageUrl}`)
      })
    } else {
      console.log('No articles with images found in this poll')
    }

    // Update cached articles in storage (even if empty, keep old articles)
    const existingArticles = await store().instance.get('cachedArticles', [])
    if (uniqueArticles.length > 0) {
      await store().instance.set('cachedArticles', uniqueArticles)
    }

    const now = Date.now()
    await store().instance.set('lastUpdatedAt', now)

    // Set offline status ONLY if all feeds failed
    // If at least one feed succeeds, we're online (even if some feeds failed)
    const isOffline = allFeedsFailed
    await store().instance.set('isOffline', isOffline)

  } catch (error) {
    console.error('Error during feed poll:', error)
    // Don't throw - allow polling to continue on next interval
  }
}

/**
 * Start polling feeds at configured interval
 */
async function startPolling() {
  // Initial poll
  await pollFeeds()

  // Set up interval polling
  let intervalId = null

  const scheduleNextPoll = async () => {
    try {
      // Get refresh interval from storage (default 15 minutes)
      const refreshIntervalMin = await store().instance.get('refreshIntervalMin', DEFAULT_REFRESH_INTERVAL_MIN)
      const intervalMs = refreshIntervalMin * 60 * 1000

      // Clear existing interval if any
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }

      // Set up new interval
      intervalId = setInterval(async () => {
        await pollFeeds()
      }, intervalMs)

      console.log(`Feed polling scheduled every ${refreshIntervalMin} minutes`)
    } catch (error) {
      console.error('Error scheduling feed poll:', error)
      // Retry with default interval
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      intervalId = setInterval(async () => {
        await pollFeeds()
      }, DEFAULT_REFRESH_INTERVAL_MIN * 60 * 1000)
    }
  }

  // Schedule initial interval
  await scheduleNextPoll()

  // Subscribe to selectedFeeds changes - trigger immediate poll when feeds are selected/deselected
  const selectedFeedsHandler = async (newSelectedFeeds) => {
    console.log('Selected feeds changed, triggering immediate poll...')
    await pollFeeds()
  }

  store().instance.subscribe('selectedFeeds', selectedFeedsHandler)

  // Subscribe to refreshIntervalMin changes - update polling interval
  const refreshIntervalHandler = async (newInterval) => {
    console.log(`Refresh interval changed to ${newInterval} minutes, updating schedule...`)
    await scheduleNextPoll()
  }

  store().instance.subscribe('refreshIntervalMin', refreshIntervalHandler)

  console.log('Subscribed to storage changes for selectedFeeds and refreshIntervalMin')
}

// Start polling
startPolling().catch((error) => {
  console.error('Failed to start feed polling:', error)
})

console.log('Feed polling worker initialized')
