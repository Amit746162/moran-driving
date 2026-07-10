import Link from 'next/link';

import { Search } from 'lucide-react';

import { getCurrentUser } from '@/features/auth/lib/get-user';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

import { Logo } from './logo';
import { UserMenu } from './user-menu';
import { MobileNav } from './mobile-nav';

/** Top navigation. Server Component — resolves session for the account menu. */
export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href={ROUTES.search}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Find a coach
            </Link>
            <Link
              href="/become-a-coach"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Become a coach
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href={ROUTES.search} className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Search coaches">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {user?.profile ? (
            <div className="hidden md:block">
              <UserMenu
                name={user.profile.full_name}
                avatarUrl={user.profile.avatar_url}
                role={user.profile.role}
              />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href={ROUTES.login}>
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button>Sign up</Button>
              </Link>
            </div>
          )}

          <MobileNav
            isAuthed={!!user?.profile}
            name={user?.profile?.full_name}
            avatarUrl={user?.profile?.avatar_url}
            role={user?.profile?.role}
          />
        </div>
      </div>
    </header>
  );
}
