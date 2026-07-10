'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MapPin, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Landing hero search. Composes a query string and routes to /coaches.
 * The full filter UI lives on the search page (Phase 2).
 */
export function HeroSearch({ sports }: { sports: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');

  function handleSearch() {
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (location) params.set('city', location);
    router.push(`/coaches?${params.toString()}`);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-card-hover sm:flex-row sm:items-center sm:rounded-full">
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="h-11 w-full bg-transparent text-sm focus:outline-none"
          aria-label="Sport"
        >
          <option value="">Any sport</option>
          {sports.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden h-8 w-px bg-border sm:block" />

      <div className="flex flex-1 items-center gap-2 px-3">
        <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="City or region"
          className="h-11 w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          aria-label="Location"
        />
      </div>

      <Button size="lg" className="rounded-full" onClick={handleSearch}>
        Search
      </Button>
    </div>
  );
}
