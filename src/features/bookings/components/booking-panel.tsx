'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Calendar, Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import { type SessionMode } from '@/lib/supabase/database.types';
import { type Slot } from '@/features/availability/lib/generate-slots';
import { createBooking } from '../actions';

interface Sport {
  id: string;
  name: string;
  icon: string | null;
}

interface BookingPanelProps {
  coachId: string;
  price: number;
  currency: string;
  mode: SessionMode;
  sports: Sport[];
  slotsByDay: Record<string, Slot[]>;
}

/**
 * Calendly-style booking widget. Only receives genuinely-free slots from the
 * server, picks day → time → confirms, and shows a success state on completion.
 */
export function BookingPanel({
  coachId,
  price,
  currency,
  mode,
  sports,
  slotsByDay,
}: BookingPanelProps) {
  const router = useRouter();
  const days = useMemo(() => Object.keys(slotsByDay).sort(), [slotsByDay]);

  const [selectedDay, setSelectedDay] = useState(days[0] ?? '');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [sportId, setSportId] = useState(sports[0]?.id ?? '');
  const [sessionMode, setSessionMode] = useState<'online' | 'in_person'>(
    mode === 'online' ? 'online' : 'in_person',
  );
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleBook() {
    if (!selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await createBooking({
        coachId,
        sportId,
        start: selectedSlot.start,
        end: selectedSlot.end,
        mode: sessionMode,
        note,
      });
      if (result.ok) {
        setConfirmed(true);
        router.refresh(); // refresh slots so the booked time disappears
      } else {
        setError(result.error ?? 'Something went wrong.');
        router.refresh();
      }
    });
  }

  if (confirmed) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-7 w-7" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Booking requested!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedSlot && formatSlot(selectedSlot)}. The coach will confirm
              shortly.
            </p>
          </div>
          <Button className="w-full" onClick={() => router.push('/bookings')}>
            View my bookings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">{formatPrice(price, currency)}</span>
            <span className="text-sm text-muted-foreground"> / session</span>
          </div>
        </div>

        {days.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <Calendar className="mx-auto mb-2 h-5 w-5" />
            No availability in the next two weeks.
          </div>
        ) : (
          <>
            {/* Day selector */}
            <div>
              <p className="mb-2 text-sm font-medium">Select a day</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((day) => {
                  const d = new Date(`${day}T00:00:00Z`);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedSlot(null);
                      }}
                      className={cn(
                        'flex min-w-[64px] shrink-0 flex-col items-center rounded-lg border px-3 py-2 transition-colors',
                        selectedDay === day
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted',
                      )}
                    >
                      <span className="text-xs text-muted-foreground">
                        {d.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' })}
                      </span>
                      <span className="text-lg font-semibold">{d.getUTCDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <p className="mb-2 text-sm font-medium">Available times</p>
              <div className="grid grid-cols-3 gap-2">
                {(slotsByDay[selectedDay] ?? []).map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'rounded-lg border py-2 text-sm font-medium transition-colors',
                      selectedSlot?.start === slot.start
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary',
                    )}
                  >
                    {new Date(slot.start).toLocaleTimeString('en', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'UTC',
                    })}
                  </button>
                ))}
              </div>
            </div>

            {/* Sport */}
            {sports.length > 1 && (
              <div>
                <p className="mb-2 text-sm font-medium">Sport</p>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mode */}
            {mode === 'both' && (
              <div className="flex gap-2">
                {(['in_person', 'online'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSessionMode(m)}
                    className={cn(
                      'flex-1 rounded-lg border py-2 text-sm capitalize transition-colors',
                      sessionMode === m
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the coach (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedSlot || isPending}
              onClick={handleBook}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedSlot ? `Book for ${formatPrice(price, currency)}` : 'Select a time'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You won’t be charged yet — the coach confirms your request first.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatSlot(slot: Slot) {
  const d = new Date(slot.start);
  return d.toLocaleString('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}
