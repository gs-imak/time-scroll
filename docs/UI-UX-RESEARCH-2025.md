# Time Scroll -- UI/UX Research: Best Interactive History & Globe Experiences (2025-2026)

Research conducted April 2026. Concrete, actionable design insights for building an engaging historical timeline PWA on a 3D globe.

---

## Table of Contents

1. [Interactive History Map Websites](#1-interactive-history-map-websites)
2. [Interactive Globe Experiences](#2-interactive-globe-experiences)
3. [Map Marker & Pin Design Patterns](#3-map-marker--pin-design-patterns)
4. [Interactive Timeline UI Patterns](#4-interactive-timeline-ui-patterns)
5. [Dark-Themed Immersive Map Apps](#5-dark-themed-immersive-map-apps)
6. [Synthesized Recommendations for Time Scroll](#6-synthesized-recommendations-for-time-scroll)

---

## 1. Interactive History Map Websites

### Chronas (chronas.org)

**What it is:** Interactive history map with 50M+ interconnected data points covering 4,000 years. WebGL-based, wiki-style contribution model.

**What makes it engaging:**
- **Time slider at the bottom** lets users scrub through history and watch national borders morph in real time
- **Layered marker system** with toggleable categories: cities, battles, artifacts, famous people -- each appearing in proper geographic AND temporal context
- **Migration arrows** show the journey of notable people (born here, died there) as small directional arrows on the map
- **Click-through to Wikipedia** for every entity -- markers, regions, and events all link to deep content
- **User contribution model** where anyone can rate, edit, add markers, link media (video, images, podcasts)

**Key UI patterns:**
- Left sidebar with layer toggles: area, markers, epics, migration
- Color-coded political entities (rulers, cultures, religions) as filled regions
- Time slider is the primary navigation, not a secondary control
- Clicking the map itself reveals contextual Wikipedia entries for that nation at that time

**Weakness to avoid:** Can feel overwhelming with too many layers active simultaneously. Information density needs careful progressive disclosure.

---

### Histography (histography.io)

**What it is:** 14 billion years of history visualized as animated particle dots, pulling from Wikipedia. Created by Matan Stauber at Bezalel Academy using Pixi.js/WebGL.

**What makes it MAGICAL:**

- **Every historical event is a dot.** The entire interface is thousands of animated particles -- no traditional list, no cards, just dots in space.
- **Organic particle movement:** When the user selects a time range, the system constructs a new graph layout. Each dot gets a new target position. Every millisecond, the system moves each dot slightly closer to its target, but each dot has its own speed -- so particles "come flying in" rather than moving robotically.
- **Smart hover detection:** As you move your cursor, the system picks the "most interesting" event from the radius around your cursor. No need to click precisely on a tiny dot. This eliminates decision paralysis.
- **Exponential timeline scaling:** Moving through time, years close to the present shift by 1 year per step. Going back further, steps become 100,000 years, then millions of years. This is solved with an exponential function that adjusts step size based on how far back you are.
- **Category filtering sidebar** shows event categories (inventions, wars, women's rights, literature, disasters) with counts, letting users filter the particle field.
- **Ranking algorithm** scores Wikipedia articles so the most important events surface first -- longer, more popular articles rank higher.

**Key technical insight:** Uses Pixi.js (2D WebGL) rather than Three.js because the visualization is fundamentally 2D particle animation, not 3D. "WebGL only when you have complex graphics. For most projects, CSS will give you great results."

**What to steal for Time Scroll:**
- The idea that individual events can be particles/dots that animate organically
- Smart hover radius detection (don't force pixel-perfect clicks)
- Exponential time scaling for spanning millennia
- "First glimpse storytelling" -- what does the user see in the first second?

---

### GeaCron (geacron.com)

**What it is:** World history maps and timelines by year since 3000 BC.

**Key pattern:** Year-by-year slider with animated border transitions. Straightforward but effective -- the slider IS the product. Simple, clear, direct.

---

### Historica (historica.org)

**What it is:** AI-powered history map covering year 1 to 2025 with improved precision mapping.

**Key innovation:** AI-driven mapping system for historical boundary accuracy.

---

### Ostellus Atlas (atlas.ostellus.com)

**What it is:** Interactive digital atlas designed for dynamically visualizing historical data with filters for time and events.

**Key patterns:**
- Visual timelines combined with comprehensive event integration
- Filters for time period AND event type simultaneously
- Education-focused design (used in schools)

**Weakness:** Interface can be complex for new users -- reinforces the need for progressive disclosure.

---

### OpenHistoricalMap (openhistoricalmap.org)

**What it is:** Open-source, community-created interactive map of the world throughout history.

**Key pattern:** Crowdsourced historical geodata -- the OSM model applied to history.

---

### HistoryMaps (history-maps.com)

**What it is:** History education platform available in 58 languages with visual learning focus.

**Key pattern:** Accessibility through translation + visual-first approach.

---

## 2. Interactive Globe Experiences

### The GitHub Globe

**URL:** https://github.blog/engineering/engineering-principles/how-we-built-the-github-globe/

**Architecture -- 5 visual layers:**
1. **Halo** -- custom shader drawing a gradient on the backside of a slightly-larger sphere, tilted to one side. Hides pixelation from disabling antialiasing while looking like an atmosphere.
2. **Globe** -- base sphere lit by 4 lights. NO TEXTURES used anywhere.
3. **Earth regions** -- ~12,000 five-sided circles placed via lat/lng loops. A small PNG world map determines which circles to render (alpha > 90/255 = render).
4. **Blue spikes** -- vertical lines from locations with open pull requests.
5. **Pink arcs** -- cubic Bezier curves connecting PR creation and merge locations.

**What makes it feel alive:**
- **Arcs animate with setDrawRange()** on TubeBufferGeometry -- lines draw themselves into existence
- **Impact rings:** When an arc reaches its destination, a solid circle appears + a ring scales outward while fading out
- **Ease-out math per frame:** `current + (target - current) * 0.06` -- each frame steps 6% closer to the target, naturally decelerating
- **Timezone-based initial rotation:** Globe starts centered on the user's location via timezone offset converted to radians: `Math.PI * (timezoneOffset / 720)`
- **Hover reveals real data:** Repository name, timestamp, language, geographic locations
- **Each arc is clickable** -- links to actual PR data

**Performance strategy -- 4 degradation tiers:**
| Tier | Pixel Density | Circle Count | Raycast Freq | PR Count |
|------|--------------|-------------|-------------|---------|
| Max  | 2.0          | ~12,000     | Every frame | Full    |
| High | 1.5          | ~10,000     | Every 2     | Reduced |
| Med  | 1.5          | ~8,000      | Every 4     | Reduced |
| Low  | 1.0          | ~6,000      | Every 4     | Minimal |

Maintains 55.5 FPS threshold across 50-frame windows, auto-degrades when performance drops.

**Loading strategy:**
- SVG placeholder globe (gradients only) embedded in HTML -- renders instantly
- WebGL globe loads in background
- Crossfade between SVG and canvas using Web Animations API (no DOM manipulation during transition)

**Color palette:**
- Pink arcs (merged PRs)
- Blue spikes (open PRs)
- Dark background with gradient halo
- Muted earth tones for landmasses

---

### The Stripe Globe

**URL:** https://stripe.com/blog/globe

**Architecture -- 3 layers:**
1. **Base layer:** Semi-transparent ocean sphere (~50 segments)
2. **Middle layer:** 60,000 twinkling dots defining continents
3. **Outer layer:** Animated color arcs between countries

**What makes it feel alive:**
- **Sunflower spiral dot distribution** -- dots arranged using the golden angle (like seeds in a sunflower) for uniform spacing from equator to poles without harsh grid lines
- **Country identification via PNG color-coding:** Each country has a unique color in a PNG; canvas `getImageData` matches pixel colors to country IDs for grouped animations
- **Custom fragment shaders** for twinkling effects and aurora-like undulations
- **D3 interpolation** for arcs along great-circle paths with cubic Bezier curves
- **Scroll-triggered rotation** using throttled event handlers (16ms intervals)

**Critical performance fix:** Disabling WebGL renderer antialiasing eliminated bottlenecks on high-res displays. Target: 60fps across mobile and desktop.

**Design philosophy:** Build a "real, whole product" prototype early. Cross-functional design-engineering collaboration prevents last-minute quality compromises.

---

### COBE (cobe.vercel.app)

**What it is:** 5KB zero-dependency WebGL globe library.

**Why it matters for Time Scroll:**
- Proves a beautiful globe can be built in ~5KB
- Downsamples world map texture from 4096x2048 (80KB) to 256x128 (1KB) -- produces dotted maps that look nearly identical
- Parallelized dot rendering (vs GitHub's loop-based approach)
- Any DOM element can be a marker with full CSS transitions, animations, filters
- 60% faster than Three.js-based solutions

---

### Globe.GL / three-globe (globe.gl)

**What it is:** Ready-made WebGL globe component by Vasco Asturiano, wrapping Three.js.

**Built-in visualization layers:**
- Points, arcs, polygons, paths, heatmaps, hex bins, particles, rings, labels, custom 3D objects
- Tooltips support plain text, HTML, or HTML elements
- Gaussian KDE heatmaps based on great-arc distance
- Orbit controls for zoom/pan/rotate with programmatic camera positioning via `pointOfView()` with transition durations

**Why it matters:** This is likely the fastest path to a working prototype. It handles the hard parts (globe rendering, projections, arc math) and lets you focus on the historical data layer.

---

### Google Earth / Cesium Stories

**Storytelling techniques:**
- **Fly-to animations** with configurable position, heading, pitch, and roll
- **Chapter-based narratives** -- each chapter has text, media (images/gifs/video), and geographic coordinates
- **Presentation mode** flies viewers from place to place following the narrative
- **Photorealistic 3D Tiles** for immersive landscapes

**CesiumJS (2025):**
- WebGPU renderer branch landed with 2-4x performance uplift
- Open source, battle-tested across aerospace, smart cities, drones
- Supports real-time data feeds (flights, satellites, earthquakes, ships, weather)

---

## 3. Map Marker & Pin Design Patterns

### Core Marker Interaction Model

Source: mapuipatterns.com

| Interaction | What Happens | Best Practice |
|-------------|-------------|---------------|
| **Click/Tap** | Opens info popup with title, description, photos, reviews, action buttons | Primary discovery mechanism |
| **Hover** | Shows MapTip with concise info | Preview without commitment |
| **Drag** | Adjusts marker location | Mobile: drag map under fixed center marker instead |
| **Selection** | Visual state change (color, size, glow) | Must be clearly distinct from default state |

### When to Use Markers vs Points

- **Markers** (teardrop pins, custom icons): Sparse data, important locations, need detailed popups
- **Point symbols** (simple circles/dots): Dense datasets, data visualization, physical location indication
- **For Time Scroll:** Historical events on a globe = use point symbols/dots at overview zoom, transition to rich markers when zoomed in

### Animated Marker Patterns

- **Bounce-in animation** when a marker first appears on the map
- **Pulse/ripple ring** radiating outward from important events (like GitHub Globe's impact rings)
- **Scale-up on hover** (subtle, 1.1-1.2x) with smooth easing
- **Cluster expansion animation** showing dots flying apart when a cluster is tapped
- **Fade transitions** when markers appear/disappear during time scrubbing

### Clustering Best Practices

Source: mapuipatterns.com

**Visual design:**
- Circular bubble symbols with interior count labels
- Size proportional to number of contained markers
- Consistent coloring across all clusters (don't mix individual marker colors)

**Interaction:**
- Hover on cluster: outline the geographic bounds of the cluster
- Click on cluster: zoom to those bounds OR show summary popup
- Zoom in: clusters break apart into individual markers
- Zoom out: markers consolidate back into clusters
- At max zoom with overlapping markers: use "spider" clustering (leader lines arranging markers in a circle)

**Animation:**
- Animate points being added to / removed from clusters during zoom transitions
- Smooth interpolation, not instant snapping

### Airbnb's Marker Model (best-in-class)

- **Price labels as markers** -- the marker itself communicates data, not just location
- **Hover preview:** Smaller markers without labels enlarge and show price on hover
- **List-map sync:** Map updates list as you pan; list highlights update the map
- **Persistent selection state:** Selected property stays highlighted even when zooming out
- **Visited state:** Clear visual distinction for listings already viewed
- **Popover cards:** Rich preview with photo, title, price, rating on click

**What to steal:** Markers that carry data in their visual design (not just dots). For Time Scroll, markers could show era-coded colors, event type icons, or importance via size.

### Info Popup Best Practices

Source: mapuipatterns.com

**Content structure:**
- Photos, videos, ratings, charts
- Title and key metrics
- Properties and related items
- Action buttons (share, rate, zoom, details)
- Progressive disclosure for additional details

**Positioning:**
- Below or to the side of marker (don't pan to place above)
- Mobile: dock to bottom of screen
- Only one popup open at a time (new popup auto-closes previous)
- Never show empty "no information found" popups

**Sizing:**
- Minimize required space; avoid scrolling
- Don't obscure essential map content beneath

---

## 4. Interactive Timeline UI Patterns

### Scrollytelling (Scroll-Driven Narratives)

The dominant pattern in 2025 for immersive timeline experiences.

**Core technique:** User's scroll position triggers animations, narrative beats, and data reveals. Text paragraphs fade in and trigger corresponding changes in persistent visual elements.

**Best examples:**
- **NYT "342,000 Swings Later"** -- scroll position populates visualizations with data points, color highlights filter based on narrative
- **The Pudding "Unlikely Odds of Making It Big"** -- thousands of data points visualized through scroll-driven narrative
- **Apple product pages** -- 3D objects manipulated by scrolling
- **Spotify Wrapped** -- scroll-driven personalized data story

**Animation techniques:**
1. **Intersection Observer API** -- efficient visibility detection without performance impact
2. **CSS Transforms** -- GPU-accelerated translate, scale, rotate
3. **Timeline-Based Sequencing** -- multiple elements coordinated to scroll position
4. **Parallax Depth Effects** -- multi-layer movement creating spatial depth
5. **Data Visualization Reveals** -- progressive chart animations unfolding information
6. **Physics-Based Motion** -- momentum and easing for realistic movement

**Performance targets:**
- First Contentful Paint < 2.5 seconds
- Maintain 60fps during scrolling
- Throttle scroll event calculations
- Use CSS transforms instead of layout-changing properties
- Lazy load assets only when entering viewport

**Recommended libraries:**
| Level | Animation | Data Viz | 3D |
|-------|-----------|----------|-----|
| Beginner | AOS, ScrollMagic | Chart.js | Spline |
| Advanced | GSAP, Framer Motion | D3.js | Three.js, Babylon.js |

### Museum Timeline Patterns

**The Met's Timeline of Art History:**
- Chronological navigation with deep-dive into specific periods
- Click an era to explore styles and movements
- Visual: period colors, representative artwork thumbnails

**British Museum + Google WebGL project:**
- World events shown as **colored blobs** (not text lists) -- click to reveal info
- First-person perspective through time
- Events = visual objects, not just data points

**Modern museum kiosk patterns (2025):**
- Hierarchical navigation for deep exploration without overwhelming interfaces
- Search + filter by theme, period, or category
- Quizzes, embedded short videos, swipe-enabled image galleries
- Touchscreen optimized: large hit targets, gesture-based navigation

### What Makes a Timeline Feel "Alive"

1. **Events are visual objects, not list items** -- dots, blobs, cards, thumbnails
2. **Smooth transitions between time periods** -- morphing, flying, fading
3. **Filtering that dynamically reshapes the view** -- selecting "wars" should visually transform the timeline
4. **Zooming between overview and detail** -- macro view shows patterns, micro view shows stories
5. **Connected events** -- arcs, lines, or animations showing cause-and-effect relationships
6. **Ambient motion** -- subtle animations even when idle (twinkling, floating, pulsing)
7. **Audio/haptic feedback** -- sound effects on era transitions, tactile responses on mobile

---

## 5. Dark-Themed Immersive Map Apps

### Mapbox Dark Style (mapbox.com/maps/dark)

**Design philosophy:** "A good base map for data visualization strikes a delicate balance -- it needs to convey location context without distracting from your visualization."

**Key principles:**
- **Legibility first** -- palette is simple, labels unobtrusive, overlaid content pops
- **Subtly saturated dark tones** differentiate land use, land cover, water, buildings
- **Globe View at low zoom** with fog and atmospheric properties (no flat Mercator)
- **Simplified further in 2022 redesign** -- less visual noise, more canvas for data

**What to steal:** The dark map is a canvas, not the content. Your historical events are the content -- the map should recede.

### Windy.com

**Key patterns:**
- **Full-viewport map** -- immersive, no chrome competing with the data
- **Right-side quick menu** for controls (layer selection, settings)
- **Exclusive layer selection** -- only one data layer visible at a time to avoid visual chaos
- **Animated particles** (wind patterns) that make the map feel alive even before interaction
- **Timeline scrubber at bottom** for weather forecasting through time
- **Color gradients overlaid on dark map** -- data pops against the dark background

**What to steal:** Animated particles/movement on the globe surface to communicate "this is alive, this is real-time." Even subtle ambient motion makes the difference between a static map and an immersive experience.

### Flightradar24 (flightradar24.com)

**Key patterns:**
- **Icon-based markers** -- each aircraft type has a distinct silhouette icon, sized relative to the actual aircraft
- **16,000+ moving markers** rendered via WebGL
- **Click reveals flight path** with altitude-coded trail colors
- **Rich info panel** on click: callsign, flight details, progress, time to landing
- **Label options:** text labels, airline logos, or country flags -- user chooses information density
- **Adjustable icon size** in settings

**What to steal:** The concept of markers that MOVE (aircraft flying along paths). For Time Scroll, migration arrows, trade route animations, or conquest paths could give the same feeling of a living, breathing historical world.

### MarineTraffic (marinetraffic.com)

**Key patterns:**
- **4 map styles:** Light, Dark, Satellite, Nautical Charts
- **Color-coded vessel types** for instant categorization
- **Real-time position updates** without jarring jumps

### Strava Heatmap

**Key pattern:** Aggregated activity data as glowing lines on a dark map. The glow effect (bloom/additive blending) on dark backgrounds creates visual depth and draws attention.

### Color Palette Guidelines for Dark Map Apps

**For dark backgrounds, use:**
- Highly saturated + bright colors: yellow, green, cyan, orange
- Avoid dark saturated colors (they disappear against dark backgrounds)
- The lightest color = largest/most important values (inverted from light themes)

**Sequential data (time periods, eras):**
- Single-hue gradient from dark to light
- Example: deep navy (#0D1B2A) to bright cyan (#00F5FF) for a "time depth" scale

**Categorical data (event types):**
- Limit to ~8-10 distinct hues maximum
- Ensure each category is distinguishable at small marker sizes
- Use both hue AND brightness to differentiate (don't rely on hue alone)

**Recommended dark-theme accent palette (derived from research):**

| Purpose | Color | Hex (approx) |
|---------|-------|-------------|
| Background | Deep space black | #0A0A0F |
| Map surface | Dark navy/charcoal | #1A1A2E |
| Water/ocean | Deep blue-black | #0D1B2A |
| Land masses | Muted dark teal | #16213E |
| Grid/borders | Subtle gray | #2A2A40 |
| War/conflict events | Warm red/amber | #FF4444 |
| Cultural events | Soft gold | #FFD93D |
| Scientific/tech events | Electric cyan | #00F5FF |
| Political events | Royal purple | #9B59B6 |
| Religious events | Warm orange | #FF8C00 |
| Trade/economic events | Emerald green | #2ECC71 |
| Natural disasters | Bright coral | #FF6B6B |
| Highlight/selected | White with glow | #FFFFFF |
| Text primary | Near-white | #E8E8E8 |
| Text secondary | Muted gray | #8888AA |

---

## 6. Synthesized Recommendations for Time Scroll

### The Globe

1. **Use globe.gl or three-globe as the foundation** -- proven library handling projections, arcs, and orbit controls. Customize visuals on top.
2. **5-layer architecture** (steal from GitHub Globe):
   - Atmosphere/halo (custom shader, gradient backface sphere)
   - Ocean sphere (semi-transparent, dark blue-black)
   - Land masses (~12,000 dots via golden-angle distribution or sunflower spiral)
   - Event markers (dots, pulses, icons based on zoom level)
   - Connection arcs (trade routes, migrations, conquests)
3. **Timezone-based initial rotation** -- center the globe on the user's location on first load
4. **SVG placeholder during WebGL load** -- instant visual, crossfade to real globe
5. **Progressive quality degradation** -- 4 tiers based on FPS monitoring

### The Timeline

6. **The timeline IS the primary navigation** -- not a sidebar, not a filter. It should feel like a musical instrument (scrub, drag, tap).
7. **Exponential scaling** (steal from Histography) -- 1 year per step near present, 1000 years per step in ancient history
8. **Scrollytelling for guided narratives** -- optional "story mode" that flies the user through curated historical paths with text + visuals
9. **Ambient motion always** -- even idle, dots should subtly twinkle, arcs should gently pulse, the globe should barely rotate

### The Markers

10. **Zoom-dependent marker rendering:**
    - Zoomed out: small colored dots, clustered, category-coded by color
    - Mid zoom: larger dots with mini-icon overlays (sword for battles, crown for rulers)
    - Zoomed in: rich card popups with image, title, date, description
11. **Smart hover radius** (steal from Histography) -- don't require pixel-perfect clicks. Pick the most "important" event near the cursor.
12. **Impact rings for major events** (steal from GitHub Globe) -- when a major event triggers, a ring scales outward and fades. World wars, revolutions, discoveries get visual emphasis.
13. **Animated clustering** -- clusters should breathe apart and recombine smoothly, never snap

### The Event Cards / Popups

14. **Bottom-docked cards on mobile** (not floating popups)
15. **Rich content:** hero image, title, date, 2-line summary, "Read more" expansion, Wikipedia link
16. **Only one card open at a time** -- new selection auto-dismisses previous
17. **Hover preview (desktop):** concise tooltip with title + date + category icon before clicking

### The Dark Theme

18. **Dark map = canvas, events = content.** The map should whisper, the events should shout.
19. **Glow/bloom effects** on markers against dark backgrounds for visual depth
20. **Category-coded colors that are bright and saturated** (see palette above)
21. **Atmospheric globe effects** -- halo, fog, subtle gradient lighting

### What Makes Users WANT to Explore

22. **Serendipity:** Random fascinating events surfaced on load ("Did you know?")
23. **Connected events:** Visual arcs showing cause-and-effect across geography
24. **Time-lapse mode:** Press play and watch borders shift, empires rise and fall, trade routes animate
25. **Personal anchoring:** "What was happening everywhere in the world when [user's birth year]?"
26. **Visual density as engagement:** A globe covered in twinkling event dots feels rich and inviting. An empty globe with sparse markers feels dead.
27. **Sound design:** Subtle ambient audio that shifts with era -- ancient = sparse percussion, modern = layered complexity
28. **The "zoom into chaos" moment:** Zooming into a region/era should reveal MORE, not less. Fractal-like information density.

---

## Sources

### Interactive History Maps
- [Chronas](https://www.chronas.org/)
- [Histography](https://histography.io/)
- [GeaCron](http://geacron.com/home-en/)
- [Historica](https://www.historica.org/)
- [Ostellus Atlas](https://atlas.ostellus.com/)
- [OpenHistoricalMap](https://www.openhistoricalmap.org/)
- [HistoryMaps](https://history-maps.com/)
- [Timemaps](https://timemaps.com/)
- [Chronos Timeline](https://timelineofhistory.com/en)

### Globe Implementations
- [GitHub Globe Technical Blog](https://github.blog/engineering/engineering-principles/how-we-built-the-github-globe/)
- [Stripe Globe Blog](https://stripe.com/blog/globe)
- [COBE - 5KB Globe](https://github.com/shuding/cobe)
- [Globe.GL](https://globe.gl/)
- [three-globe](https://github.com/vasturiano/three-globe)
- [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- [CesiumJS](https://cesium.com/platform/cesiumjs/)
- [Cesium Stories](https://cesium.com/platform/cesium-ion/cesium-stories/)
- [Google 3D Storytelling](https://developers.google.com/maps/architecture/3d-storytelling-getting-started)

### Map UI Patterns
- [Map UI Patterns - Markers](https://mapuipatterns.com/marker/)
- [Map UI Patterns - Cluster Markers](https://mapuipatterns.com/cluster-marker/)
- [Map UI Patterns - Info Popup](https://mapuipatterns.com/info-popup/)
- [Eleken - Map UI Design Best Practices](https://www.eleken.co/blog-posts/map-ui-design)
- [BricxLabs - Map UI Design Patterns](https://bricxlabs.com/blogs/map-ui-design-patterns-examples)
- [Mobbin - Map Pin Design](https://mobbin.com/glossary/map-pin)
- [Google Maps - Animated Markers](https://developers.google.com/maps/documentation/javascript/examples/advanced-markers-animation)

### Scrollytelling & Timeline Design
- [Smashing Magazine - Histography Interview](https://www.smashingmagazine.com/2016/09/interview-with-matan-stauber/)
- [Adobe Blog - Histography Design](https://blog.adobe.com/en/publish/2015/12/03/data-meets-design)
- [Scrollytelling Guide 2025](https://ui-deploy.com/blog/complete-scrollytelling-guide-how-to-create-interactive-web-narratives-2025)
- [Best Scrollytelling Examples 2026](https://www.maglr.com/blog/best-scrollytelling-examples)
- [Alliance Interactive - Timeline Examples](https://www.allianceinteractive.com/blog/best-website-timeline-examples-and-design-tips/)
- [Awesome Interactive Journalism (GitHub)](https://github.com/wbkd/awesome-interactive-journalism)

### Dark Theme & Data Visualization
- [Mapbox Dark Style](https://www.mapbox.com/maps/dark)
- [Mapbox - Light and Dark Maps for Data Viz](https://blog.mapbox.com/light-and-dark-maps-for-data-visualization-3c4aed88b2e8)
- [Carbon Design System - Color Palettes](https://carbondesignsystem.com/data-visualization/color-palettes/)
- [Cloudscape - Data Vis Colors](https://cloudscape.design/foundation/visual-foundation/data-vis-colors/)
- [Datawrapper - Colors in Data Vis](https://blog.datawrapper.de/colors-for-data-vis-style-guides/)

### Real-Time Map Apps
- [Flightradar24](https://www.flightradar24.com/)
- [Flightradar24 - Data Display Engineering](https://www.flightradar24.com/blog/inside-flightradar24/supercharging-flightradar24s-data-display/)
- [MarineTraffic](https://www.marinetraffic.com/)
- [Windy](https://www.windy.com/)
- [UXPin - Map UI Layouts](https://www.uxpin.com/studio/blog/map-ui/)
