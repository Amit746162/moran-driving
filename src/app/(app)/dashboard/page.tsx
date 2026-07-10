import { type Metadata } from 'next';
import { redirect } from 'next/navigation';

import { CalendarDays, Heart, Star, Wallet } from 'lucide-react';

import { getCurrentUser } from '@/features/auth/lib/get-user';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Dashboard' };

/**
 * Placeholder dashboard (fully built in Phase 4).
 * Confirms the auth + protected-route pipeline works end to end.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect('/login?redirect=/dashboard');

  const isCoach = user.profile.role === 'coach';
  const firstName = user.profile.full_name?.split(' ')[0] ?? 'there';

  const stats = isCoach
    ? [
        { icon: CalendarDays, label: 'Upcoming sessions', value: '—' },
        { icon: Wallet, label: 'Revenue', value: '—' },
        { icon: Star, label: 'Rating', value: '—' },
      ]
    : [
        { icon: CalendarDays, label: 'Upcoming sessions', value: '—' },
        { icon: Heart, label: 'Favorite coaches', value: '—' },
        { icon: Star, label: 'Reviews written', value: '—' },
      ];

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back, {firstName} 👋
      </h1>
      <p className="mt-1 text-muted-foreground">
        {isCoach
          ? 'Here’s an overview of your coaching business.'
          : 'Here’s what’s happening with your training.'}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-10 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Full dashboards, booking management and analytics arrive in Phase 3 & 4.
      </p>
    </div>
  );
}
