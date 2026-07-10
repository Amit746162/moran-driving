import { type Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CalendarX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { getCurrentUser } from '@/features/auth/lib/get-user';
import { getMyBookings } from '@/features/bookings/queries';
import { BookingCard } from '@/features/bookings/components/booking-card';

export const metadata: Metadata = { title: 'My bookings' };

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/bookings');

  const { upcoming, past, role } = await getMyBookings();
  const isCoach = role === 'coach';

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">My bookings</h1>
      <p className="mt-1 text-muted-foreground">
        {isCoach
          ? 'Manage your incoming session requests and history.'
          : 'Track your upcoming and past training sessions.'}
      </p>

      {/* Upcoming */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          Upcoming <span className="text-muted-foreground">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No upcoming sessions"
            description={
              isCoach
                ? 'New booking requests from athletes will appear here.'
                : 'Find a coach and book your first session.'
            }
            action={
              !isCoach && (
                <Link href="/coaches">
                  <Button>Find a coach</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} isCoach={isCoach} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">
            Past <span className="text-muted-foreground">({past.length})</span>
          </h2>
          <div className="space-y-4">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} isCoach={isCoach} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
