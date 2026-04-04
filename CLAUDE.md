# Time Scroll - Project Instructions

## MANDATORY: Design System Compliance

**Before writing or modifying ANY UI code, you MUST:**

1. Read `DESIGN_SYSTEM.md` at the project root
2. Use ONLY the values defined in that file for all sizing, spacing, padding, typography, and component dimensions
3. If a value you need is not in the design system, ASK the user before inventing one
4. NEVER use ad-hoc pixel values, Tailwind spacing classes, or "eyeballed" sizes that aren't in the design system

**After modifying UI code:**

1. Cross-check every size/padding/margin against `DESIGN_SYSTEM.md`
2. If any value doesn't match, fix it before presenting the work as done

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (with `@theme` tokens in `frontend/src/styles/tokens.css`)
- Framer Motion for animations
- react-globe.gl + Three.js for the 3D globe
- Zustand for state management
- React Router v7 for routing
- Lucide React for icons

## Project Structure

```
frontend/
  src/
    app/          — App shell, providers, routes
    features/     — Feature modules (globe, timeline, exploration, events, onboarding, landmarks)
    shared/       — Shared components, stores, utils, hooks
    styles/       — Global CSS + design tokens
```

## Code Conventions

- Use hex values (not CSS variables) for any color passed to Three.js / WebGL
- All colors defined in `tokens.css` as Tailwind `@theme` values
- Glass effects use `.glass`, `.glass-strong`, `.glass-light` CSS classes
- Interactive elements must have `cursor-pointer` and hover/active states
- Minimum touch target: 44px (per design system)
