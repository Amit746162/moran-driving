'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LANGUAGES, SESSION_MODES } from '@/lib/constants';
import { type SportRow } from '@/lib/supabase/database.types';

/**
 * Advanced filter panel. Every change is reflected in the URL query string so
 * results are shareable, bookmarkable and server-rendered.
 */
export function SearchFilters({ sports }: { sports: Pick<SportRow, 'slug' | 'name'>[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page'); // reset pagination on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const get = (k: string) => searchParams.get(k) ?? '';
  const hasFilters = [...searchParams.keys()].some((k) => k !== 'sort');

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="h-8 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Sport */}
      <Filter label="Sport">
        <select
          value={get('sport')}
          onChange={(e) => setParam('sport', e.target.value || null)}
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">All sports</option>
          {sports.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </Filter>

      {/* Location */}
      <Filter label="Country">
        <Input
          placeholder="e.g. Spain"
          defaultValue={get('country')}
          onBlur={(e) => setParam('country', e.target.value || null)}
        />
      </Filter>
      <Filter label="City">
        <Input
          placeholder="e.g. Barcelona"
          defaultValue={get('city')}
          onBlur={(e) => setParam('city', e.target.value || null)}
        />
      </Filter>

      {/* Price */}
      <Filter label="Price per session">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={get('minPrice')}
            onBlur={(e) => setParam('minPrice', e.target.value || null)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={get('maxPrice')}
            onBlur={(e) => setParam('maxPrice', e.target.value || null)}
          />
        </div>
      </Filter>

      {/* Rating */}
      <Filter label="Minimum rating">
        <div className="flex gap-2">
          {[4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() =>
                setParam('minRating', get('minRating') === String(r) ? null : String(r))
              }
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                get('minRating') === String(r)
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {r}★ & up
            </button>
          ))}
        </div>
      </Filter>

      {/* Mode */}
      <Filter label="Session type">
        <div className="space-y-1.5">
          {SESSION_MODES.map((m) => (
            <label
              key={m.value}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="mode"
                checked={get('mode') === m.value}
                onChange={() => setParam('mode', m.value)}
                className="accent-primary"
              />
              {m.label}
            </label>
          ))}
        </div>
      </Filter>

      {/* Language */}
      <Filter label="Language">
        <select
          value={get('language')}
          onChange={(e) => setParam('language', e.target.value || null)}
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Any language</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </Filter>

      {/* Availability */}
      <Filter label="Availability">
        <div className="flex gap-2">
          {(['today', 'tomorrow'] as const).map((a) => (
            <button
              key={a}
              onClick={() =>
                setParam('availability', get('availability') === a ? null : a)
              }
              className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                get('availability') === a
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </Filter>
    </aside>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2">{label}</Label>
      {children}
    </div>
  );
}
