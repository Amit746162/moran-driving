import { type Metadata } from 'next';

import {
  CalendarRange,
  CheckCircle2,
  DollarSign,
  Percent,
  Trophy,
  Users,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { getAdminStats } from '@/features/admin/queries';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin · Overview' };

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { icon: Users, label: 'Total users', value: String(stats.users) },
    {
      icon: Trophy,
      label: 'Coaches',
      value: `${stats.publishedCoaches}/${stats.coaches}`,
      hint: 'published / total',
    },
    { icon: CalendarRange, label: 'Bookings', value: String(stats.bookings) },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: String(stats.completedBookings),
    },
    {
      icon: DollarSign,
      label: 'Gross revenue',
      value: formatPrice(stats.grossRevenue),
    },
    {
      icon: Percent,
      label: 'Platform commission',
      value: formatPrice(stats.commission),
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Reports</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-xl font-semibold">{c.value}</p>
                {c.hint && <p className="text-xs text-muted-foreground">{c.hint}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
