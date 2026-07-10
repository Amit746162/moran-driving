import Link from 'next/link';

import { Clock, MapPin, Video } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatPrice, formatTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

import { type BookingWithParties } from '../queries';
import { BookingStatusBadge } from './booking-status-badge';
import { BookingActions } from './booking-actions';
import { ReviewButton } from '@/features/reviews/components/review-button';

/**
 * A single booking row. Shows the "other party" depending on the viewer's role:
 * athletes see the coach, coaches see the athlete.
 */
export function BookingCard({
  booking,
  isCoach,
}: {
  booking: BookingWithParties;
  isCoach: boolean;
}) {
  const other = isCoach
    ? booking.athlete
    : (booking.coach?.profile ?? null);
  const otherName = other?.full_name ?? (isCoach ? 'Athlete' : 'Coach');

  const canReview =
    !isCoach && booking.status === 'completed' && booking.coach?.id;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar src={other?.avatar_url} name={otherName} size={52} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{otherName}</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.sport?.icon} {booking.sport?.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(booking.starts_at)} · {formatTime(booking.starts_at)}
            </span>
            <span className="flex items-center gap-1">
              {booking.mode === 'online' ? (
                <Video className="h-3.5 w-3.5" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
              {booking.mode === 'online' ? 'Online' : 'In person'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="font-semibold">
            {formatPrice(Number(booking.price), booking.currency)}
          </span>
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            isCoach={isCoach}
          />
          {canReview && (
            <ReviewButton coachId={booking.coach!.id} bookingId={booking.id} />
          )}
          {!isCoach && booking.coach?.id && (
            <Link
              href={ROUTES.coach(booking.coach.id)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View coach
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
