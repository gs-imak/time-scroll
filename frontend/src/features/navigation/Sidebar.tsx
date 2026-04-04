import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Scroll, Search, Trophy, Settings, Menu, X, LayoutDashboard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUIStore } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';

type Panel = 'exploration' | 'events' | 'progress';

interface NavItemConfig {
  icon: LucideIcon;
  label: string;
  panel?: Panel;
  action?: () => void;
  tourId?: string;
}

const SIDEBAR_COLLAPSED = 64;
const SIDEBAR_EXPANDED = 240;

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
          'relative flex items-center w-full h-11 rounded-[10px]',
          'transition-all duration-200 cursor-pointer',
          'active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
          active
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary',
          hovered && !active && 'bg-[rgba(255,255,255,0.04)]',
          active && 'bg-[rgba(255,255,255,0.04)]',
        )}
        style={{ paddingLeft: 12, paddingRight: 12 }}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        data-tour={tourId}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-full"
            style={{ background: '#c49a44' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="shrink-0 flex items-center justify-center w-5 h-5">
          <Icon size={20} />
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
          <div
            className="rounded-lg px-3 py-1.5 text-[11px] font-medium whitespace-nowrap shadow-lg"
            style={{
              background: 'rgba(14, 14, 20, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              color: '#e0e0e6',
            }}
          >
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
        active
          ? 'text-text-primary bg-[rgba(255,255,255,0.04)]'
          : 'text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.04)]',
      )}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <span
          className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-full"
          style={{ background: '#c49a44' }}
        />
      )}
      <Icon size={20} className="shrink-0" />
      <span className="text-[14px] font-medium">{label}</span>
    </button>
  );
}

function DesktopSidebar() {
  const [expanded, setExpanded] = useState(false);
  const activePanel = useUIStore(s => s.activePanel);
  const togglePanel = useUIStore(s => s.togglePanel);
  const navigate = useNavigate();

  const dispatchSearch = useCallback(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
  }, []);

  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const goToTimeline = useCallback(() => {
    navigate('/timeline');
  }, [navigate]);

  const handleSettings = useCallback(() => {
    console.info('[Time Scroll] Settings coming soon');
  }, []);

  const navItems: NavItemConfig[] = [
    { icon: LayoutDashboard, label: 'Dashboard', action: goToDashboard, tourId: 'dashboard' },
    { icon: Clock, label: 'Timeline', action: goToTimeline, tourId: 'timeline' },
    { icon: Globe, label: 'Explore', panel: 'exploration', tourId: 'explore' },
    { icon: Scroll, label: 'Events', panel: 'events', tourId: 'events' },
    { icon: Search, label: 'Search', action: dispatchSearch, tourId: 'search' },
    { icon: Trophy, label: 'Progress', panel: 'progress', tourId: 'progress' },
  ];

  const bottomItems: NavItemConfig[] = [
    { icon: Settings, label: 'Settings', action: handleSettings },
  ];

  function handleClick(item: NavItemConfig) {
    if (item.action) {
      item.action();
    } else if (item.panel) {
      togglePanel(item.panel);
    }
  }

  function isActive(item: NavItemConfig): boolean {
    return !!item.panel && activePanel === item.panel;
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 z-50 h-full flex flex-col"
      style={{
        background: 'rgba(14, 14, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
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
      aria-label="Main navigation"
    >
      <div className="flex flex-col flex-1 pt-4 pb-[140px] px-2 gap-1">
        {/* Logo / brand mark area */}
        <div
          className="flex items-center justify-center h-11 mb-2 shrink-0"
          aria-hidden="true"
        >
          <motion.div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(196, 154, 68, 0.15), rgba(196, 154, 68, 0.05))',
              border: '1px solid rgba(196, 154, 68, 0.2)',
            }}
          >
            <span
              className="text-[14px] font-bold"
              style={{ color: '#c49a44' }}
            >
              T
            </span>
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden whitespace-nowrap text-[14px] font-semibold ml-3"
                style={{ color: '#e0e0e6' }}
              >
                Time Scroll
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div
          className="mx-2 mb-2"
          style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)' }}
        />

        {/* Main nav items */}
        {navItems.map(item => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={isActive(item)}
            expanded={expanded}
            onClick={() => handleClick(item)}
            tourId={item.tourId}
          />
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div
          className="mx-2 mb-1 mt-1"
          style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)' }}
        />

        {/* Bottom section */}
        {bottomItems.map(item => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={isActive(item)}
            expanded={expanded}
            onClick={() => handleClick(item)}
          />
        ))}
      </div>
    </motion.nav>
  );
}

function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const activePanel = useUIStore(s => s.activePanel);
  const togglePanel = useUIStore(s => s.togglePanel);
  const navigate = useNavigate();

  const dispatchSearch = useCallback(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
  }, []);

  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const goToTimeline = useCallback(() => {
    navigate('/timeline');
  }, [navigate]);

  const handleSettings = useCallback(() => {
    console.info('[Time Scroll] Settings coming soon');
  }, []);

  const navItems: NavItemConfig[] = [
    { icon: LayoutDashboard, label: 'Dashboard', action: goToDashboard },
    { icon: Clock, label: 'Timeline', action: goToTimeline },
    { icon: Globe, label: 'Explore', panel: 'exploration' },
    { icon: Scroll, label: 'Events', panel: 'events' },
    { icon: Search, label: 'Search', action: dispatchSearch },
    { icon: Trophy, label: 'Progress', panel: 'progress' },
  ];

  const bottomItems: NavItemConfig[] = [
    { icon: Settings, label: 'Settings', action: handleSettings },
  ];

  function handleClick(item: NavItemConfig) {
    if (item.action) {
      item.action();
    } else if (item.panel) {
      togglePanel(item.panel);
    }
    setOpen(false);
  }

  function isActive(item: NavItemConfig): boolean {
    return !!item.panel && activePanel === item.panel;
  }

  // Close drawer on Escape
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
      {/* Hamburger trigger */}
      <motion.button
        className="fixed top-3 left-3 z-40 flex items-center justify-center w-11 h-11 rounded-[10px] cursor-pointer"
        style={{
          background: 'rgba(14, 14, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.25 }}
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        <Menu size={20} style={{ color: '#8a8a9a' }} />
      </motion.button>

      {/* Drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(8, 8, 12, 0.6)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.nav
              id="mobile-nav-drawer"
              className="fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col"
              style={{
                background: 'rgba(14, 14, 20, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '8px 0 40px rgba(0, 0, 0, 0.4)',
              }}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(196, 154, 68, 0.15), rgba(196, 154, 68, 0.05))',
                      border: '1px solid rgba(196, 154, 68, 0.2)',
                    }}
                  >
                    <span
                      className="text-[14px] font-bold"
                      style={{ color: '#c49a44' }}
                    >
                      T
                    </span>
                  </div>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: '#e0e0e6' }}
                  >
                    Time Scroll
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-[8px] cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.04)]"
                  aria-label="Close navigation menu"
                >
                  <X size={18} style={{ color: '#8a8a9a' }} />
                </button>
              </div>

              {/* Divider */}
              <div
                className="mx-3"
                style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)' }}
              />

              {/* Nav items */}
              <div className="flex flex-col flex-1 px-3 py-3 gap-1">
                {navItems.map(item => (
                  <MobileNavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={isActive(item)}
                    onClick={() => handleClick(item)}
                  />
                ))}

                <div className="flex-1" />

                <div
                  className="mx-1 mb-1 mt-1"
                  style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)' }}
                />

                {bottomItems.map(item => (
                  <MobileNavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={isActive(item)}
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
  const isMobile = useUIStore(s => s.isMobile);
  const setMobile = useUIStore(s => s.setMobile);

  useEffect(() => {
    function handleResize() {
      setMobile(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobile]);

  return isMobile ? <MobileDrawer /> : <DesktopSidebar />;
}
