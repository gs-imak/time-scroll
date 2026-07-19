import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/shared/stores/mapStore';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

const STORAGE_KEY = 'time-scroll-onboarding-complete';
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface TourStep {
  title: string;
  message: string;
  getTarget: () => DOMRect | null;
  placement: 'center' | 'above' | 'below' | 'right';
  padding: number;
  borderRadius: number;
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to Time Machine',
    message:
      'Explore 12,000 years of human civilization on an interactive 3D globe. Let us show you around.',
    getTarget: () => null,
    placement: 'center',
    padding: 0,
    borderRadius: 0,
  },
  {
    title: 'Travel Through Time',
    message:
      'Drag the timeline at the bottom to scrub through history. Watch civilizations rise and fall in real time.',
    getTarget: () => {
      const el = document.querySelector('[data-tour="timeline"]');
      if (el) return el.getBoundingClientRect();
      // Fallback: bottom strip accounting for sidebar
      const w = window.innerWidth;
      const h = window.innerHeight;
      const sidebarW = w >= 1024 ? 64 : 0;
      return new DOMRect(sidebarW + 24, h - 160, w - sidebarW - 48, 136);
    },
    placement: 'above',
    padding: 12,
    borderRadius: 16,
  },
  {
    title: 'Explore Events',
    message:
      'Click any glowing marker on the globe to dive into a historical event with images, stories, and quizzes.',
    getTarget: () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const sidebarW = w >= 1024 ? 64 : 0;
      const globeCenterX = sidebarW + (w - sidebarW) / 2;
      const size = Math.min(w - sidebarW, h) * 0.3;
      return new DOMRect(
        globeCenterX - size / 2,
        h / 2 - size / 2 - 30,
        size,
        size,
      );
    },
    placement: 'below',
    padding: 0,
    borderRadius: 999,
  },
  {
    title: 'Search Events',
    message:
      'Use search to find any event, era, or civilization instantly. You can also press Ctrl+K.',
    getTarget: () => {
      const el = document.querySelector('[data-tour="search"]');
      if (el) return el.getBoundingClientRect();
      return new DOMRect(8, 180, 48, 44);
    },
    placement: 'right',
    padding: 8,
    borderRadius: 12,
  },
  {
    title: 'Track Your Progress',
    message:
      'Earn achievements as you explore. See how many events you have discovered and keep your streak alive.',
    getTarget: () => {
      const el = document.querySelector('[data-tour="progress"]');
      if (el) return el.getBoundingClientRect();
      return new DOMRect(8, 224, 48, 44);
    },
    placement: 'right',
    padding: 8,
    borderRadius: 12,
  },
];

/** Card is never wider than the viewport minus a 16px (lg) gutter each side. */
const CARD_MAX_WIDTH = 'min(400px, calc(100vw - 32px))';

function getTooltipPosition(
  step: TourStep,
  target: DOMRect | null,
): { top: number; left: number; transform: string; transformOrigin: string } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Effective card width after the max-width clamp (380px centered / 320px anchored).
  const cardW = Math.min(step.placement === 'center' ? 380 : 320, vw - 32);

  if (!target || step.placement === 'center') {
    return {
      top: vh / 2,
      left: vw / 2,
      transform: 'translate(-50%, -50%)',
      transformOrigin: 'center center',
    };
  }

  const cx = target.left + target.width / 2;
  const cy = target.top + target.height / 2;
  // Clamp the card's horizontal center so it stays fully inside the viewport
  // with a 16px (lg) gutter on both sides.
  const clampCenter = (v: number) =>
    Math.min(Math.max(v, cardW / 2 + 16), vw - cardW / 2 - 16);

  // 'right' placement cannot fit beside the target on narrow screens —
  // fall back to placing the card below the target instead.
  const placement =
    step.placement === 'right' && target.right + step.padding + 16 + cardW > vw - 16
      ? 'below'
      : step.placement;

  switch (placement) {
    case 'above':
      return {
        top: target.top - step.padding - 16,
        left: clampCenter(cx),
        transform: 'translate(-50%, -100%)',
        transformOrigin: 'bottom center',
      };
    case 'below':
      return {
        top: target.bottom + step.padding + 16,
        left: clampCenter(cx),
        transform: 'translate(-50%, 0%)',
        transformOrigin: 'top center',
      };
    case 'right':
      return {
        top: cy,
        left: target.right + step.padding + 16,
        transform: 'translate(0%, -50%)',
        transformOrigin: 'left center',
      };
    default:
      return {
        top: vh / 2,
        left: vw / 2,
        transform: 'translate(-50%, -50%)',
        transformOrigin: 'center center',
      };
  }
}

export function OnboardingTour() {
  const mapReady = useMapStore((s) => s.mapReady);
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keep keyboard focus inside the tour dialog while it is open.
  useFocusTrap(dialogRef, active);

  // Determine if the tour should show
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;
    if (!mapReady) return;
    // Don't show tour if an event URL param is present — let the user go directly to the event
    if (window.location.search.includes('event=')) {
      localStorage.setItem(STORAGE_KEY, 'true');
      return;
    }

    // Small delay so the loading screen exit animation finishes
    const timer = setTimeout(() => setActive(true), 1000);
    return () => clearTimeout(timer);
  }, [mapReady]);

  // Track target rectangle for the current step
  const updateRect = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step) return;
    const rect = step.getTarget();
    setTargetRect(rect);
    rafRef.current = requestAnimationFrame(updateRect);
  }, [currentStep]);

  useEffect(() => {
    if (!active) return;
    rafRef.current = requestAnimationFrame(updateRect);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, updateRect]);

  const completeTour = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep >= STEPS.length - 1) {
      completeTour();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, completeTour]);

  const handleSkip = useCallback(() => {
    completeTour();
  }, [completeTour]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        completeTour();
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        // The focus trap keeps focus on the card's buttons, and a focused
        // button already handles Enter itself — advancing here too would
        // double-fire Next or override Skip.
        if (
          e.key === 'Enter' &&
          e.target instanceof HTMLElement &&
          e.target.closest('button')
        ) {
          return;
        }
        handleNext();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, handleNext, completeTour]);

  const step = STEPS[currentStep];
  if (!step) return null;

  const isCentered = step.placement === 'center';
  const tooltipPos = getTooltipPosition(step, targetRect);
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          role="dialog"
          aria-modal="true"
          aria-label={`Onboarding tour - Step ${currentStep + 1} of ${STEPS.length}`}
        >
          {/* Dark overlay with spotlight cutout */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
            aria-hidden="true"
          >
            <defs>
              <mask id="onboarding-spotlight">
                <rect width="100%" height="100%" fill="white" />
                <AnimatePresence mode="wait">
                  {targetRect && !isCentered && (
                    <motion.rect
                      key={currentStep}
                      fill="black"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                      x={targetRect.left - step.padding}
                      y={targetRect.top - step.padding}
                      width={targetRect.width + step.padding * 2}
                      height={targetRect.height + step.padding * 2}
                      rx={step.borderRadius}
                      ry={step.borderRadius}
                    />
                  )}
                </AnimatePresence>
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="var(--color-overlay)"
              mask="url(#onboarding-spotlight)"
            />
          </svg>

          {/* Spotlight border ring */}
          <AnimatePresence mode="wait">
            {targetRect && !isCentered && (
              <motion.div
                key={`ring-${currentStep}`}
                className="absolute pointer-events-none"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                style={{
                  left: targetRect.left - step.padding - 2,
                  top: targetRect.top - step.padding - 2,
                  width: targetRect.width + step.padding * 2 + 4,
                  height: targetRect.height + step.padding * 2 + 4,
                  borderRadius: step.borderRadius + 2,
                  border: '1.5px solid rgba(196, 154, 68, 0.35)',
                  boxShadow: '0 0 24px 2px rgba(196, 154, 68, 0.08)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Click-to-advance backdrop (covers non-spotlight areas) */}
          <div
            className="absolute inset-0"
            style={{ pointerEvents: 'auto' }}
            onClick={handleNext}
            aria-hidden="true"
          />

          {/* Tooltip card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="absolute pointer-events-auto"
              style={{
                top: tooltipPos.top,
                left: tooltipPos.left,
                transform: tooltipPos.transform,
                transformOrigin: tooltipPos.transformOrigin,
                zIndex: 51,
              }}
              initial={{ opacity: 0, scale: 0.92, y: isCentered ? 12 : 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <div
                className="flex flex-col glass-strong"
                style={{
                  width: isCentered ? 380 : 320,
                  maxWidth: CARD_MAX_WIDTH,
                  borderRadius: 16,
                  padding: 24,
                  boxShadow:
                    '0 20px 60px var(--glass-shadow), 0 0 40px rgba(196, 154, 68, 0.04)',
                }}
              >
                {/* Step counter */}
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{ height: 20 }}
                >
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === currentStep ? 20 : 6,
                        height: 3,
                        borderRadius: 2,
                        background:
                          i === currentStep
                            ? '#c49a44'
                            : i < currentStep
                              ? 'rgba(196, 154, 68, 0.35)'
                              : 'rgba(255, 255, 255, 0.1)',
                        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  ))}
                  <span
                    className="ml-auto"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {currentStep + 1}/{STEPS.length}
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: isCentered ? 22 : 16,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.2,
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  {step.title}
                </h2>

                {/* Message */}
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    marginBottom: 20,
                  }}
                >
                  {step.message}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  {/* Text color via CSS :hover with tokens — never JS style
                      mutation (the old onMouseLeave restored #55556a, the
                      failed-contrast hex tokens.css explicitly rejects). */}
                  <button
                    onClick={handleSkip}
                    className="cursor-pointer min-h-11 py-2 rounded-[10px] text-[13px] font-normal text-text-muted hover:text-text-secondary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                    aria-label="Skip tour"
                  >
                    Skip tour
                  </button>

                  <motion.button
                    onClick={handleNext}
                    className="cursor-pointer min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                    style={{
                      background:
                        'linear-gradient(135deg, #c49a44, #a97e2e)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 20px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#08080c',
                      letterSpacing: '0.01em',
                      boxShadow: '0 2px 12px rgba(196, 154, 68, 0.2)',
                    }}
                    whileHover={{
                      scale: 1.04,
                      boxShadow: '0 4px 20px rgba(196, 154, 68, 0.35)',
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    aria-label={isLastStep ? 'Start exploring' : 'Next step'}
                  >
                    {isLastStep ? 'Start Exploring' : 'Next'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
