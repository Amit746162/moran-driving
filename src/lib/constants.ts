/**
 * Static configuration & option lists shared across features.
 * Sports are loaded from the DB (unlimited), but these constants back the
 * filter UI and forms with sensible defaults.
 */

export const APP_NAME = 'Coachly';
export const APP_TAGLINE = 'Book world-class coaches. Any sport. Anywhere.';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'ILS', 'BRL', 'AED'] as const;

export const LANGUAGES = [
  'English',
  'Spanish',
  'Portuguese',
  'French',
  'German',
  'Italian',
  'Arabic',
  'Hebrew',
  'Dutch',
] as const;

export const SESSION_MODES = [
  { value: 'in_person', label: 'In person' },
  { value: 'online', label: 'Online' },
  { value: 'both', label: 'Online & In person' },
] as const;

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest rated' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'reviews', label: 'Most reviews' },
  { value: 'newest', label: 'Newest' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  search: '/coaches',
  coach: (id: string) => `/coaches/${id}`,
  dashboard: '/dashboard',
  coachOnboarding: '/coach/onboarding',
  bookings: '/bookings',
  favorites: '/favorites',
  admin: '/admin',
} as const;
