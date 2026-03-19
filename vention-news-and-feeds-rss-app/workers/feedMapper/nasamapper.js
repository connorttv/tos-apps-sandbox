/**
 * NASA RSS Feed Mapper
 * 
 * Specialized parser for NASA RSS feeds with enhanced image extraction
 * Handles content:encoded HTML, media:content, and media:thumbnail namespace elements
 */

/**
 * Parse NASA RSS feed XML and extract articles
 * @param {string} xmlText - Raw RSS XML text
 * @param {string} sourceId - Source feed ID (should be 'nasa')
 * @param {string} sourceLogoUrl - Optional source logo URL (overrides channel image)
 * @returns {Array} Array of normalized Article objects
 */
export function parseNasaFeed(xmlText, sourceId, sourceLogoUrl) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error('NASA RSS parsing error: ' + parseError.textContent)
    }

    // Extract channel image URL if no sourceLogoUrl provided
    // NASA feeds may have <channel><image><url> for the feed logo
    let feedLogoUrl = sourceLogoUrl
    if (!feedLogoUrl) {
      const channelImage = doc.querySelector('channel > image > url')
      if (channelImage) {
        feedLogoUrl = channelImage.textContent?.trim()
      }
    }

    const items = doc.querySelectorAll('item')
    const articles = []

    // Media RSS namespace for NASA feeds
    const mediaNS = 'http://search.yahoo.com/mrss/'
    // Content namespace
    const contentNS = 'http://purl.org/rss/1.0/modules/content/'

    for (const item of items) {
      try {
        const title = item.querySelector('title')?.textContent?.trim()
        const description = item.querySelector('description')?.textContent?.trim() ||
                          item.querySelector('summary')?.textContent?.trim()
        const link = item.querySelector('link')?.textContent?.trim()
        const pubDate = item.querySelector('pubDate')?.textContent?.trim()
        
        // Extract article image from NASA RSS patterns
        // NASA uses multiple patterns: content:encoded HTML, media:content, media:thumbnail
        let imageUrl = null
        
        // Primary method: Extract from content:encoded HTML
        const contentEncoded = item.querySelector('content\\:encoded')?.textContent?.trim()
        if (contentEncoded) {
          try {
            const htmlParser = new DOMParser()
            const contentDoc = htmlParser.parseFromString(`<div>${contentEncoded}</div>`, 'text/html')
            const img = contentDoc.querySelector('img')
            if (img) {
              imageUrl = img.getAttribute('src')
              // Clean up URL parameters if needed (remove query params that might break the URL)
              if (imageUrl) {
                // Decode HTML entities
                imageUrl = imageUrl.replace(/&#038;/g, '&').replace(/&amp;/g, '&')
              }
            }
          } catch (e) {
            // If HTML parsing fails, continue with other methods
          }
        }
        
        // Fallback: Try media:thumbnail
        if (!imageUrl) {
          const thumbnails = item.getElementsByTagNameNS(mediaNS, 'thumbnail')
          if (thumbnails.length > 0) {
            imageUrl = thumbnails[0].getAttribute('url')
          }
        }
        
        // Fallback: Try querySelector for thumbnail
        if (!imageUrl) {
          const mediaThumbnail = item.querySelector('media\\:thumbnail')
          if (mediaThumbnail) {
            imageUrl = mediaThumbnail.getAttribute('url')
          }
        }
        
        // Fallback: Try media:content with thumbnail inside
        if (!imageUrl) {
          const mediaContents = item.getElementsByTagNameNS(mediaNS, 'content')
          for (let i = 0; i < mediaContents.length; i++) {
            const medium = mediaContents[i].getAttribute('medium')
            if (medium === 'image') {
              imageUrl = mediaContents[i].getAttribute('url')
              break
            }
            // Check for nested thumbnail
            const nestedThumbnail = mediaContents[i].querySelector('media\\:thumbnail')
            if (nestedThumbnail) {
              imageUrl = nestedThumbnail.getAttribute('url')
              break
            }
          }
        }
        
        // Fallback: Try description HTML
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
        
        // Fallback: Try enclosure
        if (!imageUrl) {
          imageUrl = item.querySelector('enclosure[type^="image"]')?.getAttribute('url')
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
        console.warn(`Failed to parse NASA RSS item for ${sourceId}:`, itemError)
        continue
      }
    }

    return articles
  } catch (error) {
    throw new Error(`NASA RSS feed parsing failed for ${sourceId}: ${error.message}`)
  }
}
