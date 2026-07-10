import { type Metadata } from 'next';
import { Suspense } from 'react';

import { SearchX } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/empty-state';
import { searchCoaches } from '@/features/coaches/queries';
import { parseSearchParams } from '@/features/coaches/lib/parse-search-params';
import { CoachCard } from '@/features/coaches/components/coach-card';
import { CoachGridSkeleton } from '@/features/coaches/components/coach-card-skeleton';
import { SearchFilters } from '@/features/coaches/components/search-filters';
import { SortSelect } from '@/features/coaches/components/sort-select';
import { Pagination } from '@/features/coaches/components/pagination';
import { getFavoriteIds } from '@/features/favorites/queries';

export const metadata: Metadata = {
  title: 'Find a coach',
  description: 'Search and filter thousands of sports coaches worldwide.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const params = parseSearchParams(raw);

  const supabase = await createClient();
  const { data: sports } = await supabase
    .from('sports')
    .select('slug, name')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <Suspense fallback={null}>
            <SearchFilters sports={sports ?? []} />
          </Suspense>
        </div>

        {/* Results */}
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold sm:text-2xl">Coaches</h1>
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>

          <Suspense key={JSON.stringify(params)} fallback={<CoachGridSkeleton />}>
            <Results params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function Results({
  params,
}: {
  params: ReturnType<typeof parseSearchParams>;
}) {
  const [{ coaches, total, page, pageSize }, favorites] = await Promise.all([
    searchCoaches(params),
    getFavoriteIds(),
  ]);

  if (coaches.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No coaches match your search"
        description="Try widening your filters — remove a location or increase the price range."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {total} coach{total === 1 ? '' : 'es'} found
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <CoachCard
            key={coach.id}
            coach={coach}
            isFavorite={favorites.has(coach.id)}
          />
        ))}
      </div>
      <Pagination total={total} page={page} pageSize={pageSize} />
    </>
  );
}
