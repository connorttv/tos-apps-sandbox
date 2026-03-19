/**
 * RSS Feed Mapper
 * 
 * Parses RSS 2.0 XML format and normalizes items to Article format
 */

/**
 * Parse RSS feed XML and extract articles
 * @param {string} xmlText - Raw RSS XML text
 * @param {string} sourceId - Source feed ID
 * @param {string} sourceLogoUrl - Optional source logo URL
 * @returns {Array} Array of normalized Article objects
 */
export function parseRssFeed(xmlText, sourceId, sourceLogoUrl) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error('RSS parsing error: ' + parseError.textContent)
    }

    // Extract channel image URL if no sourceLogoUrl provided
    // RSS feeds can have <channel><image><url> for the feed logo
    let feedLogoUrl = sourceLogoUrl
    if (!feedLogoUrl) {
      const channelImage = doc.querySelector('channel > image > url')
      if (channelImage) {
        feedLogoUrl = channelImage.textContent?.trim()
      }
    }

    const items = doc.querySelectorAll('item')
    const articles = []

    for (const item of items) {
      try {
        const title = item.querySelector('title')?.textContent?.trim()
        const description = item.querySelector('description')?.textContent?.trim() ||
                          item.querySelector('summary')?.textContent?.trim() ||
                          item.querySelector('content\\:encoded')?.textContent?.trim()
        const link = item.querySelector('link')?.textContent?.trim()
        const pubDate = item.querySelector('pubDate')?.textContent?.trim()
        
        // Extract article image from various RSS patterns
        let imageUrl = item.querySelector('enclosure[type^="image"]')?.getAttribute('url') ||
                       item.querySelector('media\\:content[type^="image"]')?.getAttribute('url') ||
                       item.querySelector('media\\:thumbnail')?.getAttribute('url') ||
                       item.querySelector('image')?.getAttribute('url')
        
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
        console.warn(`Failed to parse RSS item for ${sourceId}:`, itemError)
        continue
      }
    }

    return articles
  } catch (error) {
    throw new Error(`RSS feed parsing failed for ${sourceId}: ${error.message}`)
  }
}
