/**
 * BBC News RSS Feed Mapper
 * 
 * Specialized parser for BBC News RSS feeds with enhanced image extraction
 * Handles media:thumbnail namespace elements and channel logo extraction
 */

/**
 * Parse BBC News RSS feed XML and extract articles
 * @param {string} xmlText - Raw RSS XML text
 * @param {string} sourceId - Source feed ID (should be 'bbc-news')
 * @param {string} sourceLogoUrl - Optional source logo URL (overrides channel image)
 * @returns {Array} Array of normalized Article objects
 */
export function parseBbcFeed(xmlText, sourceId, sourceLogoUrl) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error('BBC RSS parsing error: ' + parseError.textContent)
    }

    // Extract channel image URL if no sourceLogoUrl provided
    // BBC feeds have <channel><image><url> for the feed logo
    let feedLogoUrl = sourceLogoUrl
    if (!feedLogoUrl) {
      const channelImage = doc.querySelector('channel > image > url')
      if (channelImage) {
        feedLogoUrl = channelImage.textContent?.trim()
      }
    }

    const items = doc.querySelectorAll('item')
    const articles = []

    // Media RSS namespace for BBC feeds
    const mediaNS = 'http://search.yahoo.com/mrss/'

    for (const item of items) {
      try {
        const title = item.querySelector('title')?.textContent?.trim()
        const description = item.querySelector('description')?.textContent?.trim() ||
                          item.querySelector('summary')?.textContent?.trim() ||
                          item.querySelector('content\\:encoded')?.textContent?.trim()
        const link = item.querySelector('link')?.textContent?.trim()
        const pubDate = item.querySelector('pubDate')?.textContent?.trim()
        
        // Extract article image from BBC RSS patterns
        // BBC uses media:thumbnail with url attribute
        let imageUrl = null
        
        // Primary method: Use namespace-aware method for media:thumbnail
        const thumbnails = item.getElementsByTagNameNS(mediaNS, 'thumbnail')
        if (thumbnails.length > 0) {
          imageUrl = thumbnails[0].getAttribute('url')
        }
        
        // Fallback to querySelector (works in some parsers)
        if (!imageUrl) {
          const mediaThumbnail = item.querySelector('media\\:thumbnail')
          if (mediaThumbnail) {
            imageUrl = mediaThumbnail.getAttribute('url')
          }
        }
        
        // Try media:content for images
        if (!imageUrl) {
          const mediaContents = item.getElementsByTagNameNS(mediaNS, 'content')
          for (let i = 0; i < mediaContents.length; i++) {
            const type = mediaContents[i].getAttribute('type') || ''
            if (type.startsWith('image')) {
              imageUrl = mediaContents[i].getAttribute('url')
              break
            }
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
        console.warn(`Failed to parse BBC RSS item for ${sourceId}:`, itemError)
        continue
      }
    }

    return articles
  } catch (error) {
    throw new Error(`BBC RSS feed parsing failed for ${sourceId}: ${error.message}`)
  }
}
