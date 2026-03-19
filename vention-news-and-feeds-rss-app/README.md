# TelemetryOS RSS News Feeds App

A digital signage application for TelemetryOS that displays rotating news articles from RSS and Atom feeds. Optimized for large screens and long viewing distances with high-contrast, readable typography.

## Features

- **14 Pre-configured RSS Feeds**: Curated feeds organized by category
- **Custom Feed Management**: Add, edit, and remove RSS/Atom feeds
- **Background Polling**: Automatic feed updates at configurable intervals
- **Article Rotation**: Smooth transitions between articles with configurable duration
- **Offline Support**: Displays cached articles with offline indicator when connectivity is lost
- **Deduplication**: Prevents duplicate articles across feeds
- **Category Filtering**: Filter feeds by category or name in Settings

## Default RSS Feeds

The app initializes with 14 pre-configured RSS feeds on first load:

### News (4 feeds)
- **BBC News**: `http://feeds.bbci.co.uk/news/rss.xml`
- **Reuters**: `https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best`
- **AP News**: `https://apnews.com/apf-topnews`
- **CNN**: `http://rss.cnn.com/rss/edition.rss`

### Sport (1 feed)
- **ESPN**: `https://www.espn.com/espn/rss/news`

### Finance (2 feeds)
- **CNBC**: `https://www.cnbc.com/id/100003114/device/rss/rss.html`
- **Bloomberg**: `https://www.bloomberg.com/feed/topics/economics`

### Tech (1 feed)
- **TechCrunch**: `https://techcrunch.com/feed/`

### Weather/Safety (3 feeds)
- **NOAA**: `https://www.weather.gov/rss_page.php`
- **Environment Canada**: `https://weather.gc.ca/rss/city/on-118_e.xml`
- **FEMA**: `https://www.fema.gov/rss/news.xml`

### Science (1 feed)
- **NASA**: `https://www.nasa.gov/rss/dyn/breaking_news.rss`

### Entertainment (1 feed)
- **Variety**: `https://variety.com/feed/`

## How to Add Feeds

1. Navigate to **Settings** (`/settings`)
2. Scroll to the **RSS Feeds** section
3. Expand the category where you want to add the feed (or create a new category)
4. Click **"Add Feed"** for the desired category
5. Fill in the feed details:
   - **Name**: Display name for the feed (e.g., "BBC News")
   - **URL**: RSS or Atom feed URL (required)
   - **Logo URL**: Optional logo/brand image URL
6. Click **"Save"** to add the feed

### Editing Feeds

- Click the **Edit** button next to any feed
- Modify the name, URL, or logo URL
- Click **"Save"** to update or **"Cancel"** to discard changes

### Removing Feeds

- Click the **Remove** button next to any feed
- Confirm the removal

## Article Caching

### Ordering

Articles are **ordered by publication date** (newest first) as a single unified list. Articles from different feeds are **not grouped by source**—they are merged and sorted chronologically as a whole.

### Uniqueness

Articles are **deduplicated by their `link` property**. If the same article appears in multiple feeds (e.g., BBC and Reuters reporting the same story), only one instance is kept. When duplicates are found, the system keeps the version with the most recent `publishedAt` timestamp.

**Example:**
- If an article with URL `https://example.com/story` appears in both BBC and Reuters feeds, only one instance is cached
- The cached version will be the one with the newer publication date

### Caching Behavior

- Articles are fetched and cached in the background without blocking the display
- Cached articles persist even if feeds temporarily fail
- New articles replace old ones when feeds are successfully polled
- Empty feed responses do not clear existing cached articles

## Background Job

The app uses a background worker (`pollFeeds.js`) to automatically fetch and update articles.

### Polling Schedule

- **Default Interval**: 15 minutes
- **Configurable Range**: 5-60 minutes (set in Settings)
- **Initial Poll**: Runs immediately when the app starts
- **Automatic Rescheduling**: Updates polling interval when settings change

### Real-time Updates

The worker subscribes to storage changes and reacts immediately to:

- **Selected Feeds Changes**: Triggers an immediate poll when feeds are selected or deselected
- **Refresh Interval Changes**: Reschedules polling when the interval is updated

### Error Handling

- **Individual Feed Failures**: If a feed fails (network error, timeout, parsing error), the worker continues with other feeds
- **Timeout Protection**: Each feed fetch has a 30-second timeout
- **Graceful Degradation**: Failed feeds are logged but don't stop the polling process
- **Automatic Recovery**: Polling continues on schedule even after errors

### Feed Fetching

- Uses TelemetryOS Proxy API for all external feed requests (never direct `fetch()`)
- Supports both RSS 2.0 and Atom feed formats
- Automatically detects feed type and uses appropriate parser
- Extracts images from feed metadata and HTML content

## Offline Badge

The app displays an **"Content may not be current"** indicator when connectivity issues are detected.

### How It Works

The offline status is determined by the background worker:

- **Offline (`isOffline = true`)**: Set **only when ALL selected feeds fail** to fetch
- **Online (`isOffline = false`)**: Set when **at least one feed succeeds**, even if some feeds fail

### Behavior

- **Partial Failures**: If some feeds succeed and others fail, the app remains "online" and shows the successful feeds' articles
- **Complete Failure**: Only when every selected feed fails does the app show the offline indicator
- **Cached Content**: When offline, the app continues displaying the most recently cached articles
- **Automatic Recovery**: When connectivity is restored and feeds succeed again, the offline indicator automatically disappears

### Display

The offline indicator appears in the footer section of each article card, alongside the source badge and timestamp.

## Feed Fields

### Required Fields

- **`id`** (string): Unique identifier for the feed (auto-generated when adding)
- **`name`** (string): Display name for the feed (e.g., "BBC News")
- **`url`** (string): RSS or Atom feed URL (must be valid and reachable)
- **`category`** (string): Category for organizing feeds (e.g., "News", "Sport", "Finance")

### Optional Fields

- **`logoUrl`** (string): URL to the feed's logo/brand image (displayed in article cards)

## Article Fields

### Required Fields

- **`title`** (string): Article headline/title
- **`description`** (string): Article description or summary
- **`link`** (string): Link to the full article
- **`publishedAt`** (number): Publication timestamp (Unix timestamp in milliseconds)
- **`sourceId`** (string): Unique identifier for the source feed (matches feed `id`)

### Optional Fields

- **`imageUrl`** (string): Article image URL (extracted from feed metadata or HTML content)
- **`sourceLogoUrl`** (string): Source logo/brand image URL (from feed `logoUrl`)

## Configuration

### Article Duration

- **Default**: 10 seconds per article
- **Range**: 5-60 seconds
- **Location**: Settings → Feed Selection & Configuration

### Refresh Interval

- **Default**: 15 minutes
- **Range**: 5-60 minutes
- **Location**: Settings → Feed Selection & Configuration

### Transition Style

- **Fade**: Smooth opacity transition
- **Slide**: Train-like slide animation (current slides left, next slides in from right)
- **Cut**: Instant switch with no animation
- **Location**: Settings → Feed Selection & Configuration

## Architecture

- **Render View** (`/render`): Digital signage display (no user interaction)
- **Settings View** (`/settings`): Configuration UI for operators
- **Background Worker**: Asynchronous feed polling (`workers/pollFeeds.js`)
- **Instance Storage**: Single source of truth for configuration and cached articles
- **Feed Mappers**: Separate parsers for RSS 2.0 and Atom formats

## Development

The feed polling worker runs automatically in development mode. In production, it runs as a registered TelemetryOS worker.

## License

Part of the TelemetryOS platform.
