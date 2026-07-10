'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/features/auth/lib/get-user';

async function getMyCoachId(): Promise<string | null> {
  const user = await requireRole('coach');
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('coach_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();
  return data?.id ?? null;
}

export async function addAvailabilityRule(input: {
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
}) {
  const coachId = await getMyCoachId();
  if (!coachId) return { ok: false, error: 'Not a coach.' };
  if (input.end_time <= input.start_time) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('availability_rules').insert({
    coach_id: coachId,
    weekday: input.weekday,
    start_time: input.start_time,
    end_time: input.end_time,
    slot_minutes: input.slot_minutes,
  });
  if (error) return { ok: false, error: 'Could not add availability.' };
  revalidatePath('/availability');
  return { ok: true };
}

export async function deleteAvailabilityRule(ruleId: string) {
  const coachId = await getMyCoachId();
  if (!coachId) return { ok: false, error: 'Not a coach.' };
  const supabase = await createClient();
  await supabase
    .from('availability_rules')
    .delete()
    .eq('id', ruleId)
    .eq('coach_id', coachId);
  revalidatePath('/availability');
  return { ok: true };
}

export async function addBlock(input: {
  starts_at: string;
  ends_at: string;
  reason?: string;
}) {
  const coachId = await getMyCoachId();
  if (!coachId) return { ok: false, error: 'Not a coach.' };
  if (input.ends_at <= input.starts_at) {
    return { ok: false, error: 'End must be after start.' };
  }
  const supabase = await createClient();
  const { error } = await supabase.from('availability_blocks').insert({
    coach_id: coachId,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    reason: input.reason ?? null,
  });
  if (error) return { ok: false, error: 'Could not add the block.' };
  revalidatePath('/availability');
  return { ok: true };
}

export async function deleteBlock(blockId: string) {
  const coachId = await getMyCoachId();
  if (!coachId) return { ok: false, error: 'Not a coach.' };
  const supabase = await createClient();
  await supabase
    .from('availability_blocks')
    .delete()
    .eq('id', blockId)
    .eq('coach_id', coachId);
  revalidatePath('/availability');
  return { ok: true };
}
