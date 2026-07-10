'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Plus, Trash2, Palmtree } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WEEKDAYS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/utils';
import {
  type AvailabilityRuleRow,
} from '@/lib/supabase/database.types';
import {
  addAvailabilityRule,
  addBlock,
  deleteAvailabilityRule,
  deleteBlock,
} from '../actions';

interface BlockRow {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

/**
 * Coach availability manager: recurring weekly schedule + vacation/block dates.
 * Slots for athletes are derived from these rules server-side.
 */
export function AvailabilityEditor({
  rules,
  blocks,
}: {
  rules: AvailabilityRuleRow[];
  blocks: BlockRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // New-rule form state
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [slotMinutes, setSlotMinutes] = useState(60);

  // New-block form state
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  function submitRule() {
    startTransition(async () => {
      await addAvailabilityRule({
        weekday,
        start_time: start,
        end_time: end,
        slot_minutes: slotMinutes,
      });
      router.refresh();
    });
  }

  function submitBlock() {
    if (!blockStart || !blockEnd) return;
    startTransition(async () => {
      await addBlock({
        starts_at: new Date(blockStart).toISOString(),
        ends_at: new Date(blockEnd).toISOString(),
        reason: blockReason || undefined,
      });
      setBlockStart('');
      setBlockEnd('');
      setBlockReason('');
      router.refresh();
    });
  }

  const rulesByDay = WEEKDAYS.map((_, i) => rules.filter((r) => r.weekday === i));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {WEEKDAYS.map((day, i) => (
              <div key={day} className="flex items-start gap-3">
                <span className="w-24 pt-1.5 text-sm font-medium">{day}</span>
                <div className="flex-1 space-y-1.5">
                  {rulesByDay[i]!.length === 0 && (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  )}
                  {rulesByDay[i]!.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-sm"
                    >
                      <span>
                        {rule.start_time.slice(0, 5)}–{rule.end_time.slice(0, 5)} ·{' '}
                        {rule.slot_minutes}m
                      </span>
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            await deleteAvailabilityRule(rule.id);
                            router.refresh();
                          })
                        }
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add rule */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium">Add time block</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Day</Label>
                <select
                  value={weekday}
                  onChange={(e) => setWeekday(Number(e.target.value))}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {WEEKDAYS.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Session length</Label>
                <select
                  value={slotMinutes}
                  onChange={(e) => setSlotMinutes(Number(e.target.value))}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {[30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} min
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Start</Label>
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <Label>End</Label>
                <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <Button onClick={submitRule} isLoading={isPending} className="w-full">
              <Plus className="h-4 w-4" /> Add to schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocks / vacations */}
      <Card>
        <CardHeader>
          <CardTitle>Time off & blocked dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked dates.</p>
          ) : (
            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Palmtree className="h-4 w-4 text-primary" />
                    {formatDate(block.starts_at)} {formatTime(block.starts_at)} →{' '}
                    {formatDate(block.ends_at)} {formatTime(block.ends_at)}
                    {block.reason && (
                      <span className="text-muted-foreground">· {block.reason}</span>
                    )}
                  </span>
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteBlock(block.id);
                        router.refresh();
                      })
                    }
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium">Block a period</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Input
                  type="datetime-local"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                />
              </div>
              <div>
                <Label>To</Label>
                <Input
                  type="datetime-local"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                />
              </div>
            </div>
            <Input
              placeholder="Reason (optional) — e.g. Vacation"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
            <Button
              onClick={submitBlock}
              isLoading={isPending}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4" /> Block period
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
