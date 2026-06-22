import type { EventCategory } from '@/shared/types/events';

/**
 * Single source of truth for event-category accent colors.
 *
 * These mirror the `--color-cat-*` design tokens in tokens.css. DOM styling
 * should prefer the CSS vars; this map exists for the Three.js / canvas marker
 * code that needs a raw hex string, and for components consuming a JS color
 * map. Do NOT redeclare this map in feature files — import it from here.
 *
 * Typed `Record<string, string>` (not `EventCategory`) so the many globe
 * render callbacks that index with an untyped `d.category` keep compiling.
 * Use `getCategoryColor()` when the key may not be a valid category.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
};

/** Color for a category, falling back to a neutral grey for unknown keys. */
export function getCategoryColor(category: EventCategory | string): string {
  return CATEGORY_COLORS[category] ?? '#8a8a9a';
}
