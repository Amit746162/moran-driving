import { supabase } from './supabase';

export interface Slot {
  start: string;
  end: string;
}

const MS_MIN = 60_000;

function overlaps(aS: number, aE: number, bS: number, bE: number) {
  return aS < bE && bS < aE;
}

/**
 * Fetch a coach's availability config + existing bookings and expand into
 * concrete free slots for the next `days` days. Mirrors the web app's engine.
 */
export async function getCoachSlots(coachId: string, days = 14): Promise<Slot[]> {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + days);

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

  const blockRanges = (blocks ?? []).map((b) => [
    new Date(b.starts_at).getTime(),
    new Date(b.ends_at).getTime(),
  ]);
  const bookingRanges = (bookings ?? []).map((b) => [
    new Date(b.starts_at).getTime(),
    new Date(b.ends_at).getTime(),
  ]);

  const earliest = Date.now() + 60 * MS_MIN;
  const slots: Slot[] = [];

  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()),
  );

  while (cursor <= end) {
    const weekday = cursor.getUTCDay();
    for (const rule of rules ?? []) {
      if (rule.weekday !== weekday) continue;
      const [sh, sm] = rule.start_time.split(':').map(Number);
      const [eh, em] = rule.end_time.split(':').map(Number);
      const dayStart = Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate(),
        sh,
        sm,
      );
      const dayEnd = Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate(),
        eh,
        em,
      );
      const step = rule.slot_minutes * MS_MIN;
      for (let t = dayStart; t + step <= dayEnd; t += step) {
        if (t < earliest) continue;
        if (blockRanges.some(([bs, be]) => overlaps(t, t + step, bs, be))) continue;
        if (bookingRanges.some(([bs, be]) => overlaps(t, t + step, bs, be))) continue;
        slots.push({
          start: new Date(t).toISOString(),
          end: new Date(t + step).toISOString(),
        });
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

export function groupByDay(slots: Slot[]): Record<string, Slot[]> {
  return slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const day = s.start.slice(0, 10);
    (acc[day] ??= []).push(s);
    return acc;
  }, {});
}
