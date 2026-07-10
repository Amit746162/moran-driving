'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Heart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { toggleFavorite } from '../actions';

/**
 * Heart toggle with optimistic UI. Redirects to login if the user is a guest
 * (the server action throws, which we catch to route them to /login).
 */
export function FavoriteButton({
  coachId,
  initial = false,
  variant = 'floating',
}: {
  coachId: string;
  initial?: boolean;
  variant?: 'floating' | 'inline';
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next); // optimistic

    startTransition(async () => {
      try {
        const result = await toggleFavorite(coachId);
        setFavorited(result.favorited);
      } catch {
        setFavorited(!next); // rollback
        router.push(`/login?redirect=/coaches/${coachId}`);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
      className={cn(
        'flex items-center justify-center transition-transform active:scale-90',
        variant === 'floating' &&
          'h-9 w-9 rounded-full bg-background/90 shadow-card backdrop-blur hover:bg-background',
        variant === 'inline' &&
          'h-11 gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted',
      )}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-colors',
          favorited ? 'fill-primary text-primary' : 'text-foreground',
        )}
      />
      {variant === 'inline' && (favorited ? 'Saved' : 'Save')}
    </button>
  );
}
