import Link from 'next/link';

import { Dumbbell } from 'lucide-react';

import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2 font-bold tracking-tight', className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Dumbbell className="h-5 w-5" />
      </span>
      <span className="text-lg">{APP_NAME}</span>
    </Link>
  );
}
