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
