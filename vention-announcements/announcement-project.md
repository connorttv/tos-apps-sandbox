You are building a TelemetryOS digital signage app called "Announcements".

This is NOT a web or mobile UI.
This is a 10-foot digital signage experience for large public displays (50–60” TVs).

CORE CONSTRAINTS:
- No interaction (no buttons, no hover states, no scrolling)
- Viewers glance at the screen for 1–4 seconds
- Text must be readable from 10+ feet
- High contrast (minimum 7:1)
- Single clear focal point per layout
- Minimum 3rem (48px) safe padding from edges
- Primary text >= 6rem (96px)
- Secondary text >= 3rem (48px)
- Tertiary text >= 1.5rem (24px)

SUPPORTED LAYOUT SHAPES (must support all 8):

Full-Screen:
- Landscape 16:9 (1920x1080)
- Portrait 9:16 (1080x1920)

Zone:
- Large Square 1:1 (1080x1080)
- Small Square 1:1 (360x360)
- Landscape Bar 3:1 (1080x360)
- Portrait Bar 1:3 (360x1080)

Extreme:
- Chiron Banner 10:1 (1920x192)
- Skyscraper 1:10 (192x1920)

CONTENT PRIORITY SYSTEM:

P1 (Essential – visible in ALL shapes):
- Announcement title
- Primary message text

P2 (Supporting – hidden in extreme shapes):
- Supporting text
- Icons/images

P3 (Large layouts only):
- Full message body
- Decorative elements

Extreme layouts (Chiron, Skyscraper) must show P1 ONLY.

BACKGROUND RULES:
App must support:
- Solid color
- Gradient
- Image (with 40% black overlay)
- Video (with 40% black overlay)

Text must remain readable on all background types.

MULTIPLE ANNOUNCEMENTS:
- Automatically rotate announcements
- Duration configurable (5–60s)
- Transition styles: Fade, Slide, Instant
- Show subtle progress indicators (dots or bar)
- No interactive controls

TEXT FORMATTING SUPPORT:
- Bold
- Italic
- Bullet lists
- Multiple heading sizes

SETTINGS PANEL LIMITATIONS:
Only use these components:
- Text input
- Text area
- Dropdown
- Slider
- Color picker
- Switch
- Checkbox
- Radio
- Section heading
- Bordered box
- Divider
- Media picker
- Button

Do NOT generate:
- Drag-and-drop
- Custom widgets
- Tabs
- Accordions
- Rich text editors
- Date/time pickers

VISUAL PRINCIPLES:
- One dominant focal point
- Strong visual hierarchy
- Minimal clutter
- Instant readability
- Designed for passive viewing

When generating layouts:
- Respect content priority mapping
- Remove P2/P3 in constrained layouts
- Do not scale text below minimum size rules
- Maintain safe zones

When generating components:
- Assume developers handle loading, error, and empty states
- Do not design those states

All UI should feel modern, clean, and enterprise-grade.
Quality must match or exceed ScreenCloud and OptiSigns.
