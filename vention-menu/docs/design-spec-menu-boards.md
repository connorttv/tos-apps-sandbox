# Design Spec: Menu Boards

---

## The Project

**TOS** is a new digital signage platform. Apps display on large TVs (50-60") in lobbies, retail stores, restaurants, offices, and other public spaces.

**This is NOT web or mobile design.** Most designers struggle with the paradigm shift. To help, please study the competitor apps referenced below before starting.

**Key constraints:**
- **10+ ft viewing distance** — text must be large, hierarchy must be instant
- **1-4 second glances** — viewers don't study screens, they glance
- **No interaction** — no buttons, no hover states, no scrolling
- **8 responsive shapes** — apps must work across a range of responsive shapes, from full-screen to narrow banners

---

## Competitors & Reference

**Study these before designing.** You may heavily reference or borrow from competitor designs, but your submission must be of **equal or greater quality**.

### App-Specific Competitors

| Competitor | What to Study |
|------------|---------------|
| [ScreenCloud Menu Boards](https://screencloud.com/apps/digital-menu-board) | Template variety, featured item highlighting, clean typography |
| [OptiSigns Digital Menu](https://www.optisigns.com/apps-list/musthavemenus) | Grid layouts, image placement, daypart visual transitions |
| [Yodeck Digital Menu](https://www.yodeck.com/apps/dsmenu-integration-for-digital-signage) | Grid layouts, image placement, daypart visual transitions |


### General Galleries

- **ScreenCloud:** [screencloud.com/apps](https://screencloud.com/apps)
- **OptiSigns:** [optisigns.com/apps](https://www.optisigns.com/apps)
- **Yodeck:** [yodeck.com/apps](https://www.yodeck.com/free-digital-signage-apps/)

Sign up for free trials to explore how their apps actually work.

---

## This App

**App:** Template-driven digital menu board for QSR locations. Displays menu items organized by sections with names, prices, descriptions, and images. Supports dayparting to automatically swap menus at configured times (breakfast → lunch → dinner).

**Use Case:** Fast food restaurants, coffee shops, and quick-service locations. Mounted behind counters or in drive-thru lanes. Store managers update pricing and specials; corporate teams deploy consistent menus across franchise locations. Customers glance at the display while ordering.

**Complexity:** Complex

---

## Deliverables

### Figma Template
Duplicate this template to begin: [**Open in Figma**](https://www.figma.com/design/7xJPcE0yceA3dEvYyv7EAH/Telemetry---Figma-Template?t=H6ha9KxZr8AP1tn5-0)

### Stage 1: Direction Check

Submit **1 frame** first for approval before completing the full set. You may include 2-3 variations if you want feedback on different directions.

| Frame | Why |
|-------|-----|
| **Landscape** | Full design with all P1/P2/P3 content |

**Wait for approval before proceeding to Stage 2.**

**Questions?** Please submit questions in writing. We strongly prefer written communication over calls wherever possible.

### Stage 2: Full Delivery

After Stage 1 approval, complete:

| Deliverable | Description |
|-------------|-------------|
| **Remaining 7 shapes** | All shapes shown below |
| **P1/P2/P3 Arrangement** | Show how content priorities map to shapes |
| **Settings Panel** | Configuration UI using SDK components |

**Format:** Single Figma file, fully annotated, organized and inspect-ready for developers.

### What Developers Handle (Not Your Responsibility)

| Item | Standard Rule |
|------|---------------|
| **Loading state** | Gray skeletons matching your populated layout |
| **Error state** | Fully transparent (fail silently) |
| **Empty state** | Fully transparent |

---

## Content Priority

Define what's essential vs. optional. This determines what shows in constrained shapes.

| Priority | What It Means | Menu Boards Content |
|----------|---------------|---------------------|
| **P1** | Essential — visible in ALL shapes including smallest | Item name, price |
| **P2** | Supporting — hidden in extreme shapes (Chiron, Skyscraper) | Item image, section headers, featured badge |
| **P3** | Nice-to-have — only in large shapes (Landscape, Portrait, Large Square) | Item description, promotional messages, logo |

---

## /render — The 8 Layout Shapes

Design all 8 shapes. Content adapts based on P1/P2/P3 priorities.

### Full-Screen Layouts

| Shape | Aspect Ratio | Figma Frame Size | Content |
|-------|--------------|------------------|---------|
| **Landscape** | 16:9 | 1920 × 1080 | P1 + P2 + P3 |
| **Portrait** | 9:16 | 1080 × 1920 | P1 + P2 + P3 |

### Zone Layouts

| Shape | Aspect Ratio | Figma Frame Size | Content |
|-------|--------------|------------------|---------|
| **Large Square** | 1:1 | 1080 × 1080 | P1 + P2 + P3 |
| **Small Square** | 1:1 | 360 × 360 | P1 + P2 |
| **Landscape Bar** | 3:1 | 1080 × 360 | P1 + P2 |
| **Portrait Bar** | 1:3 | 360 × 1080 | P1 + P2 |

### Extreme Layouts

| Shape | Aspect Ratio | Figma Frame Size | Content |
|-------|--------------|------------------|---------|
| **Chiron Banner** | 10:1 | 1920 × 192 | P1 only |
| **Skyscraper** | 1:10 | 192 × 1920 | P1 only |

### Frame Naming

```
Menu Boards / [Shape]

Examples:
Menu Boards / Landscape
Menu Boards / Small Square
Menu Boards / Chiron Banner
```

---

## /render — Design Principles

| Principle | Requirement |
|-----------|-------------|
| **10-ft viewing** | Primary text ≥ 6rem, secondary ≥ 3rem, tertiary ≥ 1.5rem |
| **Glanceability** | One clear focal point per screen |
| **High contrast** | 7:1 minimum (WCAG AAA) |
| **Visual hierarchy** | Instant priority recognition |
| **No interaction** | No buttons, hover states, scrolling |
| **Safe zones** | 3rem padding from edges |

### REM Reference

Design at these pixel sizes in Figma. Developers convert to REM for responsive scaling.

| REM | Figma Equivalent |
|-----|------------------|
| 1rem | 16px |
| 1.5rem | 24px |
| 3rem | 48px |
| 6rem | 96px |

---

## /render — Visual Requirements

### App-Specific

| Element | Requirement |
|---------|-------------|
| **Item Price** | Large, high contrast — minimum 48pt (3rem). Primary focal point alongside item name. Currency formatted (e.g., $8.99) |
| **Item Name** | Bold, prominent — minimum 36pt (2.25rem). Scannable at a glance |
| **Item Image** | High quality food photography. Consistent aspect ratio across items. Appetizing presentation |
| **Section Headers** | Clear visual separation between menu sections (Breakfast, Entrees, Sides, Beverages, Desserts) |
| **Featured Badge** | Visual highlighting for featured items — border, badge, larger size, or special placement. Supports 3-5 featured items |
| **Item Description** | Optional supporting text — minimum 24pt (1.5rem). Brief, 1-2 lines max |
| **Logo** | Brand logo in header area. Uploaded by user |
| **Promotional Zone** | Designated area for promotional messages and daily specials |

### Typography Minimums (QSR Readability)

Per PRD requirements for 10-15 foot viewing distance:

| Element | Minimum Size |
|---------|--------------|
| Prices | 48pt |
| Item Names | 36pt |
| Descriptions | 24pt |

---

## /render — Backgrounds

All apps support configurable backgrounds. Design content that works on all types:

| Background Type | What You Design |
|-----------------|-----------------|
| **Default** | App-specific background or solid black |
| **Solid color** | Ensure text legible on any color |
| **Gradient** | Ensure text legible on any gradient |
| **Image** | Design with 40% black overlay for legibility |
| **Video** | Design with 40% black overlay for legibility |

---

## /settings — Available Components

Design within these constraints. If you design something not listed, developers can't build it.

### Input Components

| Component | Use For |
|-----------|---------|
| **Text input** | Single-line text |
| **Text area** | Multi-line text |
| **Dropdown/select** | Predefined options |
| **Slider** | Numeric range |
| **Color picker** | Color selection |

### Toggle Components

| Component | Use For |
|-----------|---------|
| **Switch** | On/off boolean |
| **Checkbox** | Multiple selections |
| **Radio buttons** | Mutually exclusive choice |

### Layout Components

| Component | Use For |
|-----------|---------|
| **Section heading** | Grouping settings |
| **Bordered box** | Repeatable items |
| **Divider** | Horizontal separator |
| **Media picker** | Images/videos |
| **Button** | Actions (add, remove) |

### What You CAN'T Design

- Custom interactive widgets
- Drag-and-drop interfaces
- Nested accordions or tabs
- Rich text editors
- Date/time pickers

---

## /settings — App Options

### Template Selection

| Setting | Component | Options/Default |
|---------|-----------|-----------------|
| Menu template | Dropdown with visual thumbnails | Classic Grid, Premium Feature, Drive-Thru Vertical, Coffee Shop Horizontal |

### Menu Items (Repeatable)

| Setting | Component | Options/Default |
|---------|-----------|-----------------|
| Item name | Text input | — |
| Price | Text input | Currency formatted (e.g., $8.99) |
| Description | Text area | Optional |
| Image | Media picker | From media library |
| Category/Section | Dropdown | Breakfast, Entrees, Sides, Beverages, Desserts |
| Featured | Checkbox | Off |

### Dayparting Schedule

| Setting | Component | Options/Default |
|---------|-----------|-----------------|
| Enable dayparting | Switch | Off |
| Daypart name | Text input | e.g., "Breakfast" |
| Start time | Text input | e.g., "6:00 AM" |
| End time | Text input | e.g., "10:30 AM" |
| Menu template | Dropdown | Select template for this daypart |

### Section Rotation

| Setting | Component | Options/Default |
|---------|-----------|-----------------|
| Enable rotation | Switch | Off |
| Rotation duration | Dropdown | 10s, 15s, 20s, 30s (default: 20s) |

### Visual Customization

| Setting | Component | Options/Default |
|---------|-----------|-----------------|
| Brand primary color | Color picker | #000000 |
| Accent color | Color picker | #FF0000 |
| Text color | Color picker | #FFFFFF |
| Font size | Dropdown | Small, Medium (default), Large |
| Logo | Media picker | None |

### POS Integration (Optional)

| Setting | Component | Options/Default |
|---------|-----------|-----------------|
| Enable POS sync | Switch | Off |
| API endpoint URL | Text input | — |
| Sync interval | Dropdown | 5 min, 10 min, 15 min (default: 10 min) |

### Background (Standard)

| Setting | Component | Default |
|---------|-----------|---------|
| Background type | Dropdown | Default |
| Solid color | Color picker | #000000 |
| Gradient color 1 | Color picker | #000000 |
| Gradient color 2 | Color picker | #333333 |
| Gradient direction | Dropdown | Top to bottom |
| Image | Media picker | None |
| Video | Media picker | None |
| Overlay color | Color picker | #000000 |
| Overlay opacity | Slider (0-100%) | 40% |

---

## Process

### Stage 1: Direction Check

| Step | Action |
|------|--------|
| 1 | Review this spec |
| 2 | Study competitors |
| 3 | Design **Landscape** (full content) |
| 4 | Design **Chiron Banner** or **Small Square** (P1 only) |
| 5 | Submit for approval |

### Stage 2: Full Delivery

| Step | Action |
|------|--------|
| 6 | Complete remaining 7 shapes |
| 7 | Design settings panel |
| 8 | Submit final Figma link |
| 9 | Revisions (if needed) |

**Ask questions early.**

---

## Pre-Submission Checklist

### Stage 1 Checklist

- [ ] Competitor apps reviewed (especially QSR menu boards)
- [ ] Landscape frame complete
- [ ] Text readable at 10+ ft (48pt prices, 36pt names, 24pt descriptions)
- [ ] High contrast maintained for QSR environment

### Stage 2 Checklist

**After Stage 1 approval:**

- [ ] All 8 shapes designed
- [ ] Annotations included, clarifying information hierarchy (P1 + P2 + P3)
- [ ] Safe zones respected (3rem)
- [ ] Rules for font size and spacing are respected
- [ ] Works on all background types (dynamic, image, solid colour)
- [ ] Settings panel complete
- [ ] Background section included
- [ ] Uses only SDK components

### File

- [ ] Single Figma file
- [ ] Frames named: `Menu Boards / [Shape]`
- [ ] Layers named properly

### App-Specific

- [ ] Menu items show name + price clearly at all sizes
- [ ] Featured items have distinct visual treatment
- [ ] Section headers provide clear organization
- [ ] Multiple sections can fit in Landscape/Portrait layouts
- [ ] Extreme shapes (Chiron, Skyscraper) work with just item name + price
- [ ] Template style feels appropriate for QSR environment
