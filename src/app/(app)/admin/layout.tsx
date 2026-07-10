import { redirect } from 'next/navigation';
import Link from 'next/link';

import {
  BarChart3,
  CalendarRange,
  Dumbbell,
  Trophy,
  Users,
} from 'lucide-react';

import { getCurrentUser } from '@/features/auth/lib/get-user';

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coaches', label: 'Coaches', icon: Trophy },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
  { href: '/admin/sports', label: 'Sports', icon: Dumbbell },
];

/** Admin shell — guards the whole /admin subtree to admins only. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user?.profile) redirect('/login?redirect=/admin');
  if (user.profile.role !== 'admin') redirect('/dashboard');

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Admin panel</h1>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
