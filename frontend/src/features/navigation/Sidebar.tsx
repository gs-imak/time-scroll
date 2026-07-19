import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Search, Settings, Menu, X, LayoutDashboard, Clock, BookOpen, BrainCircuit, Sun, Moon, Landmark, CircleUser } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useUIStore } from '@/shared/stores/uiStore';
import { useThemeStore } from '@/shared/stores/themeStore';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface NavItemConfig {
  icon: LucideIcon;
  label: string;
  /** Route to navigate to. Omitted for action-only items (e.g. Search). */
  path?: string;
  /** Extra action to run on select, alongside (or instead of) navigation. */
  onSelect?: () => void;
  tourId?: string;
}

const SIDEBAR_COLLAPSED = 64;
const SIDEBAR_EXPANDED = 240;

function dispatchSearchShortcut() {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
  );
}

/** Single shared nav config — was previously duplicated (and had drifted)
 * between DesktopSidebar and MobileDrawer. */
const NAV_ITEMS: NavItemConfig[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', tourId: 'dashboard' },
  { icon: Clock, label: 'Timeline', path: '/timeline', tourId: 'timeline' },
  { icon: Globe, label: 'Explore', path: '/explore', tourId: 'explore' },
  { icon: BookOpen, label: 'Journeys', path: '/journeys', tourId: 'journeys' },
  { icon: Landmark, label: 'Civilizations', path: '/civilizations', tourId: 'civilizations' },
  { icon: BrainCircuit, label: 'Quiz', path: '/quiz', tourId: 'quiz' },
  { icon: Search, label: 'Search', onSelect: dispatchSearchShortcut, tourId: 'search' },
];

const BOTTOM_NAV_ITEMS: NavItemConfig[] = [
  { icon: Settings, label: 'Settings', path: '/settings', tourId: 'settings' },
  { icon: CircleUser, label: 'Profile', path: '/profile', tourId: 'profile' },
];

/** Single isActive implementation shared by desktop + mobile nav (the old
 * mobile version keyed off item.label and was missing a Civilizations
 * entry, so it never highlighted as active). */
function isNavItemActive(pathname: string, item: NavItemConfig): boolean {
  return item.path ? pathname.startsWith(item.path) : false;
}

function NavItem({
  icon: Icon,
  label,
  active,
  expanded,
  onClick,
  tourId,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  expanded: boolean;
  tourId?: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative flex items-center w-full h-11 rounded-xl',
          'transition-all duration-200 cursor-pointer',
          'active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void',
          active
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary',
          hovered && !active && 'bg-border-subtle',
          active && 'bg-border-subtle',
        )}
        style={{ paddingLeft: 12, paddingRight: 12 }}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        data-tour={tourId}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-full bg-accent-gold"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="shrink-0 flex items-center justify-center w-5 h-5">
          <Icon size={20} aria-hidden="true" />
        </span>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden whitespace-nowrap text-[14px] font-medium ml-3"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {!expanded && hovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-50">
          <div className="glass-strong rounded-lg px-3 py-1.5 text-[11px] font-medium whitespace-nowrap text-text-primary">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center w-full h-11 rounded-[10px] px-3 gap-3',
        'transition-all duration-200 cursor-pointer',
        'active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void',
        active
          ? 'text-text-primary bg-border-subtle'
          : 'text-text-secondary hover:text-text-primary hover:bg-border-subtle',
      )}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <span className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-full bg-accent-gold" />
      )}
      <Icon size={20} className="shrink-0" aria-hidden="true" />
      <span className="text-[14px] font-medium">{label}</span>
    </button>
  );
}

function ThemeToggle({ expanded, mobile }: { expanded: boolean; mobile?: boolean }) {
  const theme = useThemeStore(s => s.theme);
  const toggleTheme = useThemeStore(s => s.toggleTheme);
  const [hovered, setHovered] = useState(false);
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  if (mobile) {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative flex items-center w-full h-11 rounded-[10px] px-3 gap-3',
          'transition-all duration-200 cursor-pointer',
          'text-text-secondary hover:text-text-primary hover:bg-border-subtle',
          'active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void',
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <Icon size={20} className="shrink-0" aria-hidden="true" />
        <span className="text-[14px] font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative flex items-center w-full h-11 rounded-xl',
          'transition-all duration-200 cursor-pointer',
          'text-text-secondary hover:text-text-primary',
          'active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void',
          hovered && 'bg-border-subtle',
        )}
        style={{ paddingLeft: 12, paddingRight: 12 }}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="shrink-0 flex items-center justify-center w-5 h-5">
          <Icon size={20} aria-hidden="true" />
        </span>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden whitespace-nowrap text-[14px] font-medium ml-3"
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {!expanded && hovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-50">
          <div className="glass-strong rounded-lg px-3 py-1.5 text-[11px] font-medium whitespace-nowrap text-text-primary">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopSidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function handleClick(item: NavItemConfig) {
    if (item.path) navigate(item.path);
    item.onSelect?.();
  }

  // Hover-only expansion locks out keyboard users. Expand on focus too, and
  // only collapse once focus actually leaves the nav (not when it moves
  // between two items inside it) — mirrors :focus-within, but JS-driven
  // since `expanded` also drives the width animation below.
  function handleBlur(e: React.FocusEvent<HTMLElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setExpanded(false);
    }
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 z-50 h-full flex flex-col bg-surface/85 backdrop-blur-xl border-r border-border-subtle"
      initial={{ x: -SIDEBAR_COLLAPSED, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        width: expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
      }}
      transition={{
        x: { delay: 0.3, type: 'spring', stiffness: 200, damping: 25 },
        opacity: { delay: 0.3, duration: 0.3 },
        width: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={handleBlur}
      aria-label="Main navigation"
    >
      <div className="flex flex-col flex-1 pt-4 pb-4 px-2 gap-1">
        {/* Logo */}
        <div className="flex items-center justify-center h-11 mb-2 shrink-0" aria-hidden="true">
          <motion.div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-accent-gold/20"
            style={{
              background: 'linear-gradient(135deg, rgba(196, 154, 68, 0.15), rgba(196, 154, 68, 0.05))',
            }}
          >
            <span className="text-[14px] font-bold text-accent-gold">T</span>
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden whitespace-nowrap text-[14px] font-semibold ml-3 text-text-primary"
              >
                Time Machine
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-2 mb-2 h-px bg-border-subtle" />

        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={isNavItemActive(location.pathname, item)}
            expanded={expanded}
            onClick={() => handleClick(item)}
            tourId={item.tourId}
          />
        ))}

        <div className="flex-1" />

        <div className="mx-2 mb-1 mt-1 h-px bg-border-subtle" />

        <ThemeToggle expanded={expanded} />

        {BOTTOM_NAV_ITEMS.map(item => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={isNavItemActive(location.pathname, item)}
            expanded={expanded}
            onClick={() => handleClick(item)}
            tourId={item.tourId}
          />
        ))}
      </div>
    </motion.nav>
  );
}

function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, open);

  function handleClick(item: NavItemConfig) {
    if (item.path) navigate(item.path);
    item.onSelect?.();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      <motion.button
        className="fixed top-3 left-3 z-40 flex items-center justify-center w-11 h-11 rounded-[10px] cursor-pointer glass-strong text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.25 }}
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        <Menu size={20} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-void/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <motion.nav
              ref={drawerRef}
              id="mobile-nav-drawer"
              className="fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col bg-surface/95 backdrop-blur-2xl border-r border-border-subtle shadow-2xl"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-accent-gold/20"
                    style={{
                      background: 'linear-gradient(135deg, rgba(196, 154, 68, 0.15), rgba(196, 154, 68, 0.05))',
                    }}
                    aria-hidden="true"
                  >
                    <span className="text-[14px] font-bold text-accent-gold">T</span>
                  </div>
                  <span className="text-[14px] font-semibold text-text-primary">Time Machine</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-11 h-11 rounded-[10px] cursor-pointer transition-colors duration-200 hover:bg-border-subtle text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                  aria-label="Close navigation menu"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="mx-3 h-px bg-border-subtle" />

              <div className="flex flex-col flex-1 px-3 py-3 gap-1">
                {NAV_ITEMS.map(item => (
                  <MobileNavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={isNavItemActive(location.pathname, item)}
                    onClick={() => handleClick(item)}
                  />
                ))}

                <div className="flex-1" />

                <div className="mx-1 mb-1 mt-1 h-px bg-border-subtle" />

                <ThemeToggle expanded={true} mobile />

                {BOTTOM_NAV_ITEMS.map(item => (
                  <MobileNavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={isNavItemActive(location.pathname, item)}
                    onClick={() => handleClick(item)}
                  />
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function Sidebar() {
  // isMobile is derived solely from uiStore now (single source, set by
  // app/providers.tsx's useMediaQuery('(max-width: 768px)') effect). This
  // component used to run its own 1024px resize listener in parallel,
  // which raced the 768px one and made isMobile flicker between the two
  // thresholds on every resize.
  const isMobile = useUIStore(s => s.isMobile);
  return isMobile ? <MobileDrawer /> : <DesktopSidebar />;
}
