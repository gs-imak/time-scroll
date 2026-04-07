import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Providers } from './providers';
import { useProgressStore } from '@/shared/stores/progressStore';
// Import theme store early so data-theme is applied before first paint
import '@/shared/stores/themeStore';

export function App() {
  const updateStreak = useProgressStore(s => s.updateStreak);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
