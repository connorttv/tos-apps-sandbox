/**
 * Atom Feed Mapper
 * 
 * Parses Atom XML format and normalizes entries to Article format
 */

/**
 * Parse Atom feed XML and extract articles
 * @param {string} xmlText - Raw Atom XML text
 * @param {string} sourceId - Source feed ID
 * @param {string} sourceLogoUrl - Optional source logo URL
 * @returns {Array} Array of normalized Article objects
 */
export function parseAtomFeed(xmlText, sourceId, sourceLogoUrl) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error('Atom parsing error: ' + parseError.textContent)
    }

    const entries = doc.querySelectorAll('entry')
    const articles = []

    for (const entry of entries) {
      try {
        const title = entry.querySelector('title')?.textContent?.trim()
        const summary = entry.querySelector('summary')?.textContent?.trim() ||
                       entry.querySelector('content')?.textContent?.trim()
        const linkElement = entry.querySelector('link[rel="alternate"], link')
        const link = linkElement?.getAttribute('href') || linkElement?.textContent?.trim()
        const updated = entry.querySelector('updated')?.textContent?.trim() ||
                        entry.querySelector('published')?.textContent?.trim()
        
        // Try to find image in content or media
        const imageUrl = entry.querySelector('media\\:thumbnail')?.getAttribute('url') ||
                        entry.querySelector('media\\:content[type^="image"]')?.getAttribute('url') ||
                        entry.querySelector('enclosure[type^="image"]')?.getAttribute('url')

        // Skip articles missing required fields: headline (title) or description
        if (!title || title.length === 0 || !summary || summary.length === 0) {
          continue
        }

        // Parse publication date
        let publishedAt = Date.now()
        if (updated) {
          const parsedDate = new Date(updated)
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate.getTime()
          }
        }

        // Truncate overly long text
        const truncatedTitle = title.length > 200 ? title.substring(0, 197) + '...' : title
        const truncatedDescription = summary.length > 500 ? summary.substring(0, 497) + '...' : summary

        articles.push({
          title: truncatedTitle,
          description: truncatedDescription,
          link,
          publishedAt,
          sourceId,
          imageUrl: imageUrl || undefined,
          sourceLogoUrl: sourceLogoUrl || undefined,
        })
      } catch (entryError) {
        // Skip malformed entries, continue with others
        console.warn(`Failed to parse Atom entry for ${sourceId}:`, entryError)
        continue
      }
    }

    return articles
  } catch (error) {
    throw new Error(`Atom feed parsing failed for ${sourceId}: ${error.message}`)
  }
}
