import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}

/** Read-only star rating with optional review count. */
export function RatingStars({ rating, count, size = 14, className }: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className={cn(
                filled ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted',
              )}
            />
          );
        })}
      </div>
      {rating > 0 ? (
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      ) : (
        <span className="text-sm text-muted-foreground">New</span>
      )}
      {typeof count === 'number' && count > 0 && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
