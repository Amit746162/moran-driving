'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/features/auth/actions';
import { type UserRole } from '@/lib/supabase/database.types';
import { ROUTES } from '@/lib/constants';

interface MobileNavProps {
  isAuthed: boolean;
  name?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
}

/** Slide-down mobile menu (hidden on md+). */
export function MobileNav({ isAuthed, role }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-border bg-background p-4 shadow-card-hover">
          <div className="flex flex-col gap-1">
            <MobileLink href={ROUTES.search} onClick={() => setOpen(false)}>
              Find a coach
            </MobileLink>
            <MobileLink href="/become-a-coach" onClick={() => setOpen(false)}>
              Become a coach
            </MobileLink>

            <div className="my-2 h-px bg-border" />

            {isAuthed ? (
              <>
                <MobileLink href={ROUTES.dashboard} onClick={() => setOpen(false)}>
                  Dashboard
                </MobileLink>
                <MobileLink href={ROUTES.bookings} onClick={() => setOpen(false)}>
                  My bookings
                </MobileLink>
                {role === 'athlete' && (
                  <MobileLink href={ROUTES.favorites} onClick={() => setOpen(false)}>
                    Favorites
                  </MobileLink>
                )}
                {role === 'admin' && (
                  <MobileLink href={ROUTES.admin} onClick={() => setOpen(false)}>
                    Admin panel
                  </MobileLink>
                )}
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href={ROUTES.login} onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href={ROUTES.register} onClick={() => setOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}
