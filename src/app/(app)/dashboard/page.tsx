import { type Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import {
  CalendarDays,
  CalendarPlus,
  Heart,
  Search,
  Settings,
  Star,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/features/auth/lib/get-user';
import { getMyBookings, getCoachSummary } from '@/features/bookings/queries';
import { getMyCoachProfile } from '@/features/coaches/lib/get-my-coach';
import { BookingCard } from '@/features/bookings/components/booking-card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect('/login?redirect=/dashboard');

  const firstName = user.profile.full_name?.split(' ')[0] ?? 'there';
  const isCoach = user.profile.role === 'coach';

  if (isCoach) return <CoachDashboard firstName={firstName} />;
  return <AthleteDashboard firstName={firstName} />;
}

/* ─────────────────────────── Coach ─────────────────────────── */
async function CoachDashboard({ firstName }: { firstName: string }) {
  const coach = await getMyCoachProfile();
  if (!coach) redirect('/coach/onboarding');

  const [{ upcoming }, summary] = await Promise.all([
    getMyBookings(),
    getCoachSummary(coach.id),
  ]);

  return (
    <div className="container py-10">
      <Header
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Here’s an overview of your coaching business."
        action={
          <div className="flex gap-2">
            <Link href="/availability">
              <Button variant="outline">
                <CalendarPlus className="h-4 w-4" /> Availability
              </Button>
            </Link>
            <Link href="/coach/onboarding">
              <Button variant="outline">
                <Settings className="h-4 w-4" /> Edit profile
              </Button>
            </Link>
          </div>
        }
      />

      {!coach.is_published && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <span>Your profile isn’t published yet — athletes can’t find you.</span>
          <Link href="/coach/onboarding">
            <Button size="sm">Publish now</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={CalendarDays}
          label="Upcoming sessions"
          value={String(summary.upcomingCount)}
        />
        <Stat
          icon={Wallet}
          label="Revenue (completed)"
          value={formatPrice(summary.totalRevenue, summary.currency)}
        />
        <Stat
          icon={Star}
          label="Rating"
          value={coach.rating_count > 0 ? coach.rating_avg.toFixed(1) : '—'}
          hint={`${coach.rating_count} reviews`}
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming sessions</h2>
          <Link href="/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming sessions"
            description="Booking requests from athletes will appear here."
          />
        ) : (
          <div className="space-y-4">
            {upcoming.slice(0, 5).map((b) => (
              <BookingCard key={b.id} booking={b} isCoach />
            ))}
          </div>
        )}
      </section>

      <PlaceholderRow />
    </div>
  );
}

/* ────────────────────────── Athlete ────────────────────────── */
async function AthleteDashboard({ firstName }: { firstName: string }) {
  const { upcoming, past } = await getMyBookings();

  return (
    <div className="container py-10">
      <Header
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Here’s what’s happening with your training."
        action={
          <Link href="/coaches">
            <Button>
              <Search className="h-4 w-4" /> Find a coach
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={CalendarDays} label="Upcoming sessions" value={String(upcoming.length)} />
        <Stat icon={Star} label="Completed sessions" value={String(past.filter((b) => b.status === 'completed').length)} />
        <Link href="/favorites">
          <Stat icon={Heart} label="Favorites" value="View" clickable />
        </Link>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming sessions</h2>
          <Link href="/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming sessions"
            description="Book your first session with a world-class coach."
            action={
              <Link href="/coaches">
                <Button>Browse coaches</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {upcoming.slice(0, 5).map((b) => (
              <BookingCard key={b.id} booking={b} isCoach={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────── Shared ────────────────────────── */
function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  clickable,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  hint?: string;
  clickable?: boolean;
}) {
  return (
    <Card className={clickable ? 'transition-shadow hover:shadow-card-hover' : ''}>
      <CardContent className="flex items-center gap-4 p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/** Placeholder tiles for features arriving in Phase 5. */
function PlaceholderRow() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {[
        { label: 'Messages', hint: 'Chat with athletes' },
        { label: 'Payouts', hint: 'Stripe Connect' },
        { label: 'Analytics', hint: 'Profile insights' },
      ].map((f) => (
        <Card key={f.label} className="opacity-70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{f.label}</p>
              <Badge>Soon</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{f.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
