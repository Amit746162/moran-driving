'use client';

import { useState } from 'react';
import Link from 'next/link';

import { LayoutDashboard, Heart, CalendarDays, LogOut, Shield } from 'lucide-react';

import { signOutAction } from '@/features/auth/actions';
import { Avatar } from '@/components/ui/avatar';
import { type UserRole } from '@/lib/supabase/database.types';
import { ROUTES } from '@/lib/constants';

interface UserMenuProps {
  name?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
}

/** Account dropdown shown when a user is signed in. */
export function UserMenu({ name, avatarUrl, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 transition-shadow hover:shadow-card"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={avatarUrl} name={name} size={32} />
        <span className="hidden text-sm font-medium sm:block">
          {name?.split(' ')[0] ?? 'Account'}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-card-hover"
        >
          <MenuLink href={ROUTES.dashboard} icon={LayoutDashboard}>
            Dashboard
          </MenuLink>
          <MenuLink href={ROUTES.bookings} icon={CalendarDays}>
            My bookings
          </MenuLink>
          {role === 'athlete' && (
            <MenuLink href={ROUTES.favorites} icon={Heart}>
              Favorites
            </MenuLink>
          )}
          {role === 'admin' && (
            <MenuLink href={ROUTES.admin} icon={Shield}>
              Admin panel
            </MenuLink>
          )}
          <form action={signOutAction} className="border-t border-border">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: typeof LogOut;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  );
}
