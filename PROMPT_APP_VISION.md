# Time Scroll — App Vision Prompt

---

## The Pitch

**Time Scroll** is an interactive historical atlas where users explore 12,000 years of human civilization on a 3D globe. Think Google Earth meets a history documentary — you scrub through time and watch the world change.

## Core Experience

The globe IS the interface. There's no sidebar full of menus. You see a 3D Earth, and at the bottom is a timeline spanning from 10,000 BCE to 2024 CE. As you drag the timeline:

- **Political boundaries morph** — empires rise and fall, borders shift
- **Historical events appear** as markers on the globe — wars, discoveries, constructions, cultural milestones
- **Landmarks animate** — watch the Pyramids being built, the Colosseum go from construction to completion (Rive vector animations)
- **Era transitions** trigger cinematic full-screen color washes when you cross into a new period

The 7 eras (Prehistory, Ancient World, Classical Antiquity, Medieval, Renaissance, Industrial, Modern) each have their own accent color, soundtrack feel, and visual identity.

## What Users Do

1. **Land on a cinematic homepage** — choose a starting era or jump straight in
2. **Explore the globe** — rotate, zoom, fly to locations (Rome, Athens, Cairo, Beijing, Istanbul...)
3. **Scrub through time** — drag the timeline or hit play to auto-advance at 50 years/second
4. **Discover events** — tap markers to read about the Great Pyramid, the Fall of Rome, the Moon Landing, and 25+ other historical moments
5. **See landmarks come alive** — zoom into the Pyramids of Giza and see the Rive animation of their construction phase vs. their completed form

## Design Philosophy

- **Cinematic, not utilitarian** — dark glassmorphic UI, era-specific glow colors, smooth animations. It should feel like exploring a living history museum, not using Wikipedia.
- **Minimal chrome** — UI elements float over the globe and stay out of the way. The 3D experience is front and center.
- **Mobile-first PWA** — works on phones, tablets, and desktops. Installable as a progressive web app.

## Tech Stack

- **3D Globe**: react-globe.gl (Three.js) with TopoJSON political boundaries
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Zustand
- **Animations**: Rive (@rive-app/react-webgl2) for landmark animations
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Data**: 64 GeoJSON boundary files (10,000 BCE to 2010 CE), 28 seed events, 10 key locations, 2 animated landmarks

## Current State (MVP)

Working prototype with:
- Full 3D globe with era-morphing boundaries
- Timeline scrubber with playback controls
- 28 historical events with detail sheets
- 10 explorable locations
- 2 animated landmarks (Pyramids, Colosseum)
- Cinematic landing page with era selector
- Responsive design (mobile/tablet/desktop)

## Roadmap

- Scale from 28 to 500+ events
- Scale from 2 to 100+ animated landmarks
- AI-powered historical guide/narrator
- User accounts and saved explorations
- Multiplayer timeline sessions
- Native mobile apps

## Who It's For

History enthusiasts, students, educators, and anyone who's ever wondered "what did the world look like in 1200 CE?" — delivered as an immersive experience, not a textbook.

## Created By

Georges Simak & Lycia Narimane Djemili. Originally conceived as a Unity game, pivoted to the web for broader accessibility.
