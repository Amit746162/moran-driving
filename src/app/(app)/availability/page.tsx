import { type Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CalendarClock } from 'lucide-react';
import { getMyCoachProfile } from '@/features/coaches/lib/get-my-coach';
import { getCoachAvailability } from '@/features/availability/queries';
import { AvailabilityEditor } from '@/features/availability/components/availability-editor';

export const metadata: Metadata = { title: 'Availability' };

export default async function AvailabilityPage() {
  const coach = await getMyCoachProfile();
  if (!coach) {
    // Non-coaches shouldn't be here; coaches without a profile finish onboarding.
    redirect('/coach/onboarding');
  }

  const { rules, blocks } = await getCoachAvailability(coach.id);

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
          <p className="mt-1 text-muted-foreground">
            Define when athletes can book you. Slots are generated automatically.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>

      {!coach.is_published && (
        <EmptyState
          icon={CalendarClock}
          title="Publish your profile to receive bookings"
          description="Your availability is saved, but athletes can only book once your profile is published."
          className="mb-6"
          action={
            <Link href="/coach/onboarding">
              <Button>Finish onboarding</Button>
            </Link>
          }
        />
      )}

      <AvailabilityEditor rules={rules} blocks={blocks} />
    </div>
  );
}
