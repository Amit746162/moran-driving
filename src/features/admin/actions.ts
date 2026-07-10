'use server';

import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@/lib/supabase/server';
import { requireRole } from '@/features/auth/lib/get-user';
import { type UserRole } from '@/lib/supabase/database.types';

async function guard(): Promise<boolean> {
  return Boolean(await requireRole('admin'));
}

export async function adminSetCoachPublished(coachId: string, published: boolean) {
  if (!(await guard())) return { ok: false, error: 'Forbidden' };
  const supabase = createAdminClient();
  await supabase
    .from('coach_profiles')
    .update({ is_published: published })
    .eq('id', coachId);
  revalidatePath('/admin/coaches');
  return { ok: true };
}

export async function adminSetUserRole(userId: string, role: UserRole) {
  if (!(await guard())) return { ok: false, error: 'Forbidden' };
  const supabase = createAdminClient();
  await supabase.from('profiles').update({ role }).eq('id', userId);
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function adminAddSport(input: { name: string; slug: string; icon: string }) {
  if (!(await guard())) return { ok: false, error: 'Forbidden' };
  const supabase = createAdminClient();
  const { error } = await supabase.from('sports').insert({
    name: input.name,
    slug: input.slug,
    icon: input.icon,
  });
  if (error) return { ok: false, error: 'Could not add sport (slug must be unique).' };
  revalidatePath('/admin/sports');
  return { ok: true };
}

export async function adminToggleSport(sportId: string, isActive: boolean) {
  if (!(await guard())) return { ok: false, error: 'Forbidden' };
  const supabase = createAdminClient();
  await supabase.from('sports').update({ is_active: isActive }).eq('id', sportId);
  revalidatePath('/admin/sports');
  return { ok: true };
}
