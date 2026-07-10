import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import { type ProfileRow } from '@/lib/supabase/database.types';

export interface AuthUser {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
}

/**
 * Resolve the current authenticated user + domain profile on the server.
 * `cache()` dedupes calls within a single request (layout + page both use it).
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { id: user.id, email: user.email ?? null, profile };
});

/** Convenience guard for Server Components / actions that require a role. */
export async function requireRole(...roles: ProfileRow['role'][]) {
  const user = await getCurrentUser();
  if (!user?.profile || !roles.includes(user.profile.role)) return null;
  return user;
}
