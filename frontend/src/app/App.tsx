import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Providers } from './providers';
import { useProgressStore } from '@/shared/stores/progressStore';

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
