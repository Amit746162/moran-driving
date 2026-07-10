import { MessageSquare } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

import { type CoachReview } from '../types';
import { RatingStars } from './rating-stars';

export function CoachReviews({ reviews }: { reviews: CoachReview[] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Be the first to train with this coach and share your experience."
      />
    );
  }

  return (
    <ul className="space-y-5">
      {reviews.map((review) => (
        <li key={review.id} className="flex gap-4">
          <Avatar
            src={review.athlete?.avatar_url}
            name={review.athlete?.full_name}
            size={44}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {review.athlete?.full_name ?? 'Athlete'}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.created_at)}
              </span>
            </div>
            <RatingStars rating={review.rating} size={13} className="mt-1" />
            {review.comment && (
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
