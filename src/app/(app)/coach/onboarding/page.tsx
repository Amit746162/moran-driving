import { type Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/lib/get-user';
import { ensureCoachProfile, getMyCoachProfile } from '@/features/coaches/lib/get-my-coach';
import { OnboardingWizard } from '@/features/coaches/components/onboarding-wizard';

export const metadata: Metadata = { title: 'Coach onboarding' };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/coach/onboarding');
  if (user.profile?.role !== 'coach') redirect('/dashboard');

  // Make sure a coach_profile row exists, then load it + the sports catalogue.
  await ensureCoachProfile();
  const coach = await getMyCoachProfile();
  if (!coach) redirect('/dashboard');

  const supabase = await createClient();
  const [{ data: sports }, { data: coachSports }] = await Promise.all([
    supabase
      .from('sports')
      .select('id, slug, name, icon')
      .eq('is_active', true)
      .order('sort_order'),
    supabase.from('coach_sports').select('sport_id').eq('coach_id', coach.id),
  ]);

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set up your coach profile</h1>
        <p className="mt-1 text-muted-foreground">
          A great profile gets more bookings. It only takes a few minutes.
        </p>
      </div>

      <OnboardingWizard
        coach={coach}
        sports={sports ?? []}
        selectedSportIds={(coachSports ?? []).map((cs) => cs.sport_id)}
      />
    </div>
  );
}
