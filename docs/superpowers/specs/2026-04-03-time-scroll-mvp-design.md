# Time Scroll MVP — Design Specification

**Date:** 2026-04-03
**Authors:** Georges Simak, Lycia Narimane Djemili
**Status:** Approved

---

## 1. Product Vision

An interactive historical timeline PWA where users explore world history on a 3D globe. Users scrub through ~12,000 years of history (10,000 BCE to present), watching political boundaries morph, discovering historical events pinned to locations, and seeing landmark reconstructions animate through time.

**Platform:** Progressive Web App (desktop + mobile browsers, installable)
**Pivot:** Originally a Unity game, now a browser-native 3D experience.

---

## 2. Architecture

### 2.1 Monorepo Structure

```
time-scroll/
├── frontend/                    # React 19 + TypeScript + Vite
│   ├── public/
│   │   ├── assets/
│   │   │   ├── rive/            # .riv animation files
│   │   │   ├── geo/             # TopoJSON boundary files (by era)
│   │   │   └── images/          # Static images
│   │   ├── manifest.json        # PWA manifest
│   │   └── sw.js                # Service worker (Workbox-generated)
│   ├── src/
│   │   ├── app/
│   │   │   ├── routes.tsx       # React Router v7 route definitions
│   │   │   ├── providers.tsx    # App-level providers
│   │   │   └── App.tsx          # Thin shell: providers + router outlet
│   │   ├── features/
│   │   │   ├── globe/           # Mapbox GL globe + boundary rendering
│   │   │   │   ├── GlobeView.tsx
│   │   │   │   ├── BoundaryLayer.tsx
│   │   │   │   ├── useMapbox.ts
│   │   │   │   └── globe.utils.ts
│   │   │   ├── timeline/        # Time navigation
│   │   │   │   ├── TimelineScrubber.tsx
│   │   │   │   ├── EraPicker.tsx
│   │   │   │   ├── YearDisplay.tsx
│   │   │   │   └── timeline.utils.ts
│   │   │   ├── events/          # Historical event system
│   │   │   │   ├── EventMarker.tsx
│   │   │   │   ├── EventDetail.tsx
│   │   │   │   ├── EventList.tsx
│   │   │   │   └── events.api.ts
│   │   │   ├── landmarks/       # Rive animations overlaid on globe
│   │   │   │   ├── LandmarkOverlay.tsx
│   │   │   │   ├── PyramidAnimation.tsx
│   │   │   │   ├── ColosseumAnimation.tsx
│   │   │   │   └── landmark.utils.ts
│   │   │   ├── exploration/     # Location discovery
│   │   │   │   ├── LocationCard.tsx
│   │   │   │   └── ExplorationPanel.tsx
│   │   │   └── onboarding/      # Landing + intro
│   │   │       ├── LandingPage.tsx
│   │   │       └── IntroSequence.tsx
│   │   ├── shared/
│   │   │   ├── components/      # Design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── IconButton.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useViewport.ts
│   │   │   │   ├── useDebounce.ts
│   │   │   │   └── useMediaQuery.ts
│   │   │   ├── stores/          # Zustand stores
│   │   │   │   ├── timeStore.ts
│   │   │   │   ├── mapStore.ts
│   │   │   │   ├── eventsStore.ts
│   │   │   │   ├── uiStore.ts
│   │   │   │   └── landmarkStore.ts
│   │   │   ├── types/
│   │   │   │   ├── events.ts
│   │   │   │   ├── timeline.ts
│   │   │   │   ├── locations.ts
│   │   │   │   └── landmarks.ts
│   │   │   └── utils/
│   │   │       ├── geo.ts
│   │   │       ├── format.ts
│   │   │       └── constants.ts
│   │   ├── styles/
│   │   │   ├── tokens.css       # CSS custom properties (design tokens)
│   │   │   └── globals.css      # Reset + Tailwind + global styles
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                     # NestJS + TypeORM + PostgreSQL
│   └── src/
│       ├── modules/
│       │   ├── events/
│       │   │   ├── events.controller.ts
│       │   │   ├── events.service.ts
│       │   │   ├── events.module.ts
│       │   │   └── dto/
│       │   ├── boundaries/
│       │   │   ├── boundaries.controller.ts
│       │   │   ├── boundaries.service.ts
│       │   │   └── boundaries.module.ts
│       │   ├── locations/
│       │   │   ├── locations.controller.ts
│       │   │   ├── locations.service.ts
│       │   │   └── locations.module.ts
│       │   └── health/
│       │       └── health.controller.ts
│       ├── entities/
│       │   ├── event.entity.ts
│       │   ├── location.entity.ts
│       │   ├── era.entity.ts
│       │   └── landmark.entity.ts
│       ├── database/
│       │   ├── database.module.ts
│       │   ├── migrations/
│       │   └── seeds/
│       │       └── seed.ts       # Seed 30+ historical events
│       └── app.module.ts
└── package.json                 # Root workspace config
```

### 2.2 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.x |
| Language | TypeScript | 5.8+ |
| Build Tool | Vite | 6.x |
| Globe Rendering | Mapbox GL JS | 3.12+ |
| Animations | @rive-app/react-webgl2 | 4.x |
| UI Animations | Framer Motion | 12.x |
| State Management | Zustand | 5.x |
| Routing | React Router | 7.x |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | latest |
| Backend | NestJS | 11.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16+ |
| PWA | Workbox | 7.x |
| 3D (post-MVP) | @react-three/fiber | 9.x |

### 2.3 State Management — Zustand Stores

**timeStore:**
- `currentYear: number` (-10000 to 2023)
- `currentEra: Era`
- `isPlaying: boolean`
- `playbackSpeed: number`
- `setYear(year)`, `nextEra()`, `prevEra()`, `togglePlay()`

**mapStore:**
- `viewport: { center, zoom, bearing, pitch }`
- `selectedLocationId: string | null`
- `boundaryYear: number` (may differ from currentYear during transitions)
- `flyTo(location)`, `resetView()`

**eventsStore:**
- `events: HistoricalEvent[]`
- `selectedEventId: string | null`
- `filters: EventFilters`
- `visibleEvents: HistoricalEvent[]` (computed)
- `fetchEvents()`, `selectEvent(id)`, `setFilters()`

**uiStore:**
- `activePanel: 'none' | 'events' | 'exploration' | 'settings'`
- `isModalOpen: boolean`
- `isMobile: boolean`
- `theme: 'dark'`

**landmarkStore:**
- `activeLandmarks: LandmarkState[]`
- `shouldShowLandmark(id, zoom, position): boolean`

### 2.4 Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage | Onboarding, intro sequence |
| `/explore` | GlobeExplorer | Main experience, defaults to current era |
| `/explore/:year` | GlobeExplorer | Globe at specific year |
| `/explore/:year/:locationId` | GlobeExplorer | Year + location focused |
| `/event/:eventId` | EventDetail | Deep-linkable event view |

---

## 3. UI/UX Design Direction

### 3.1 Design Philosophy

**"The globe IS the interface."** Minimal chrome. UI elements float over the globe and recede when not in use. The experience should feel cinematic and immersive — like exploring a living history museum, not using a software tool.

### 3.2 Design Tokens

**Colors:**
- `--bg-void`: #030712 (near-black, the cosmos)
- `--bg-surface`: #0f1729 (dark navy, panels)
- `--bg-elevated`: #1a2742 (raised elements)
- `--border-subtle`: rgba(255,255,255,0.06)
- `--border-active`: rgba(255,255,255,0.12)
- `--text-primary`: #f1f5f9 (off-white)
- `--text-secondary`: #94a3b8 (muted)
- `--accent-gold`: #f59e0b (timeline, highlights)
- `--accent-cyan`: #06b6d4 (interactive elements)
- `--accent-era-*`: per-era accent colors (7 colors)

**Typography:**
- Headings: Inter, 600/700 weight
- Body: Inter, 400 weight
- Mono/data: JetBrains Mono (year displays, coordinates)

**Spacing:** 4px base unit, scale: 4/8/12/16/20/24/32/48/64

**Elevation:** Glassmorphism with backdrop-blur, layered shadows

### 3.3 Key UI Components

**Timeline Scrubber (bottom of screen):**
- Full-width horizontal bar, floating above globe
- Thumb shows current year in large monospace type
- Era segments visible as colored regions
- Drag to scrub, tap era to jump
- Play/pause button for auto-advance
- Mobile: larger touch target, haptic feedback zones

**Era Transition:**
- Full-screen color wash + blur when crossing era boundaries
- Era name appears center-screen in large editorial type
- 800ms transition, eases out

**Event Markers:**
- Minimal dot on globe, expands on hover
- Click opens bottom sheet (mobile) or side panel (desktop)
- Clustered when zoomed out, individual when zoomed in

**Exploration Panel:**
- Slide-in panel from right (desktop) or bottom sheet (mobile)
- Location cards with thumbnail, name, era range
- Tap to fly camera to location

**Landing Page:**
- Full-screen dark void with subtle star particles
- Globe fades in from distance
- "Explore History" CTA
- Smooth transition into main experience (no hard page swap)

---

## 4. Data Model

### 4.1 Core Entities

```typescript
interface Era {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  accentColor: string;
}

interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  year: number;
  endYear?: number;
  eraId: string;
  latitude: number;
  longitude: number;
  category: 'war' | 'discovery' | 'cultural' | 'political' | 'construction' | 'natural';
  imageUrl?: string;
  sources?: string[];
}

interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  defaultZoom: number;
  availableEras: string[];
}

interface Landmark {
  id: string;
  name: string;
  locationId: string;
  riveFile: string;
  triggerZoom: number;
  triggerRadius: number;
  timePeriods: {
    name: string;
    startYear: number;
    endYear: number;
    animation: string;
  }[];
}
```

### 4.2 Database Schema (PostgreSQL)

```sql
CREATE TABLE eras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  start_year INT NOT NULL,
  end_year INT NOT NULL,
  description TEXT,
  accent_color VARCHAR(7)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  year INT NOT NULL,
  end_year INT,
  era_id UUID REFERENCES eras(id),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  country VARCHAR(100),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  description TEXT,
  default_zoom DECIMAL(4, 2) DEFAULT 5.0,
  available_eras UUID[] DEFAULT '{}'
);

CREATE TABLE landmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  location_id UUID REFERENCES locations(id),
  rive_file VARCHAR(255) NOT NULL,
  trigger_zoom DECIMAL(4, 2) NOT NULL,
  trigger_radius INT NOT NULL,
  time_periods JSONB NOT NULL
);

CREATE INDEX idx_events_year ON events(year);
CREATE INDEX idx_events_era ON events(era_id);
CREATE INDEX idx_events_location ON events USING GIST (
  ST_MakePoint(longitude, latitude)
);
```

### 4.3 API Endpoints

```
GET  /api/eras                           → Era[]
GET  /api/events?era=&year=&category=    → HistoricalEvent[]
GET  /api/events/:id                     → HistoricalEvent
GET  /api/locations                      → Location[]
GET  /api/locations/:id                  → Location
GET  /api/landmarks                      → Landmark[]
GET  /api/boundaries/:year               → TopoJSON file redirect
GET  /api/health                         → { status: 'ok' }
```

---

## 5. Asset Strategy

### 5.1 GeoJSON → TopoJSON

64 GeoJSON boundary files converted to TopoJSON (40-50% size reduction). Lazy-loaded by era — only fetch boundaries near the current year.

Source: `C:\Users\33769\Desktop\Projects\TIME MACHINE\geojson\`

### 5.2 Rive Animations

Copied directly from prototype — already web-optimized:
- `pyramid_building.riv` (61KB)
- `pyramid_finished.riv` (33KB)
- `colosseum.riv` (111KB)

Source: `C:\Users\33769\Desktop\Projects\TIME MACHINE\Time Machine Ceisum Web Version\time-scroll\public\assets\rive\`

### 5.3 Earth Textures (Post-MVP)

Multi-resolution KTX2 pipeline for globe texture:
- 1K (mobile fallback): ~0.5MB
- 2K (mobile default): ~2MB
- 4K (desktop): ~8MB

Source: `C:\Users\33769\Desktop\Projects\TIME MACHINE\Time machine map textures\`

### 5.4 3D Landmark Models (Post-MVP)

FBX → GLB conversion via gltf-transform + MeshOpt compression:
- Eiffel Tower: `SC_Bld_EiffelTower.fbx`
- Statue of Liberty: `SC_Bld_StatueOfLiberty.fbx`

Source: `C:\Users\33769\Desktop\Projects\TIME MACHINE\`

---

## 6. PWA Configuration

### 6.1 Web App Manifest

```json
{
  "name": "Time Scroll",
  "short_name": "TimeScroll",
  "description": "Journey through 12,000 years of world history",
  "start_url": "/explore",
  "display": "standalone",
  "background_color": "#030712",
  "theme_color": "#030712",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 6.2 Caching Strategy (Workbox)

| Asset | Strategy | TTL |
|-------|----------|-----|
| App shell (HTML/JS/CSS) | Precache | Build-time |
| Rive animations (.riv) | Cache-First | 30 days |
| TopoJSON boundaries | Cache-First | 30 days |
| API responses | Stale-While-Revalidate | 1 hour |
| Images | Cache-First | 7 days |

---

## 7. MVP Scope

### In Scope
1. 3D Globe with historical boundaries (morph on time change)
2. Timeline scrubber (10,000 BCE → 2023)
3. 7 eras with cinematic transitions
4. 30+ seeded historical events with detail views
5. Event markers on globe
6. Pyramid + Colosseum Rive animations
7. Location discovery panel
8. Cinematic landing page + onboarding
9. PWA (installable, offline shell)
10. Responsive (mobile + desktop)
11. URL-based routing (shareable links)
12. NestJS API + PostgreSQL database

### Out of Scope (Post-MVP)
- User accounts / authentication
- 3D landmark models (GLB)
- Real-time multiplayer (Socket.IO)
- Search / advanced filtering
- Educational tools / quizzes
- Mascot character
- Custom earth textures (KTX2)
- Push notifications

---

## 8. Seed Data

MVP ships with 30+ historical events across all 7 eras, 10+ explorable locations, and boundary data for key historical years. Events sourced from prototype constants and expanded with significant world history moments.
