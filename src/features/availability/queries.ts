import { addDays } from 'date-fns';

import { createClient } from '@/lib/supabase/server';

import { generateSlots, type Slot } from './lib/generate-slots';

/**
 * Compute the bookable slots for a coach over the next `days` days.
 * Combines availability rules, blocks and existing bookings server-side so the
 * client only ever receives genuinely-free slots (no double-booking possible).
 */
export async function getCoachSlots(coachId: string, days = 14): Promise<Slot[]> {
  const supabase = await createClient();
  const from = new Date();
  const to = addDays(from, days);

  const [{ data: rules }, { data: blocks }, { data: bookings }] = await Promise.all([
    supabase
      .from('availability_rules')
      .select('weekday, start_time, end_time, slot_minutes, is_active')
      .eq('coach_id', coachId)
      .eq('is_active', true),
    supabase
      .from('availability_blocks')
      .select('starts_at, ends_at')
      .eq('coach_id', coachId)
      .gte('ends_at', from.toISOString()),
    supabase
      .from('bookings')
      .select('starts_at, ends_at')
      .eq('coach_id', coachId)
      .in('status', ['pending', 'confirmed', 'completed'])
      .gte('starts_at', from.toISOString()),
  ]);

  return generateSlots({
    rules: rules ?? [],
    blocks: blocks ?? [],
    bookings: bookings ?? [],
    from,
    to,
  });
}

/** Load a coach's raw availability config (for the coach's own editor). */
export async function getCoachAvailability(coachId: string) {
  const supabase = await createClient();
  const [{ data: rules }, { data: blocks }] = await Promise.all([
    supabase
      .from('availability_rules')
      .select('*')
      .eq('coach_id', coachId)
      .order('weekday')
      .order('start_time'),
    supabase
      .from('availability_blocks')
      .select('*')
      .eq('coach_id', coachId)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at'),
  ]);

  return { rules: rules ?? [], blocks: blocks ?? [] };
}
