/**
 * RSS Feed DTO - Represents a user-configured RSS feed
 */
export interface RssFeed {
  /** Unique identifier for the feed */
  id: string
  /** Display name for the feed */
  name: string
  /** RSS/Atom feed URL */
  url: string
  /** Category for organizing feeds (e.g., "News", "Sport", "Finance") */
  category: string
  /** Logo/brand image URL for the feed (optional) */
  logoUrl?: string
}

/**
 * Common RSS feed categories
 */
export const COMMON_CATEGORIES = [
  'News',
  'Sport',
  'Finance',
  'Tech',
  'Entertainment',
  'Weather/Safety',
  'Science',
  'Custom',
] as const

/**
 * Pre-configured curated RSS feeds (14 feeds as per PRD)
 * Initialized on first load if no feeds exist
 */
export const DEFAULT_FEEDS: RssFeed[] = [
  // News (4 feeds)
  {
    id: 'bbc-news',
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    category: 'News',
  },
  {
    id: 'reuters',
    name: 'Reuters',
    url: 'https://ir.thomsonreuters.com/rss/news-releases.xml',
    category: 'News',
  },
  {
    id: 'ap-news',
    name: 'AP News',
    url: 'https://apnews.com/index.rss',
    category: 'News',
  },
  {
    id: 'cnn',
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    category: 'News',
  },
  // Sports (1 feed)
  {
    id: 'espn',
    name: 'ESPN',
    url: 'https://www.espn.com/espn/rss/news',
    category: 'Sport',
    logoUrl: 'https://a.espncdn.com/i/espn/teamlogos/lrg/trans/espn_dotcom_black.gif',  
  },
  // Finance (2 feeds)
  {
    id: 'cnbc',
    name: 'CNBC',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'Finance',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    url: 'https://feeds.bloomberg.com/economics/news.rss',
    category: 'Finance',
    logoUrl: 'https://www.bloomberg.com/feeds/static/images/bloomberg_logo_blue.png',
  },
  // Tech (1 feed)
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Tech',
  },
  // Weather/Safety (3 feeds)
  {
    id: 'noaa',
    name: 'NOAA',
    url: 'https://www.weather.gov/rss_page.php',
    category: 'Weather/Safety',
  },
  {
    id: 'environment-canada',
    name: 'Environment Canada',
    url: 'https://natural-resources.canada.ca/stories/simply-science/rss.xml',
    category: 'Weather/Safety',
  },
  {
    id: 'fema',
    name: 'FEMA',
    url: 'https://www.fema.gov/news/news_region-i.rss',
    category: 'Weather/Safety',
  },
  // Science (1 feed)
  {
    id: 'nasa',
    name: 'NASA',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: 'Science',
  },
  // Entertainment (1 feed)
  {
    id: 'variety',
    name: 'Variety',
    url: 'https://variety.com/feed/',
    category: 'Entertainment',
    logoUrl: 'https://variety.com/wp-content/uploads/2018/06/variety-favicon.png',
  },
]
