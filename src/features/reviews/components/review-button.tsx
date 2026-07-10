'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { submitReview } from '../actions';

/** Inline "leave a review" flow that expands into a rating + comment form. */
export function ReviewButton({
  coachId,
  bookingId,
}: {
  coachId: string;
  bookingId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return <span className="text-xs text-success">Thanks for your review!</span>;
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Star className="h-3.5 w-3.5" /> Leave a review
      </Button>
    );
  }

  function handleSubmit() {
    if (rating === 0) return;
    startTransition(async () => {
      const result = await submitReview({ coachId, bookingId, rating, comment });
      if (result.ok) {
        setDone(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="w-64 rounded-xl border border-border bg-card p-3 shadow-card">
      <div className="mb-2 flex justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
              aria-label={`${value} star`}
            >
              <Star
                className={cn(
                  'h-6 w-6 transition-colors',
                  (hover || rating) >= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted',
                )}
              />
            </button>
          );
        })}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={2}
        className="mb-2 w-full resize-none rounded-lg border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={rating === 0 || isPending}
          onClick={handleSubmit}
          isLoading={isPending}
        >
          Submit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
