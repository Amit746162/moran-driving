'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { type BookingStatus } from '@/lib/supabase/database.types';
import { updateBookingStatus } from '../actions';

/**
 * Role-aware action buttons for a booking. Coaches confirm / complete /
 * no-show; both parties can cancel. Allowed transitions are enforced server-side.
 */
export function BookingActions({
  bookingId,
  status,
  isCoach,
}: {
  bookingId: string;
  status: BookingStatus;
  isCoach: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function act(next: BookingStatus, reason?: string) {
    startTransition(async () => {
      await updateBookingStatus(bookingId, next, reason);
      router.refresh();
    });
  }

  const buttons: React.ReactNode[] = [];

  if (isCoach && status === 'pending') {
    buttons.push(
      <Button key="confirm" size="sm" onClick={() => act('confirmed')} isLoading={isPending}>
        Confirm
      </Button>,
    );
  }
  if (isCoach && status === 'confirmed') {
    buttons.push(
      <Button key="complete" size="sm" onClick={() => act('completed')} isLoading={isPending}>
        Mark completed
      </Button>,
      <Button
        key="noshow"
        size="sm"
        variant="outline"
        onClick={() => act('no_show')}
        isLoading={isPending}
      >
        No show
      </Button>,
    );
  }
  if (['pending', 'confirmed'].includes(status)) {
    buttons.push(
      <Button
        key="cancel"
        size="sm"
        variant="ghost"
        className="text-destructive"
        onClick={() => act('cancelled', 'Cancelled by user')}
        isLoading={isPending}
      >
        Cancel
      </Button>,
    );
  }

  if (buttons.length === 0) return null;
  return <div className="flex flex-wrap gap-2">{buttons}</div>;
}
