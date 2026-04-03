# Time Scroll MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality PWA where users explore 12,000 years of world history on an interactive 3D globe with time-scrubbing, historical boundaries, event markers, and landmark animations.

**Architecture:** React 19 + TypeScript frontend with Mapbox GL globe, Zustand state management, React Router v7, Rive animations, and Tailwind CSS v4. NestJS backend with PostgreSQL. Assets ported from existing prototype in TIME MACHINE folder.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Mapbox GL JS 3.12, Zustand 5, React Router 7, Tailwind CSS 4, Framer Motion 12, @rive-app/react-webgl2, Lucide React, NestJS 11, TypeORM 0.3, PostgreSQL 16, Workbox 7

---

## Task 1: Project Scaffolding

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/index.html`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/vite-env.d.ts`
- Create: `frontend/.env.example`
- Create: `.gitignore`
- Create: `package.json` (root workspace)

- [ ] **Step 1: Create root package.json for workspace**

```json
{
  "name": "time-scroll",
  "private": true,
  "workspaces": ["frontend", "backend"]
}
```

- [ ] **Step 2: Scaffold frontend with Vite**

```bash
cd frontend
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 3: Install frontend dependencies**

```bash
cd frontend
npm install react@19 react-dom@19 react-router@7 zustand@5 mapbox-gl@3 @rive-app/react-webgl2 framer-motion@12 lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot
npm install -D tailwindcss@4 @tailwindcss/vite @types/mapbox-gl typescript@5
```

- [ ] **Step 4: Configure Vite**

`frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mapbox: ['mapbox-gl'],
          rive: ['@rive-app/react-webgl2'],
          vendor: ['react', 'react-dom', 'react-router', 'zustand', 'framer-motion'],
        },
      },
    },
  },
});
```

- [ ] **Step 5: Configure TypeScript**

`frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite-env.d.ts"]
}
```

- [ ] **Step 6: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#030712" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="description" content="Journey through 12,000 years of world history on an interactive 3D globe" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css" rel="stylesheet" />
    <title>Time Scroll</title>
  </head>
  <body class="bg-void text-primary antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create .env.example and .gitignore**

`.env.example`:
```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

`.gitignore`:
```
node_modules/
dist/
.env
.env.local
*.local
.DS_Store
```

- [ ] **Step 8: Verify dev server starts**

```bash
cd frontend && npm run dev
```

Expected: Vite dev server starts on http://localhost:5173

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: scaffold frontend with Vite, React 19, TypeScript, Tailwind v4"
```

---

## Task 2: Design System — Tokens, Globals, Primitives

**Files:**
- Create: `frontend/src/styles/tokens.css`
- Create: `frontend/src/styles/globals.css`
- Create: `frontend/src/shared/components/Button.tsx`
- Create: `frontend/src/shared/components/Card.tsx`
- Create: `frontend/src/shared/components/Modal.tsx`
- Create: `frontend/src/shared/components/IconButton.tsx`
- Create: `frontend/src/shared/components/index.ts`
- Create: `frontend/src/shared/utils/cn.ts`

- [ ] **Step 1: Create design tokens**

`frontend/src/styles/tokens.css`:
```css
@theme {
  --color-void: #030712;
  --color-surface: #0f1729;
  --color-elevated: #1a2742;
  --color-overlay: rgba(3, 7, 18, 0.85);

  --color-border-subtle: rgba(255, 255, 255, 0.06);
  --color-border-active: rgba(255, 255, 255, 0.12);

  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  --color-accent-gold: #f59e0b;
  --color-accent-cyan: #06b6d4;
  --color-accent-rose: #f43f5e;

  --color-era-prehistory: #78716c;
  --color-era-ancient: #d97706;
  --color-era-classical: #dc2626;
  --color-era-medieval: #7c3aed;
  --color-era-renaissance: #2563eb;
  --color-era-industrial: #65a30d;
  --color-era-modern: #06b6d4;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
}
```

- [ ] **Step 2: Create globals.css**

`frontend/src/styles/globals.css`:
```css
@import 'tailwindcss';
@import './tokens.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-void);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* Glassmorphism utility */
.glass {
  background: rgba(15, 23, 41, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-subtle);
}

.glass-strong {
  background: rgba(15, 23, 41, 0.85);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid var(--color-border-active);
}

/* Mapbox overrides */
.mapboxgl-ctrl-attrib,
.mapboxgl-ctrl-logo {
  display: none !important;
}

.mapboxgl-ctrl-group {
  background: rgba(15, 23, 41, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border-subtle) !important;
  border-radius: var(--radius-md) !important;
}

.mapboxgl-ctrl-group button {
  border-color: var(--color-border-subtle) !important;
}

.mapboxgl-ctrl-group button + button {
  border-top-color: var(--color-border-subtle) !important;
}

.mapboxgl-ctrl-group button span {
  filter: invert(1);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-active);
  border-radius: var(--radius-full);
}
```

- [ ] **Step 3: Create cn utility**

`frontend/src/shared/utils/cn.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Create Button component**

`frontend/src/shared/components/Button.tsx`:
```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-accent-cyan text-void hover:bg-accent-cyan/90 shadow-lg shadow-accent-cyan/20',
        secondary: 'glass text-text-primary hover:bg-elevated/80',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-elevated/50',
        gold: 'bg-accent-gold text-void hover:bg-accent-gold/90 shadow-lg shadow-accent-gold/20',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';
```

- [ ] **Step 5: Create Card component**

`frontend/src/shared/components/Card.tsx`:
```tsx
import { type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid';
}

export function Card({ className, variant = 'glass', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] p-4',
        variant === 'glass' ? 'glass' : 'bg-surface border border-border-subtle',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Create Modal component**

`frontend/src/shared/components/Modal.tsx`:
```tsx
import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Modal({ open, onClose, children, className, title }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'fixed z-50 glass-strong rounded-[var(--radius-xl)] shadow-2xl',
              'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto',
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-4 pb-0">
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              <IconButton icon={X} onClick={onClose} className="ml-auto" />
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 7: Create IconButton component**

`frontend/src/shared/components/IconButton.tsx`:
```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 18, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)]',
        'text-text-secondary hover:text-text-primary hover:bg-elevated/60',
        'transition-colors duration-150 cursor-pointer',
        className
      )}
      {...props}
    >
      <Icon size={size} />
    </button>
  )
);
IconButton.displayName = 'IconButton';
```

- [ ] **Step 8: Create barrel export**

`frontend/src/shared/components/index.ts`:
```typescript
export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';
export { IconButton } from './IconButton';
```

- [ ] **Step 9: Update main.tsx to import globals**

`frontend/src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { App } from '@/app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: design system — tokens, globals, Button, Card, Modal, IconButton"
```

---

## Task 3: Shared Types & Constants

**Files:**
- Create: `frontend/src/shared/types/timeline.ts`
- Create: `frontend/src/shared/types/events.ts`
- Create: `frontend/src/shared/types/locations.ts`
- Create: `frontend/src/shared/types/landmarks.ts`
- Create: `frontend/src/shared/utils/constants.ts`
- Create: `frontend/src/shared/utils/geo.ts`
- Create: `frontend/src/shared/utils/format.ts`

- [ ] **Step 1: Create timeline types**

`frontend/src/shared/types/timeline.ts`:
```typescript
export interface Era {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  accentColor: string;
}

export interface TimeState {
  currentYear: number;
  currentEra: Era;
  isPlaying: boolean;
  playbackSpeed: number;
}
```

- [ ] **Step 2: Create events types**

`frontend/src/shared/types/events.ts`:
```typescript
export type EventCategory = 'war' | 'discovery' | 'cultural' | 'political' | 'construction' | 'natural';

export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  year: number;
  endYear?: number;
  eraId: string;
  latitude: number;
  longitude: number;
  category: EventCategory;
  imageUrl?: string;
  sources?: string[];
}
```

- [ ] **Step 3: Create location and landmark types**

`frontend/src/shared/types/locations.ts`:
```typescript
export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  defaultZoom: number;
  availableEras: string[];
}
```

`frontend/src/shared/types/landmarks.ts`:
```typescript
export interface LandmarkTimePeriod {
  name: string;
  startYear: number;
  endYear: number;
  riveFile: string;
  label: string;
}

export interface Landmark {
  id: string;
  name: string;
  locationId: string;
  latitude: number;
  longitude: number;
  triggerZoom: number;
  triggerRadius: number;
  timePeriods: LandmarkTimePeriod[];
}
```

- [ ] **Step 4: Create constants with eras, seed events, locations, landmarks**

`frontend/src/shared/utils/constants.ts`:
```typescript
import type { Era } from '@/shared/types/timeline';
import type { HistoricalEvent } from '@/shared/types/events';
import type { Location } from '@/shared/types/locations';
import type { Landmark } from '@/shared/types/landmarks';

export const ERAS: Era[] = [
  { id: 'prehistory', name: 'Prehistory', startYear: -10000, endYear: -3000, description: 'The dawn of human civilization, from the end of the last Ice Age to the invention of writing.', accentColor: 'var(--color-era-prehistory)' },
  { id: 'ancient', name: 'Ancient World', startYear: -3000, endYear: -500, description: 'The rise of the first great civilizations: Egypt, Mesopotamia, the Indus Valley, and China.', accentColor: 'var(--color-era-ancient)' },
  { id: 'classical', name: 'Classical Antiquity', startYear: -500, endYear: 500, description: 'The age of Greece, Rome, and the great empires that shaped Western civilization.', accentColor: 'var(--color-era-classical)' },
  { id: 'medieval', name: 'Medieval Period', startYear: 500, endYear: 1500, description: 'A millennium of feudalism, crusades, the Islamic Golden Age, and the seeds of the Renaissance.', accentColor: 'var(--color-era-medieval)' },
  { id: 'renaissance', name: 'Renaissance & Exploration', startYear: 1500, endYear: 1800, description: 'An era of artistic rebirth, scientific revolution, and global exploration.', accentColor: 'var(--color-era-renaissance)' },
  { id: 'industrial', name: 'Industrial Age', startYear: 1800, endYear: 1900, description: 'The transformation of society through machinery, steam power, and mass production.', accentColor: 'var(--color-era-industrial)' },
  { id: 'modern', name: 'Modern Era', startYear: 1900, endYear: 2024, description: 'Two world wars, the atomic age, the digital revolution, and globalization.', accentColor: 'var(--color-era-modern)' },
];

export const SEED_EVENTS: HistoricalEvent[] = [
  { id: 'great-pyramid', title: 'Great Pyramid of Giza', description: 'Construction of the Great Pyramid, one of the Seven Wonders of the Ancient World. Built as a tomb for Pharaoh Khufu, it stood 146.5 meters tall — the tallest human-made structure for over 3,800 years.', year: -2560, endYear: -2540, eraId: 'ancient', latitude: 29.9792, longitude: 31.1342, category: 'construction' },
  { id: 'code-hammurabi', title: 'Code of Hammurabi', description: 'One of the oldest known written legal codes, established by the Babylonian king Hammurabi. It contains 282 laws covering trade, property, family, and labor — an extraordinary window into ancient society.', year: -1754, eraId: 'ancient', latitude: 32.5421, longitude: 44.4209, category: 'political' },
  { id: 'trojan-war', title: 'Trojan War', description: 'The legendary conflict between the Greeks and the city of Troy, immortalized in Homer\'s Iliad. Whether myth or history, it shaped the cultural identity of the ancient Mediterranean world.', year: -1200, eraId: 'ancient', latitude: 39.9575, longitude: 26.2389, category: 'war' },
  { id: 'founding-rome', title: 'Founding of Rome', description: 'According to legend, Romulus founded Rome after killing his twin brother Remus. The city would grow to become the center of one of the largest empires in history.', year: -753, eraId: 'ancient', latitude: 41.9028, longitude: 12.4964, category: 'political' },
  { id: 'democracy-athens', title: 'Birth of Democracy', description: 'Cleisthenes introduces democratic reforms in Athens, establishing the world\'s first known democracy. Citizens could vote directly on legislation and executive bills.', year: -508, eraId: 'classical', latitude: 37.9838, longitude: 23.7275, category: 'political' },
  { id: 'roman-forum', title: 'Roman Forum Inauguration', description: 'The Roman Forum becomes the center of Roman public life — hosting triumphal processions, elections, public speeches, and commercial affairs for centuries.', year: -500, eraId: 'classical', latitude: 41.8925, longitude: 12.4853, category: 'cultural' },
  { id: 'alexander-empire', title: 'Alexander the Great\'s Empire', description: 'At just 30 years old, Alexander had created one of the largest empires in history, stretching from Greece to northwestern India.', year: -323, eraId: 'classical', latitude: 40.6401, longitude: 22.9444, category: 'political' },
  { id: 'great-wall-begin', title: 'Great Wall Construction Begins', description: 'Emperor Qin Shi Huang orders the connection and extension of existing walls to protect against northern invasions. The wall would eventually span over 21,000 kilometers.', year: -221, eraId: 'classical', latitude: 40.4319, longitude: 116.5704, category: 'construction' },
  { id: 'julius-caesar', title: 'Assassination of Julius Caesar', description: 'On the Ides of March, Julius Caesar is assassinated by a group of senators, triggering the end of the Roman Republic and the rise of the Roman Empire.', year: -44, eraId: 'classical', latitude: 41.8955, longitude: 12.4823, category: 'political' },
  { id: 'colosseum', title: 'Colosseum Completed', description: 'The Colosseum is completed under Emperor Titus. Capable of holding 50,000-80,000 spectators, it hosted gladiatorial contests, public spectacles, and dramas.', year: 80, eraId: 'classical', latitude: 41.8902, longitude: 12.4922, category: 'construction' },
  { id: 'fall-of-rome', title: 'Fall of the Western Roman Empire', description: 'The last Western Roman Emperor, Romulus Augustulus, is deposed by the Germanic chieftain Odoacer, marking the traditional end of the ancient world.', year: 476, eraId: 'classical', latitude: 41.9028, longitude: 12.4964, category: 'political' },
  { id: 'hagia-sophia', title: 'Hagia Sophia Completed', description: 'Emperor Justinian I completes the Hagia Sophia in Constantinople. For nearly a thousand years, it was the largest cathedral in the world.', year: 537, eraId: 'medieval', latitude: 41.0086, longitude: 28.9802, category: 'construction' },
  { id: 'viking-expansion', title: 'Viking Expansion Begins', description: 'Norse warriors raid Lindisfarne monastery in England, marking the beginning of the Viking Age — an era of exploration, trade, and conquest spanning three centuries.', year: 793, eraId: 'medieval', latitude: 55.6689, longitude: -1.7847, category: 'war' },
  { id: 'genghis-khan', title: 'Mongol Empire Founded', description: 'Genghis Khan unites the Mongol tribes and begins building the largest contiguous land empire in history, stretching from Korea to Eastern Europe.', year: 1206, eraId: 'medieval', latitude: 47.9184, longitude: 106.9177, category: 'political' },
  { id: 'black-death', title: 'The Black Death', description: 'The bubonic plague devastates Europe, killing an estimated 30-60% of the population. It fundamentally transforms European society, economy, and culture.', year: 1347, eraId: 'medieval', latitude: 43.7696, longitude: 11.2558, category: 'natural' },
  { id: 'gutenberg-press', title: 'Gutenberg Printing Press', description: 'Johannes Gutenberg invents the movable-type printing press, revolutionizing the spread of knowledge and laying the groundwork for the Renaissance and Reformation.', year: 1440, eraId: 'medieval', latitude: 49.9929, longitude: 8.2473, category: 'discovery' },
  { id: 'columbus-americas', title: 'Columbus Reaches the Americas', description: 'Christopher Columbus lands in the Bahamas, initiating sustained European contact with the Americas and forever changing the course of world history.', year: 1492, eraId: 'renaissance', latitude: 24.0667, longitude: -74.5167, category: 'discovery' },
  { id: 'manhattan-purchase', title: 'Purchase of Manhattan', description: 'Peter Minuit purchases Manhattan Island from the Lenape for 60 guilders. The island would become New York City, one of the most influential cities in modern history.', year: 1626, eraId: 'renaissance', latitude: 40.7128, longitude: -74.0060, category: 'political' },
  { id: 'french-revolution', title: 'French Revolution', description: 'The storming of the Bastille marks the beginning of the French Revolution, which would overthrow the monarchy and reshape political thought worldwide.', year: 1789, eraId: 'renaissance', latitude: 48.8532, longitude: 2.3692, category: 'political' },
  { id: 'steam-locomotive', title: 'First Steam Locomotive', description: 'Richard Trevithick demonstrates the first full-scale working railway steam locomotive in Wales, launching the railway age.', year: 1804, eraId: 'industrial', latitude: 51.7507, longitude: -3.3791, category: 'discovery' },
  { id: 'suez-canal', title: 'Suez Canal Opens', description: 'The Suez Canal opens, connecting the Mediterranean and Red Seas. It revolutionizes global trade by dramatically reducing shipping times between Europe and Asia.', year: 1869, eraId: 'industrial', latitude: 30.4574, longitude: 32.3499, category: 'construction' },
  { id: 'eiffel-tower', title: 'Eiffel Tower Completed', description: 'Gustave Eiffel completes the iron lattice tower for the 1889 World\'s Fair. At 300 meters, it was the tallest structure in the world until 1930.', year: 1889, eraId: 'industrial', latitude: 48.8584, longitude: 2.2945, category: 'construction' },
  { id: 'ww1', title: 'World War I Begins', description: 'The assassination of Archduke Franz Ferdinand triggers a chain of alliances that plunges Europe into the first global industrial war, killing over 17 million people.', year: 1914, eraId: 'modern', latitude: 48.2082, longitude: 16.3738, category: 'war' },
  { id: 'ww2', title: 'World War II Begins', description: 'Germany invades Poland, beginning the deadliest conflict in human history. Over 70 million people would perish before its end in 1945.', year: 1939, eraId: 'modern', latitude: 52.2297, longitude: 21.0122, category: 'war' },
  { id: 'moon-landing', title: 'Moon Landing', description: 'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon. "That\'s one small step for man, one giant leap for mankind."', year: 1969, eraId: 'modern', latitude: 28.5721, longitude: -80.6480, category: 'discovery' },
  { id: 'berlin-wall', title: 'Fall of the Berlin Wall', description: 'The Berlin Wall falls, symbolizing the end of the Cold War and the beginning of German reunification. It marks a turning point in world history.', year: 1989, eraId: 'modern', latitude: 52.5163, longitude: 13.3777, category: 'political' },
  { id: 'www-invention', title: 'World Wide Web Invented', description: 'Tim Berners-Lee proposes the World Wide Web at CERN, creating the foundation for the modern internet and transforming virtually every aspect of human society.', year: 1989, eraId: 'modern', latitude: 46.2044, longitude: 6.1432, category: 'discovery' },
];

export const LOCATIONS: Location[] = [
  { id: 'egypt', name: 'Giza, Egypt', country: 'Egypt', latitude: 29.9792, longitude: 31.1342, description: 'Home of the Great Pyramids and the Sphinx, the last surviving Wonder of the Ancient World.', defaultZoom: 6, availableEras: ['ancient', 'classical', 'medieval', 'renaissance', 'industrial', 'modern'] },
  { id: 'rome', name: 'Rome, Italy', country: 'Italy', latitude: 41.9028, longitude: 12.4964, description: 'The Eternal City — center of the Roman Republic, the Roman Empire, and the Catholic Church.', defaultZoom: 6, availableEras: ['classical', 'medieval', 'renaissance', 'industrial', 'modern'] },
  { id: 'athens', name: 'Athens, Greece', country: 'Greece', latitude: 37.9838, longitude: 23.7275, description: 'Birthplace of democracy, Western philosophy, and the Olympic Games.', defaultZoom: 6, availableEras: ['classical', 'medieval', 'modern'] },
  { id: 'newYork', name: 'New York, USA', country: 'United States', latitude: 40.7128, longitude: -74.0060, description: 'From Dutch trading post to global metropolis — a city that defines the modern world.', defaultZoom: 6, availableEras: ['renaissance', 'industrial', 'modern'] },
  { id: 'beijing', name: 'Beijing, China', country: 'China', latitude: 39.9042, longitude: 116.4074, description: 'Imperial capital for centuries, home of the Forbidden City and the Great Wall.', defaultZoom: 5, availableEras: ['ancient', 'classical', 'medieval', 'renaissance', 'industrial', 'modern'] },
  { id: 'paris', name: 'Paris, France', country: 'France', latitude: 48.8566, longitude: 2.3522, description: 'The City of Light — epicenter of the Enlightenment, Revolution, and modern art.', defaultZoom: 6, availableEras: ['medieval', 'renaissance', 'industrial', 'modern'] },
  { id: 'istanbul', name: 'Istanbul, Turkey', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, description: 'Constantinople — the crossroads of Europe and Asia, capital of two great empires.', defaultZoom: 6, availableEras: ['classical', 'medieval', 'renaissance', 'modern'] },
  { id: 'mesopotamia', name: 'Babylon, Iraq', country: 'Iraq', latitude: 32.5421, longitude: 44.4209, description: 'The cradle of civilization — where writing, law, and urban life were born.', defaultZoom: 5, availableEras: ['prehistory', 'ancient', 'classical'] },
  { id: 'london', name: 'London, UK', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, description: 'From Roman Londinium to the capital of the British Empire, a city at the heart of world events.', defaultZoom: 6, availableEras: ['classical', 'medieval', 'renaissance', 'industrial', 'modern'] },
  { id: 'mongolia', name: 'Karakorum, Mongolia', country: 'Mongolia', latitude: 47.9184, longitude: 106.9177, description: 'Capital of the Mongol Empire, the largest contiguous land empire in history.', defaultZoom: 4, availableEras: ['medieval'] },
];

export const LANDMARKS: Landmark[] = [
  {
    id: 'pyramids-giza',
    name: 'Pyramids of Giza',
    locationId: 'egypt',
    latitude: 29.9792,
    longitude: 31.1342,
    triggerZoom: 5.0,
    triggerRadius: 1100,
    timePeriods: [
      { name: 'construction', startYear: -2580, endYear: -2560, riveFile: '/assets/rive/pyramid_building.riv', label: 'Construction of the Pyramids' },
      { name: 'completed', startYear: -2560, endYear: 2024, riveFile: '/assets/rive/pyramid_finished.riv', label: 'Pyramids of Giza' },
    ],
  },
  {
    id: 'colosseum-rome',
    name: 'Colosseum',
    locationId: 'rome',
    latitude: 41.8902,
    longitude: 12.4922,
    triggerZoom: 5.0,
    triggerRadius: 1100,
    timePeriods: [
      { name: 'construction', startYear: 72, endYear: 80, riveFile: '/assets/rive/colosseum.riv', label: 'Construction of the Colosseum' },
      { name: 'completed', startYear: 80, endYear: 2024, riveFile: '/assets/rive/colosseum.riv', label: 'The Colosseum' },
    ],
  },
];

export const BOUNDARY_YEAR_MAP: Record<number, string> = {
  [-10000]: 'world_bc10000',
  [-8000]: 'world_bc8000',
  [-5000]: 'world_bc5000',
  [-4000]: 'world_bc4000',
  [-3000]: 'world_bc3000',
  [-2000]: 'world_bc2000',
  [-1500]: 'world_bc1500',
  [-1000]: 'world_bc1000',
  [-700]: 'world_bc700',
  [-500]: 'world_bc500',
  [-400]: 'world_bc400',
  [-323]: 'world_bc323',
  [-300]: 'world_bc300',
  [-200]: 'world_bc200',
  [-100]: 'world_bc100',
  [-1]: 'world_bc1',
  [100]: 'world_100',
  [200]: 'world_200',
  [300]: 'world_300',
  [400]: 'world_400',
  [500]: 'world_500',
  [600]: 'world_600',
  [700]: 'world_700',
  [800]: 'world_800',
  [900]: 'world_900',
  [1000]: 'world_1000',
  [1100]: 'world_1100',
  [1200]: 'world_1200',
  [1279]: 'world_1279',
  [1300]: 'world_1300',
  [1400]: 'world_1400',
  [1492]: 'world_1492',
  [1500]: 'world_1500',
  [1530]: 'world_1530',
  [1600]: 'world_1600',
  [1650]: 'world_1650',
  [1700]: 'world_1700',
  [1715]: 'world_1715',
  [1783]: 'world_1783',
  [1800]: 'world_1800',
  [1815]: 'world_1815',
  [1880]: 'world_1880',
  [1900]: 'world_1900',
  [1914]: 'world_1914',
  [1920]: 'world_1920',
  [1930]: 'world_1930',
  [1938]: 'world_1938',
  [1945]: 'world_1945',
  [1960]: 'world_1960',
  [1994]: 'world_1994',
  [2000]: 'world_2000',
  [2010]: 'world_2010',
};

export const MIN_YEAR = -10000;
export const MAX_YEAR = 2024;
```

- [ ] **Step 5: Create geo utilities**

`frontend/src/shared/utils/geo.ts`:
```typescript
/** Haversine distance between two points in km */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the closest boundary year to a given year */
export function closestBoundaryYear(year: number, boundaryYears: number[]): number {
  let closest = boundaryYears[0]!;
  let minDiff = Math.abs(year - closest);
  for (const by of boundaryYears) {
    if (by > year) break;
    const diff = Math.abs(year - by);
    if (diff <= minDiff) {
      closest = by;
      minDiff = diff;
    }
  }
  return closest;
}
```

- [ ] **Step 6: Create format utilities**

`frontend/src/shared/utils/format.ts`:
```typescript
/** Format a year number for display (e.g., -2560 → "2560 BCE", 80 → "80 CE") */
export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  if (year === 0) return '1 BCE';
  return `${year.toLocaleString()} CE`;
}

/** Format a year range */
export function formatYearRange(start: number, end: number): string {
  return `${formatYear(start)} — ${formatYear(end)}`;
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: shared types, constants (27 events, 10 locations, 2 landmarks), geo/format utils"
```

---

## Task 4: Zustand Stores

**Files:**
- Create: `frontend/src/shared/stores/timeStore.ts`
- Create: `frontend/src/shared/stores/mapStore.ts`
- Create: `frontend/src/shared/stores/eventsStore.ts`
- Create: `frontend/src/shared/stores/uiStore.ts`
- Create: `frontend/src/shared/stores/landmarkStore.ts`

- [ ] **Step 1: Create timeStore**

`frontend/src/shared/stores/timeStore.ts`:
```typescript
import { create } from 'zustand';
import type { Era } from '@/shared/types/timeline';
import { ERAS, MIN_YEAR, MAX_YEAR } from '@/shared/utils/constants';

interface TimeStore {
  currentYear: number;
  currentEra: Era;
  isPlaying: boolean;
  playbackSpeed: number;

  setYear: (year: number) => void;
  setEra: (era: Era) => void;
  nextEra: () => void;
  prevEra: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

function getEraForYear(year: number): Era {
  return ERAS.find(e => year >= e.startYear && year < e.endYear) ?? ERAS[0]!;
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  currentYear: -3000,
  currentEra: ERAS[1]!,
  isPlaying: false,
  playbackSpeed: 1,

  setYear: (year: number) => {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
    const era = getEraForYear(clamped);
    set({ currentYear: clamped, currentEra: era });
  },

  setEra: (era: Era) => {
    set({ currentEra: era, currentYear: era.startYear });
  },

  nextEra: () => {
    const { currentEra } = get();
    const idx = ERAS.findIndex(e => e.id === currentEra.id);
    if (idx < ERAS.length - 1) {
      const next = ERAS[idx + 1]!;
      set({ currentEra: next, currentYear: next.startYear });
    }
  },

  prevEra: () => {
    const { currentEra } = get();
    const idx = ERAS.findIndex(e => e.id === currentEra.id);
    if (idx > 0) {
      const prev = ERAS[idx - 1]!;
      set({ currentEra: prev, currentYear: prev.startYear });
    }
  },

  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
}));
```

- [ ] **Step 2: Create mapStore**

`frontend/src/shared/stores/mapStore.ts`:
```typescript
import { create } from 'zustand';

interface Viewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

interface MapStore {
  viewport: Viewport;
  selectedLocationId: string | null;
  mapReady: boolean;

  setViewport: (v: Partial<Viewport>) => void;
  selectLocation: (id: string | null) => void;
  setMapReady: (ready: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  viewport: { center: [0, 30], zoom: 1.5, bearing: 0, pitch: 0 },
  selectedLocationId: null,
  mapReady: false,

  setViewport: (v) => set(s => ({ viewport: { ...s.viewport, ...v } })),
  selectLocation: (id) => set({ selectedLocationId: id }),
  setMapReady: (ready) => set({ mapReady: ready }),
}));
```

- [ ] **Step 3: Create eventsStore**

`frontend/src/shared/stores/eventsStore.ts`:
```typescript
import { create } from 'zustand';
import type { HistoricalEvent, EventCategory } from '@/shared/types/events';
import { SEED_EVENTS } from '@/shared/utils/constants';

interface EventFilters {
  categories: EventCategory[];
  eraId: string | null;
}

interface EventsStore {
  events: HistoricalEvent[];
  selectedEventId: string | null;
  filters: EventFilters;

  selectEvent: (id: string | null) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  getVisibleEvents: (year: number) => HistoricalEvent[];
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: SEED_EVENTS,
  selectedEventId: null,
  filters: { categories: [], eraId: null },

  selectEvent: (id) => set({ selectedEventId: id }),
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),

  getVisibleEvents: (year: number) => {
    const { events, filters } = get();
    return events.filter(e => {
      if (e.year > year) return false;
      if (e.endYear && e.endYear < year) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false;
      if (filters.eraId && e.eraId !== filters.eraId) return false;
      return true;
    });
  },
}));
```

- [ ] **Step 4: Create uiStore**

`frontend/src/shared/stores/uiStore.ts`:
```typescript
import { create } from 'zustand';

type Panel = 'none' | 'events' | 'exploration' | 'settings';

interface UIStore {
  activePanel: Panel;
  isMobile: boolean;

  setActivePanel: (panel: Panel) => void;
  togglePanel: (panel: Panel) => void;
  setMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: 'none',
  isMobile: false,

  setActivePanel: (panel) => set({ activePanel: panel }),
  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? 'none' : panel });
  },
  setMobile: (isMobile) => set({ isMobile }),
}));
```

- [ ] **Step 5: Create landmarkStore**

`frontend/src/shared/stores/landmarkStore.ts`:
```typescript
import { create } from 'zustand';
import { LANDMARKS } from '@/shared/utils/constants';
import { haversineDistance } from '@/shared/utils/geo';
import type { Landmark, LandmarkTimePeriod } from '@/shared/types/landmarks';

interface LandmarkVisibility {
  landmark: Landmark;
  visible: boolean;
  currentPeriod: LandmarkTimePeriod | null;
}

interface LandmarkStore {
  landmarks: Landmark[];
  getLandmarkVisibility: (
    year: number,
    zoom: number,
    centerLat: number,
    centerLng: number
  ) => LandmarkVisibility[];
}

export const useLandmarkStore = create<LandmarkStore>(() => ({
  landmarks: LANDMARKS,

  getLandmarkVisibility: (year, zoom, centerLat, centerLng) => {
    return LANDMARKS.map(lm => {
      const distance = haversineDistance(centerLat, centerLng, lm.latitude, lm.longitude);
      const visible = zoom >= lm.triggerZoom && distance <= lm.triggerRadius;

      const currentPeriod = lm.timePeriods.find(
        tp => year >= tp.startYear && year <= tp.endYear
      ) ?? null;

      return { landmark: lm, visible: visible && currentPeriod !== null, currentPeriod };
    });
  },
}));
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: Zustand stores — time, map, events, UI, landmarks"
```

---

## Task 5: Routing & App Shell

**Files:**
- Create: `frontend/src/app/App.tsx`
- Create: `frontend/src/app/routes.tsx`
- Create: `frontend/src/app/providers.tsx`
- Create: `frontend/src/shared/hooks/useMediaQuery.ts`

- [ ] **Step 1: Create useMediaQuery hook**

`frontend/src/shared/hooks/useMediaQuery.ts`:
```typescript
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Create providers**

`frontend/src/app/providers.tsx`:
```tsx
import { useEffect, type ReactNode } from 'react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useUIStore } from '@/shared/stores/uiStore';

export function Providers({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const setMobile = useUIStore(s => s.setMobile);

  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  return <>{children}</>;
}
```

- [ ] **Step 3: Create routes**

`frontend/src/app/routes.tsx`:
```tsx
import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('@/features/onboarding/LandingPage'));
const GlobeExplorer = lazy(() => import('@/features/globe/GlobeExplorer'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-void">
      <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/explore/:year?/:locationId?',
    element: (
      <Suspense fallback={<Loading />}>
        <GlobeExplorer />
      </Suspense>
    ),
  },
]);
```

- [ ] **Step 4: Create App shell**

`frontend/src/app/App.tsx`:
```tsx
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Providers } from './providers';

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: routing (React Router v7) + App shell + providers"
```

---

## Task 6: Mapbox Globe

**Files:**
- Create: `frontend/src/features/globe/GlobeView.tsx`
- Create: `frontend/src/features/globe/BoundaryLayer.tsx`
- Create: `frontend/src/features/globe/GlobeExplorer.tsx`
- Create: `frontend/src/features/globe/useGlobeCamera.ts`

- [ ] **Step 1: Create GlobeView component (Mapbox GL wrapper)**

`frontend/src/features/globe/GlobeView.tsx`:
```tsx
import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '@/shared/stores/mapStore';

interface MapContextValue {
  map: mapboxgl.Map | null;
}

const MapContext = createContext<MapContextValue>({ map: null });
export const useMap = () => useContext(MapContext);

interface GlobeViewProps {
  children?: ReactNode;
}

export function GlobeView({ children }: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const setMapReady = useMapStore(s => s.setMapReady);
  const setViewport = useMapStore(s => s.setViewport);

  useEffect(() => {
    if (!containerRef.current || map) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('VITE_MAPBOX_ACCESS_TOKEN is missing');
      return;
    }

    mapboxgl.accessToken = token;

    const instance = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/geosim1/cmagxq7bt00x801slceck6j5t',
      center: [0, 30],
      zoom: 1.5,
      projection: { name: 'globe' },
      antialias: true,
    });

    instance.on('style.load', () => {
      instance.setFog({});
      instance.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );
      setMap(instance);
      setMapReady(true);
    });

    instance.on('moveend', () => {
      const center = instance.getCenter();
      setViewport({
        center: [center.lng, center.lat],
        zoom: instance.getZoom(),
        bearing: instance.getBearing(),
        pitch: instance.getPitch(),
      });
    });

    return () => {
      instance.remove();
      setMap(null);
      setMapReady(false);
    };
  }, []);

  return (
    <MapContext.Provider value={{ map }}>
      <div className="absolute inset-0">
        <div ref={containerRef} className="w-full h-full" />
        {map && children}
      </div>
    </MapContext.Provider>
  );
}
```

- [ ] **Step 2: Create BoundaryLayer**

`frontend/src/features/globe/BoundaryLayer.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import { useMap } from './GlobeView';
import { useTimeStore } from '@/shared/stores/timeStore';
import { closestBoundaryYear } from '@/shared/utils/geo';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';

const SORTED_YEARS = Object.keys(BOUNDARY_YEAR_MAP)
  .map(Number)
  .sort((a, b) => a - b);

const SOURCE_ID = 'historical-boundaries';
const FILL_LAYER_ID = 'boundaries-fill';
const LINE_LAYER_ID = 'boundaries-line';

export function BoundaryLayer() {
  const { map } = useMap();
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const loadedFileRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const year = closestBoundaryYear(currentYear, SORTED_YEARS);
    const fileName = BOUNDARY_YEAR_MAP[year];
    if (!fileName || fileName === loadedFileRef.current) return;

    const url = `/assets/geo/${fileName}.geojson`;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const geojson = await res.json();

        // Remove existing source/layers
        if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
        if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

        map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });

        map.addLayer({
          id: FILL_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': currentEra.accentColor,
            'fill-opacity': 0.08,
          },
        });

        map.addLayer({
          id: LINE_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': currentEra.accentColor,
            'line-width': 1,
            'line-opacity': 0.4,
          },
        });

        loadedFileRef.current = fileName;
      } catch (err) {
        console.error('Failed to load boundary data:', err);
      }
    })();
  }, [map, currentYear, currentEra]);

  // Update colors when era changes without reloading data
  useEffect(() => {
    if (!map) return;
    if (map.getLayer(FILL_LAYER_ID)) {
      map.setPaintProperty(FILL_LAYER_ID, 'fill-color', currentEra.accentColor);
    }
    if (map.getLayer(LINE_LAYER_ID)) {
      map.setPaintProperty(LINE_LAYER_ID, 'line-color', currentEra.accentColor);
    }
  }, [map, currentEra]);

  return null;
}
```

- [ ] **Step 3: Create useGlobeCamera hook**

`frontend/src/features/globe/useGlobeCamera.ts`:
```typescript
import { useCallback } from 'react';
import { useMap } from './GlobeView';

export function useGlobeCamera() {
  const { map } = useMap();

  const flyTo = useCallback(
    (lng: number, lat: number, zoom = 6) => {
      map?.flyTo({
        center: [lng, lat],
        zoom,
        speed: 0.5,
        curve: 1.9,
        essential: true,
      });
    },
    [map]
  );

  const resetView = useCallback(() => {
    map?.flyTo({
      center: [0, 30],
      zoom: 1.5,
      speed: 0.8,
      essential: true,
    });
  }, [map]);

  return { flyTo, resetView };
}
```

- [ ] **Step 4: Create GlobeExplorer page (main experience shell)**

`frontend/src/features/globe/GlobeExplorer.tsx`:
```tsx
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { GlobeView } from './GlobeView';
import { BoundaryLayer } from './BoundaryLayer';
import { TimelineScrubber } from '@/features/timeline/TimelineScrubber';
import { EraIndicator } from '@/features/timeline/EraIndicator';
import { EventMarkers } from '@/features/events/EventMarkers';
import { EventDetailSheet } from '@/features/events/EventDetailSheet';
import { LandmarkOverlay } from '@/features/landmarks/LandmarkOverlay';
import { ExplorationPanel } from '@/features/exploration/ExplorationPanel';
import { Toolbar } from '@/features/exploration/Toolbar';
import { useTimeStore } from '@/shared/stores/timeStore';

export default function GlobeExplorer() {
  const { year } = useParams();
  const setYear = useTimeStore(s => s.setYear);

  useEffect(() => {
    if (year) setYear(parseInt(year, 10));
  }, [year, setYear]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-void">
      <GlobeView>
        <BoundaryLayer />
        <EventMarkers />
        <LandmarkOverlay />
      </GlobeView>

      {/* UI Overlays */}
      <EraIndicator />
      <Toolbar />
      <ExplorationPanel />
      <EventDetailSheet />
      <TimelineScrubber />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: Mapbox GL globe with boundary layer, camera controls, explorer page"
```

---

## Task 7: Timeline Scrubber & Era Indicator

**Files:**
- Create: `frontend/src/features/timeline/TimelineScrubber.tsx`
- Create: `frontend/src/features/timeline/EraIndicator.tsx`
- Create: `frontend/src/features/timeline/usePlayback.ts`

- [ ] **Step 1: Create playback hook**

`frontend/src/features/timeline/usePlayback.ts`:
```typescript
import { useEffect, useRef } from 'react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { MAX_YEAR } from '@/shared/utils/constants';

export function usePlayback() {
  const isPlaying = useTimeStore(s => s.isPlaying);
  const playbackSpeed = useTimeStore(s => s.playbackSpeed);
  const setYear = useTimeStore(s => s.setYear);
  const togglePlay = useTimeStore(s => s.togglePlay);
  const currentYear = useTimeStore(s => s.currentYear);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) return;

    const yearsPerSecond = 50 * playbackSpeed;

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const next = useTimeStore.getState().currentYear + yearsPerSecond * dt;
      if (next >= MAX_YEAR) {
        setYear(MAX_YEAR);
        togglePlay();
        return;
      }
      setYear(Math.round(next));
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed, setYear, togglePlay]);
}
```

- [ ] **Step 2: Create TimelineScrubber**

`frontend/src/features/timeline/TimelineScrubber.tsx`:
```tsx
import { useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { ERAS, MIN_YEAR, MAX_YEAR } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';
import { usePlayback } from './usePlayback';
import { cn } from '@/shared/utils/cn';

export function TimelineScrubber() {
  usePlayback();
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const isPlaying = useTimeStore(s => s.isPlaying);
  const setYear = useTimeStore(s => s.setYear);
  const togglePlay = useTimeStore(s => s.togglePlay);
  const nextEra = useTimeStore(s => s.nextEra);
  const prevEra = useTimeStore(s => s.prevEra);

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const yearToPercent = (year: number) =>
    ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  const percentToYear = (pct: number) =>
    Math.round(MIN_YEAR + (pct / 100) * (MAX_YEAR - MIN_YEAR));

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      setYear(percentToYear(pct));
    },
    [setYear]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handlePointerEvent(e);
    },
    [handlePointerEvent]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging.current) handlePointerEvent(e);
    },
    [handlePointerEvent]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-40"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="glass-strong mx-4 mb-4 rounded-[var(--radius-xl)] px-4 py-3 md:mx-8">
        {/* Year display */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: currentEra.accentColor, color: 'var(--color-void)' }}
          >
            {currentEra.name}
          </span>
          <span className="font-mono text-lg font-semibold tracking-wider text-text-primary">
            {formatYear(currentYear)}
          </span>
          <div className="flex items-center gap-1">
            <IconButton icon={SkipBack} size={16} onClick={prevEra} aria-label="Previous era" />
            <IconButton
              icon={isPlaying ? Pause : Play}
              size={16}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="!w-8 !h-8 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan"
            />
            <IconButton icon={SkipForward} size={16} onClick={nextEra} aria-label="Next era" />
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-8 cursor-pointer touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Era segments */}
          <div className="absolute top-3 left-0 right-0 h-2 rounded-full overflow-hidden flex">
            {ERAS.map(era => (
              <div
                key={era.id}
                className={cn(
                  'h-full transition-opacity duration-300',
                  era.id === currentEra.id ? 'opacity-100' : 'opacity-30'
                )}
                style={{
                  width: `${yearToPercent(era.endYear) - yearToPercent(era.startYear)}%`,
                  background: era.accentColor,
                }}
              />
            ))}
          </div>

          {/* Thumb */}
          <div
            className="absolute top-1 -translate-x-1/2 w-4 h-6 rounded-full bg-text-primary shadow-lg shadow-accent-cyan/30 border-2 border-accent-cyan"
            style={{ left: `${yearToPercent(currentYear)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create EraIndicator**

`frontend/src/features/timeline/EraIndicator.tsx`:
```tsx
import { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTimeStore } from '@/shared/stores/timeStore';

export function EraIndicator() {
  const currentEra = useTimeStore(s => s.currentEra);
  const [showTransition, setShowTransition] = useState(false);
  const prevEraRef = useRef(currentEra.id);

  useEffect(() => {
    if (currentEra.id !== prevEraRef.current) {
      prevEraRef.current = currentEra.id;
      setShowTransition(true);
      const timer = setTimeout(() => setShowTransition(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentEra.id]);

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background wash */}
          <motion.div
            className="absolute inset-0"
            style={{ background: currentEra.accentColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Era name */}
          <motion.div className="relative text-center">
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tight"
              style={{ color: currentEra.accentColor }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {currentEra.name}
            </motion.h1>
            <motion.p
              className="mt-2 text-text-secondary text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {currentEra.description}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: timeline scrubber with playback, era segments, era transition overlay"
```

---

## Task 8: Event Markers & Detail Sheet

**Files:**
- Create: `frontend/src/features/events/EventMarkers.tsx`
- Create: `frontend/src/features/events/EventDetailSheet.tsx`

- [ ] **Step 1: Create EventMarkers**

`frontend/src/features/events/EventMarkers.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from '@/features/globe/GlobeView';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';

const CATEGORY_COLORS: Record<string, string> = {
  war: '#ef4444',
  discovery: '#06b6d4',
  cultural: '#a855f7',
  political: '#f59e0b',
  construction: '#65a30d',
  natural: '#78716c',
};

export function EventMarkers() {
  const { map } = useMap();
  const currentYear = useTimeStore(s => s.currentYear);
  const getVisibleEvents = useEventsStore(s => s.getVisibleEvents);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const events = getVisibleEvents(currentYear);

    events.forEach(event => {
      const el = document.createElement('div');
      el.className = 'event-marker';
      const color = CATEGORY_COLORS[event.category] ?? '#94a3b8';

      el.innerHTML = `
        <div style="
          width: 12px; height: 12px;
          background: ${color};
          border: 2px solid rgba(255,255,255,0.8);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px ${color}80;
          transition: transform 0.2s, box-shadow 0.2s;
        "></div>
      `;

      el.addEventListener('mouseenter', () => {
        const dot = el.firstElementChild as HTMLElement;
        dot.style.transform = 'scale(1.5)';
        dot.style.boxShadow = `0 0 16px ${color}`;
      });
      el.addEventListener('mouseleave', () => {
        const dot = el.firstElementChild as HTMLElement;
        dot.style.transform = 'scale(1)';
        dot.style.boxShadow = `0 0 8px ${color}80`;
      });
      el.addEventListener('click', () => selectEvent(event.id));

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([event.longitude, event.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [map, currentYear, getVisibleEvents, selectEvent]);

  return null;
}
```

- [ ] **Step 2: Create EventDetailSheet**

`frontend/src/features/events/EventDetailSheet.tsx`:
```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, MapPin, Tag } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { ERAS } from '@/shared/utils/constants';

export function EventDetailSheet() {
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const isMobile = useUIStore(s => s.isMobile);
  const { flyTo } = useGlobeCamera();

  const event = events.find(e => e.id === selectedEventId);
  const era = event ? ERAS.find(e => e.id === event.eraId) : null;

  const onClose = () => selectEvent(null);

  const onFlyTo = () => {
    if (event) flyTo(event.longitude, event.latitude, 8);
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className={
            isMobile
              ? 'fixed bottom-24 left-4 right-4 z-40 glass-strong rounded-[var(--radius-xl)] max-h-[50vh] overflow-y-auto'
              : 'fixed top-4 right-4 z-40 w-96 glass-strong rounded-[var(--radius-xl)] max-h-[80vh] overflow-y-auto'
          }
          initial={isMobile ? { y: 100, opacity: 0 } : { x: 100, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 100, opacity: 0 } : { x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-bold leading-tight pr-2">{event.title}</h2>
              <IconButton icon={X} onClick={onClose} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-elevated text-text-secondary">
                <Calendar size={12} />
                {formatYear(event.year)}
              </span>
              {era && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: era.accentColor + '20', color: era.accentColor }}
                >
                  <Tag size={12} />
                  {era.name}
                </span>
              )}
              <button
                onClick={onFlyTo}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors cursor-pointer"
              >
                <MapPin size={12} />
                Fly to location
              </button>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: event markers on globe with category colors, detail sheet with fly-to"
```

---

## Task 9: Landmark Animations (Rive)

**Files:**
- Create: `frontend/src/features/landmarks/LandmarkOverlay.tsx`
- Copy: Rive files from TIME MACHINE to `frontend/public/assets/rive/`

- [ ] **Step 1: Copy Rive assets**

```bash
mkdir -p frontend/public/assets/rive
cp "C:/Users/33769/Desktop/Projects/TIME MACHINE/Time Machine Ceisum Web Version/time-scroll/frontend/public/colosseum.riv" frontend/public/assets/rive/
cp "C:/Users/33769/Desktop/Projects/TIME MACHINE/Time Machine Ceisum Web Version/time-scroll/frontend/public/pyramid_building.riv" frontend/public/assets/rive/
cp "C:/Users/33769/Desktop/Projects/TIME MACHINE/Time Machine Ceisum Web Version/time-scroll/frontend/public/pyramid_finished.riv" frontend/public/assets/rive/
```

- [ ] **Step 2: Create LandmarkOverlay**

`frontend/src/features/landmarks/LandmarkOverlay.tsx`:
```tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRive } from '@rive-app/react-webgl2';
import { useMap } from '@/features/globe/GlobeView';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useLandmarkStore } from '@/shared/stores/landmarkStore';
import { useMapStore } from '@/shared/stores/mapStore';
import type { LandmarkTimePeriod } from '@/shared/types/landmarks';

interface LandmarkInstanceProps {
  latitude: number;
  longitude: number;
  period: LandmarkTimePeriod;
}

function LandmarkInstance({ latitude, longitude, period }: LandmarkInstanceProps) {
  const { map } = useMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const { RiveComponent, rive } = useRive({
    src: period.riveFile,
    autoplay: true,
  });

  // Position tracking via rAF
  useEffect(() => {
    if (!map || !containerRef.current) return;
    let active = true;

    const update = () => {
      if (!active || !containerRef.current || !map) return;

      try {
        const coords: [number, number] = [longitude, latitude];
        const bounds = map.getBounds();
        if (!bounds?.contains(coords)) {
          containerRef.current.style.opacity = '0';
          rafRef.current = requestAnimationFrame(update);
          return;
        }

        const { x, y } = map.project(coords);
        const canvas = map.getCanvas();

        if (x < -200 || y < -200 || x > canvas.width + 200 || y > canvas.height + 200) {
          containerRef.current.style.opacity = '0';
        } else {
          containerRef.current.style.transform = `translate(${x - 160}px, ${y - 180}px)`;
          containerRef.current.style.opacity = '1';
        }
      } catch {
        // Map may not be ready
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [map, latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-auto cursor-pointer"
      style={{ width: 320, height: 360, opacity: 0, transition: 'opacity 0.3s', zIndex: 30 }}
    >
      <RiveComponent style={{ width: '100%', height: '100%' }} />
      <div className="text-center -mt-2">
        <span className="text-xs font-medium text-text-primary px-2 py-0.5 rounded-full glass">
          {period.label}
        </span>
      </div>
    </div>
  );
}

export function LandmarkOverlay() {
  const currentYear = useTimeStore(s => s.currentYear);
  const viewport = useMapStore(s => s.viewport);
  const getLandmarkVisibility = useLandmarkStore(s => s.getLandmarkVisibility);

  const landmarks = getLandmarkVisibility(
    currentYear,
    viewport.zoom,
    viewport.center[1],
    viewport.center[0]
  );

  const visible = landmarks.filter(l => l.visible && l.currentPeriod);

  return (
    <>
      {visible.map(({ landmark, currentPeriod }) => (
        <LandmarkInstance
          key={`${landmark.id}-${currentPeriod!.name}`}
          latitude={landmark.latitude}
          longitude={landmark.longitude}
          period={currentPeriod!}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: Rive landmark animations (Pyramids, Colosseum) with globe-anchored positioning"
```

---

## Task 10: Exploration Panel & Toolbar

**Files:**
- Create: `frontend/src/features/exploration/ExplorationPanel.tsx`
- Create: `frontend/src/features/exploration/Toolbar.tsx`

- [ ] **Step 1: Create Toolbar**

`frontend/src/features/exploration/Toolbar.tsx`:
```tsx
import { Compass, List, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconButton } from '@/shared/components';
import { useUIStore } from '@/shared/stores/uiStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { cn } from '@/shared/utils/cn';

export function Toolbar() {
  const activePanel = useUIStore(s => s.activePanel);
  const togglePanel = useUIStore(s => s.togglePanel);
  const { resetView } = useGlobeCamera();

  return (
    <motion.div
      className="absolute top-4 left-4 z-30 flex flex-col gap-2"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="glass rounded-[var(--radius-lg)] p-1 flex flex-col gap-1">
        <IconButton
          icon={MapPin}
          onClick={() => togglePanel('exploration')}
          className={cn(activePanel === 'exploration' && 'bg-accent-cyan/20 text-accent-cyan')}
          aria-label="Explore locations"
        />
        <IconButton
          icon={List}
          onClick={() => togglePanel('events')}
          className={cn(activePanel === 'events' && 'bg-accent-cyan/20 text-accent-cyan')}
          aria-label="Event list"
        />
        <IconButton
          icon={Compass}
          onClick={resetView}
          aria-label="Reset view"
        />
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create ExplorationPanel**

`frontend/src/features/exploration/ExplorationPanel.tsx`:
```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/shared/stores/uiStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { LOCATIONS, ERAS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';

export function ExplorationPanel() {
  const activePanel = useUIStore(s => s.activePanel);
  const setActivePanel = useUIStore(s => s.setActivePanel);
  const isMobile = useUIStore(s => s.isMobile);
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const getVisibleEvents = useEventsStore(s => s.getVisibleEvents);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const { flyTo } = useGlobeCamera();

  const show = activePanel === 'exploration' || activePanel === 'events';
  const isEvents = activePanel === 'events';
  const visibleEvents = getVisibleEvents(currentYear);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={
            isMobile
              ? 'fixed bottom-28 left-4 right-4 z-30 glass-strong rounded-[var(--radius-xl)] max-h-[45vh] overflow-y-auto'
              : 'fixed top-4 left-16 z-30 w-80 glass-strong rounded-[var(--radius-xl)] max-h-[70vh] overflow-y-auto'
          }
          initial={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">
                {isEvents ? 'Events' : 'Locations'}
              </h3>
              <IconButton icon={X} size={16} onClick={() => setActivePanel('none')} />
            </div>

            {isEvents ? (
              <div className="space-y-2">
                {visibleEvents.length === 0 && (
                  <p className="text-xs text-text-muted py-4 text-center">No events at {formatYear(currentYear)}</p>
                )}
                {visibleEvents.map(event => {
                  const era = ERAS.find(e => e.id === event.eraId);
                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        selectEvent(event.id);
                        flyTo(event.longitude, event.latitude, 6);
                        setActivePanel('none');
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-elevated/60 transition-colors text-left cursor-pointer"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: era?.accentColor }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-text-muted">{formatYear(event.year)}</p>
                      </div>
                      <ChevronRight size={14} className="text-text-muted ml-auto shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {LOCATIONS.filter(loc =>
                  loc.availableEras.includes(currentEra.id)
                ).map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      flyTo(loc.longitude, loc.latitude, loc.defaultZoom);
                      setActivePanel('none');
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-elevated/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{loc.name}</p>
                      <p className="text-xs text-text-muted line-clamp-1">{loc.description}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-muted ml-auto shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: toolbar + exploration panel with locations and events list"
```

---

## Task 11: Landing Page

**Files:**
- Create: `frontend/src/features/onboarding/LandingPage.tsx`

- [ ] **Step 1: Create LandingPage**

`frontend/src/features/onboarding/LandingPage.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/shared/components';
import { ERAS } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const handleExplore = () => {
    setExiting(true);
    const era = ERAS.find(e => e.id === selectedEra);
    const year = era ? era.startYear : -3000;
    setTimeout(() => navigate(`/explore/${year}`), 800);
  };

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 z-50 bg-void flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Star particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-px bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 text-center max-w-2xl px-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            >
              <Globe size={28} className="text-accent-cyan" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">
              Time{' '}
              <span className="text-accent-cyan">Scroll</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl mb-10 leading-relaxed">
              Journey through 12,000 years of world history on an interactive 3D globe
            </p>

            {/* Era selector */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
                Start at an era
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {ERAS.map(era => (
                  <button
                    key={era.id}
                    onClick={() => setSelectedEra(era.id === selectedEra ? null : era.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer',
                      selectedEra === era.id
                        ? 'border-transparent text-void'
                        : 'border-border-subtle text-text-secondary hover:border-border-active hover:text-text-primary'
                    )}
                    style={
                      selectedEra === era.id
                        ? { background: era.accentColor }
                        : undefined
                    }
                  >
                    {era.name}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button size="lg" variant="primary" onClick={handleExplore}>
                Explore History
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          </motion.div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-void to-transparent pointer-events-none" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: landing page with star particles, era selector, explore CTA"
```

---

## Task 12: Copy GeoJSON Assets & PWA Setup

**Files:**
- Copy: GeoJSON files to `frontend/public/assets/geo/`
- Create: `frontend/public/manifest.json`

- [ ] **Step 1: Copy GeoJSON boundary files**

```bash
mkdir -p frontend/public/assets/geo
cp "C:/Users/33769/Desktop/Projects/TIME MACHINE/geojson/"*.geojson frontend/public/assets/geo/
```

- [ ] **Step 2: Create PWA manifest**

`frontend/public/manifest.json`:
```json
{
  "name": "Time Scroll",
  "short_name": "TimeScroll",
  "description": "Journey through 12,000 years of world history",
  "start_url": "/explore",
  "display": "standalone",
  "background_color": "#030712",
  "theme_color": "#030712",
  "orientation": "any",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 3: Add manifest link to index.html**

Add to `<head>` in `frontend/index.html`:
```html
<link rel="manifest" href="/manifest.json" />
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: copy 54 GeoJSON boundary files, add PWA manifest"
```

---

## Task 13: Integration — Wire Everything, Verify Build

- [ ] **Step 1: Create .env with Mapbox token**

Check if user's token exists from the prototype:
```bash
cat "C:/Users/33769/Desktop/Projects/TIME MACHINE/Time Machine Ceisum Web Version/time-scroll/frontend/.env" 2>/dev/null
```

Create `frontend/.env` with the token found.

- [ ] **Step 2: Verify all imports resolve**

```bash
cd frontend && npx tsc --noEmit
```

Fix any TypeScript errors.

- [ ] **Step 3: Run dev server and verify**

```bash
cd frontend && npm run dev
```

Verify: landing page loads, clicking "Explore" navigates to globe, timeline scrubber works, events render, boundaries load on time change.

- [ ] **Step 4: Run production build**

```bash
cd frontend && npm run build
```

Expected: clean build with no errors, chunks under 500KB each (except mapbox).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: integration — all features wired, build verified"
```
