'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ArrowUpDown } from 'lucide-react';

import { SORT_OPTIONS } from '@/lib/constants';

/** URL-driven sort control for the coach search results. */
export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') ?? 'rating';

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <span className="hidden text-muted-foreground sm:inline">Sort by</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
