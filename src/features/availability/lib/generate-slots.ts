import {
  type AvailabilityRuleRow,
  type BookingRow,
} from '@/lib/supabase/database.types';

export interface TimeBlock {
  starts_at: string;
  ends_at: string;
}

export interface Slot {
  /** ISO start of the slot. */
  start: string;
  /** ISO end of the slot. */
  end: string;
}

interface GenerateSlotsInput {
  rules: Pick<
    AvailabilityRuleRow,
    'weekday' | 'start_time' | 'end_time' | 'slot_minutes' | 'is_active'
  >[];
  blocks: TimeBlock[];
  bookings: Pick<BookingRow, 'starts_at' | 'ends_at'>[];
  /** Inclusive range to generate over. */
  from: Date;
  to: Date;
  /** Minimum lead time before a slot becomes bookable (minutes). */
  minLeadMinutes?: number;
}

const MS_PER_MINUTE = 60_000;

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Pure slot-generation engine.
 *
 * Expands recurring weekly availability rules across a date range into concrete
 * bookable slots, then removes anything that (a) is in the past / inside the
 * lead window, (b) overlaps a vacation/closure block, or (c) collides with an
 * existing active booking.
 *
 * Times in rules are interpreted as UTC wall-clock for deterministic behaviour;
 * a timezone-aware layer can wrap this in a future iteration.
 */
export function generateSlots({
  rules,
  blocks,
  bookings,
  from,
  to,
  minLeadMinutes = 60,
}: GenerateSlotsInput): Slot[] {
  const slots: Slot[] = [];
  const now = Date.now();
  const earliest = now + minLeadMinutes * MS_PER_MINUTE;

  const blockRanges = blocks.map((b) => [
    new Date(b.starts_at).getTime(),
    new Date(b.ends_at).getTime(),
  ]);
  const bookingRanges = bookings.map((b) => [
    new Date(b.starts_at).getTime(),
    new Date(b.ends_at).getTime(),
  ]);

  const activeRules = rules.filter((r) => r.is_active);

  // Iterate each UTC day in the range.
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()),
  );

  while (cursor <= end) {
    const weekday = cursor.getUTCDay();
    for (const rule of activeRules) {
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
      const step = rule.slot_minutes * MS_PER_MINUTE;

      for (let t = dayStart; t + step <= dayEnd; t += step) {
        const slotStart = t;
        const slotEnd = t + step;

        if (slotStart < earliest) continue;
        if (blockRanges.some(([bs, be]) => overlaps(slotStart, slotEnd, bs!, be!)))
          continue;
        if (bookingRanges.some(([bs, be]) => overlaps(slotStart, slotEnd, bs!, be!)))
          continue;

        slots.push({
          start: new Date(slotStart).toISOString(),
          end: new Date(slotEnd).toISOString(),
        });
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

/** Group flat slots by calendar day (YYYY-MM-DD) for calendar UIs. */
export function groupSlotsByDay(slots: Slot[]): Record<string, Slot[]> {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = slot.start.slice(0, 10);
    (acc[day] ??= []).push(slot);
    return acc;
  }, {});
}
