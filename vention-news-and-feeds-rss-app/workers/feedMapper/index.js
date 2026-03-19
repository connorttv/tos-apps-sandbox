/**
 * Feed Mapper Index
 * 
 * Auto-detects feed type (RSS or Atom) and routes to appropriate parser
 * Routes BBC, CNN, Bloomberg, NASA, and Variety feeds to specialized mappers
 */

import { parseRssFeed } from './rssMapper.js'
import { parseAtomFeed } from './atomMapper.js'
import { parseBbcFeed } from './bbcmapper.js'
import { parseCnnFeed } from './cnnmapper.js'
import { parseBloombergFeed } from './bloombergmapper.js'
import { parseNasaFeed } from './nasamapper.js'
import { parseVarietyFeed } from './varietymapper.js'

/**
 * Detect feed type and parse accordingly
 * @param {string} xmlText - Raw XML text
 * @param {string} sourceId - Source feed ID
 * @param {string} sourceLogoUrl - Optional source logo URL
 * @returns {Array} Array of normalized Article objects
 */
export function parseFeed(xmlText, sourceId, sourceLogoUrl) {
  // Route BBC feeds to specialized mapper
  if (sourceId === 'bbc-news') {
    return parseBbcFeed(xmlText, sourceId, sourceLogoUrl)
  }

  // Route CNN feeds to specialized mapper
  if (sourceId === 'cnn') {
    return parseCnnFeed(xmlText, sourceId, sourceLogoUrl)
  }

  // Route Bloomberg feeds to specialized mapper
  if (sourceId === 'bloomberg') {
    return parseBloombergFeed(xmlText, sourceId, sourceLogoUrl)
  }

  // Route NASA feeds to specialized mapper
  if (sourceId === 'nasa') {
    return parseNasaFeed(xmlText, sourceId, sourceLogoUrl)
  }

  // Route Variety feeds to specialized mapper
  if (sourceId === 'variety') {
    return parseVarietyFeed(xmlText, sourceId, sourceLogoUrl)
  }

  // Detect feed type by checking root element
  if (xmlText.includes('<feed') && xmlText.includes('xmlns="http://www.w3.org/2005/Atom"')) {
    // Atom feed
    return parseAtomFeed(xmlText, sourceId, sourceLogoUrl)
  } else if (xmlText.includes('<rss') || xmlText.includes('<channel')) {
    // RSS feed
    return parseRssFeed(xmlText, sourceId, sourceLogoUrl)
  } else {
    throw new Error(`Unknown feed format for ${sourceId}`)
  }
}
