import { type CoachSearchParams } from '../types';

type RawParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  const value = Array.isArray(v) ? v[0] : v;
  return value && value.length > 0 ? value : undefined;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** Normalize raw Next.js searchParams into a typed CoachSearchParams. */
export function parseSearchParams(raw: RawParams): CoachSearchParams {
  const mode = str(raw.mode);
  const availability = str(raw.availability);
  return {
    sport: str(raw.sport),
    country: str(raw.country),
    city: str(raw.city),
    region: str(raw.region),
    language: str(raw.language),
    mode:
      mode === 'online' || mode === 'in_person' || mode === 'both' ? mode : undefined,
    minPrice: num(raw.minPrice),
    maxPrice: num(raw.maxPrice),
    minRating: num(raw.minRating),
    availability:
      availability === 'today' || availability === 'tomorrow'
        ? availability
        : undefined,
    sort: str(raw.sort),
    page: num(raw.page),
  };
}
