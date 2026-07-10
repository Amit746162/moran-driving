import { type Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { HeartOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { getCurrentUser } from '@/features/auth/lib/get-user';
import { getFavoriteCoaches } from '@/features/favorites/queries';
import { CoachCard } from '@/features/coaches/components/coach-card';

export const metadata: Metadata = { title: 'Favorites' };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/favorites');

  const coaches = await getFavoriteCoaches();

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">Favorite coaches</h1>
      <p className="mt-1 text-muted-foreground">
        Coaches you’ve saved for later.
      </p>

      <div className="mt-8">
        {coaches.length === 0 ? (
          <EmptyState
            icon={HeartOff}
            title="No favorites yet"
            description="Tap the heart on any coach to save them here."
            action={
              <Link href="/coaches">
                <Button>Browse coaches</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} isFavorite />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
