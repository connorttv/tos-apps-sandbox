/**
 * Bloomberg RSS Feed Mapper
 * 
 * Specialized parser for Bloomberg RSS feeds with enhanced image extraction
 * Handles media:content namespace elements and channel logo extraction
 */

/**
 * Parse Bloomberg RSS feed XML and extract articles
 * @param {string} xmlText - Raw RSS XML text
 * @param {string} sourceId - Source feed ID (should be 'bloomberg')
 * @param {string} sourceLogoUrl - Optional source logo URL (overrides channel image)
 * @returns {Array} Array of normalized Article objects
 */
export function parseBloombergFeed(xmlText, sourceId, sourceLogoUrl) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error('Bloomberg RSS parsing error: ' + parseError.textContent)
    }

    // Extract channel image URL if no sourceLogoUrl provided
    // Bloomberg feeds have <channel><image><url> for the feed logo
    let feedLogoUrl = sourceLogoUrl
    if (!feedLogoUrl) {
      const channelImage = doc.querySelector('channel > image > url')
      if (channelImage) {
        feedLogoUrl = channelImage.textContent?.trim()
      }
    }

    const items = doc.querySelectorAll('item')
    const articles = []

    // Media RSS namespace for Bloomberg feeds
    const mediaNS = 'http://search.yahoo.com/mrss/'

    for (const item of items) {
      try {
        const title = item.querySelector('title')?.textContent?.trim()
        const description = item.querySelector('description')?.textContent?.trim() ||
                          item.querySelector('summary')?.textContent?.trim() ||
                          item.querySelector('content\\:encoded')?.textContent?.trim()
        const link = item.querySelector('link')?.textContent?.trim()
        const pubDate = item.querySelector('pubDate')?.textContent?.trim()
        
        // Extract article image from Bloomberg RSS patterns
        // Bloomberg uses media:content with url attribute and type="image/jpeg"
        let imageUrl = null
        
        // Primary method: Use namespace-aware method for media:content
        const mediaContents = item.getElementsByTagNameNS(mediaNS, 'content')
        for (let i = 0; i < mediaContents.length; i++) {
          const type = mediaContents[i].getAttribute('type') || ''
          if (type.startsWith('image/')) {
            imageUrl = mediaContents[i].getAttribute('url')
            break
          }
        }
        
        // Fallback to querySelector
        if (!imageUrl) {
          const mediaContent = item.querySelector('media\\:content[type^="image"]')
          if (mediaContent) {
            imageUrl = mediaContent.getAttribute('url')
          }
        }
        
        // Try media:thumbnail as fallback
        if (!imageUrl) {
          const thumbnails = item.getElementsByTagNameNS(mediaNS, 'thumbnail')
          if (thumbnails.length > 0) {
            imageUrl = thumbnails[0].getAttribute('url')
          }
        }
        
        // Try querySelector for thumbnail
        if (!imageUrl) {
          const mediaThumbnail = item.querySelector('media\\:thumbnail')
          if (mediaThumbnail) {
            imageUrl = mediaThumbnail.getAttribute('url')
          }
        }
        
        // Try enclosure as fallback
        if (!imageUrl) {
          imageUrl = item.querySelector('enclosure[type^="image"]')?.getAttribute('url')
        }
        
        // If no image found, try extracting from description HTML
        if (!imageUrl && description) {
          try {
            const htmlParser = new DOMParser()
            const descDoc = htmlParser.parseFromString(`<div>${description}</div>`, 'text/html')
            const descImg = descDoc.querySelector('img')
            if (descImg) {
              imageUrl = descImg.getAttribute('src')
            }
          } catch (e) {
            // If HTML parsing fails, continue without image
          }
        }

        // Skip articles missing required fields: headline (title) or description
        if (!title || title.length === 0 || !description || description.length === 0) {
          continue
        }

        // Parse publication date
        let publishedAt = Date.now()
        if (pubDate) {
          const parsedDate = new Date(pubDate)
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate.getTime()
          }
        }

        // Truncate overly long text
        const truncatedTitle = title.length > 200 ? title.substring(0, 197) + '...' : title
        const truncatedDescription = description.length > 500 ? description.substring(0, 497) + '...' : description

        articles.push({
          title: truncatedTitle,
          description: truncatedDescription,
          link,
          publishedAt,
          sourceId,
          imageUrl: imageUrl || undefined,
          sourceLogoUrl: feedLogoUrl || undefined,
        })
      } catch (itemError) {
        // Skip malformed items, continue with others
        console.warn(`Failed to parse Bloomberg RSS item for ${sourceId}:`, itemError)
        continue
      }
    }

    return articles
  } catch (error) {
    throw new Error(`Bloomberg RSS feed parsing failed for ${sourceId}: ${error.message}`)
  }
}
