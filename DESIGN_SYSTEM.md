# Time Scroll Design System

> **This file is the single source of truth for all UI dimensions.**
> Every component MUST use values from this file. No ad-hoc sizing.

---

## Spacing Scale (base: 4px)

| Token  | Value | Use for                        |
|--------|-------|--------------------------------|
| `xs`   | 4px   | Icon gaps, tight inner padding |
| `sm`   | 8px   | Between related elements       |
| `md`   | 12px  | Component inner padding        |
| `lg`   | 16px  | Section padding, card padding  |
| `xl`   | 24px  | Panel padding, major gaps      |
| `2xl`  | 32px  | Section separation             |
| `3xl`  | 48px  | Page-level vertical spacing    |

---

## Component Sizes

### Buttons

| Type            | Height | Min Width | Padding (px/py) | Icon Size | Font Size | Border Radius |
|-----------------|--------|-----------|-----------------|-----------|-----------|---------------|
| **Small**       | 36px   | -         | 16px / 8px      | 16px      | 13px      | 8px           |
| **Medium**      | 44px   | -         | 20px / 10px     | 18px      | 14px      | 10px          |
| **Large**       | 52px   | -         | 28px / 12px     | 20px      | 16px      | 12px          |
| **Icon-only**   | 44px   | 44px      | centered        | 20px      | -         | 10px          |
| **Icon-small**  | 36px   | 36px      | centered        | 16px      | -         | 8px           |
| **Play/Pause**  | 56px   | 56px      | centered        | 24px      | -         | full (50%)    |
| **Skip (prev/next)** | 44px | 44px  | centered        | 18px      | -         | full (50%)    |

### Toolbar Buttons (left sidebar)

| Property        | Value  |
|-----------------|--------|
| Button size     | 44px x 44px |
| Icon size       | 20px   |
| Border radius   | 12px   |
| Container padding | 8px  |
| Gap between buttons | 4px |
| Tooltip offset  | 12px from button edge |

### Cards (Era selector, event list items)

| Property        | Value     |
|-----------------|-----------|
| Padding         | 20px horizontal, 16px vertical |
| Border radius   | 12px      |
| Min width (era) | 140px     |
| Gap between     | 12px      |
| Color bar       | 40px wide, 3px tall |

### Panels (Exploration, Event Detail)

| Property          | Value        |
|-------------------|--------------|
| Inner padding     | 20px         |
| Header gap        | 12px bottom  |
| Item padding      | 12px         |
| Item icon box     | 36px x 36px  |
| Item gap          | 12px         |
| Border radius     | 16px         |
| Width (desktop)   | 320px (lg: 360px) |

### Timeline Scrubber (bottom bar)

| Property              | Value          |
|-----------------------|----------------|
| Outer padding (from viewport edge) | 24px all sides |
| Inner padding (top row) | 24px horizontal, 20px top, 16px bottom |
| Inner padding (track row) | 24px horizontal, 20px bottom |
| Track height          | 12px           |
| Thumb width           | 16px           |
| Thumb height          | 22px           |
| Border radius (container) | 16px       |
| Gap between controls  | 12px           |

---

## Typography

| Element          | Size   | Weight | Line Height | Letter Spacing |
|------------------|--------|--------|-------------|----------------|
| Year display (desktop) | 48px | 700 | 1.0 | 0.05em (tracking-widest) |
| Year display (tablet)  | 36px | 700 | 1.0 | 0.05em |
| Year display (mobile)  | 30px | 700 | 1.0 | 0.05em |
| Era name         | 18px   | 600    | tight       | 0.025em        |
| Era description  | 14px   | 400    | relaxed     | normal         |
| Panel heading    | 14px   | 600    | normal      | normal         |
| List item title  | 14px   | 500    | normal      | normal         |
| List item meta   | 11px   | 400    | normal      | normal         |
| Badge/count      | 10px   | 500    | 1.0         | normal         |
| Tooltip          | 11px   | 500    | 1.0         | normal         |
| Landing title    | 72px / 96px / 128px (sm/md/lg) | 700 | 1.0 | -0.03em |
| Landing subtitle | 18px   | 300    | 1.7         | normal         |
| Landing label    | 13px   | 500    | 1.0         | 0.15em         |

### Font Families

| Token            | Family         | Use for                                   |
|------------------|----------------|-------------------------------------------|
| `--font-sans`    | Inter          | Body text, UI labels                      |
| `--font-display` | Space Grotesk  | Headings, titles, year display, nav, CTAs |
| `--font-mono`    | JetBrains Mono | Years, coordinates, counts                |

Use the token (`var(--font-display)` or the `font-display` utility) — never a hardcoded `'Space Grotesk', sans-serif` string in component code.

---

## Responsive Breakpoints

| Name    | Min Width | Notes                     |
|---------|-----------|---------------------------|
| Mobile  | 0px       | Single column, bottom sheets |
| Tablet  | 640px (sm)| Side panels appear        |
| Desktop | 768px (md)| Full layout               |
| Wide    | 1024px (lg)| Wider panels             |

---

## Glass Effects

| Variant        | Background opacity | Blur  | Border              |
|----------------|-------------------|-------|---------------------|
| `glass`        | 0.65              | 24px  | border-subtle       |
| `glass-strong` | 0.90              | 40px  | border-active       |
| `glass-light`  | 0.50              | 16px  | border-subtle       |

**Always use the `.glass` / `.glass-strong` / `.glass-light` classes** — never re-implement glass inline with `backdropFilter: blur(...)` + a glass-bg var. Inline copies drift from these values (e.g. `glass-strong-bg` paired with a 24px blur reads as weak frost).

---

## Interaction States

| State    | Transform       | Transition          |
|----------|-----------------|---------------------|
| Hover    | scale(1.05)     | 200ms ease-out      |
| Active   | scale(0.95)     | 100ms               |
| Focus    | ring-2 full-opacity accent + ring-offset-2 ring-offset-void | instant |

---

## Rules

1. **Never hardcode a size that isn't in this file.** If a new size is needed, add it here first.
2. **Padding is always generous.** When in doubt, go larger.
3. **Buttons must always have visible padding** — never rely on just width/height with centered content. The clickable area must be obvious.
4. **Minimum touch target: 44px** for any interactive element.
5. **All interactive elements need hover + active states.**
6. **Test at 1440x900** as the primary desktop viewport.
7. **Focus rings must use full color opacity** (never `/50` or `/30`) **paired with `ring-offset-2 ring-offset-void`.** A `/50`-opacity ring computes to ~2.4:1 against dark backgrounds, below the WCAG 1.4.11 3:1 minimum; full opacity gets ~6.3:1. See `IconButton.tsx` for the reference implementation.
