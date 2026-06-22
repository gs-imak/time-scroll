import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useUIStore } from '@/shared/stores/uiStore';

export function Providers({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const setMobile = useUIStore(s => s.setMobile);

  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  // reducedMotion="user" makes every Framer Motion animation honor the OS
  // prefers-reduced-motion setting (transforms collapse to opacity-only).
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
