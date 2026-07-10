'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type UserRole } from '@/lib/supabase/database.types';
import {
  adminAddSport,
  adminSetCoachPublished,
  adminSetUserRole,
  adminToggleSport,
} from '../actions';

export function PublishToggle({
  coachId,
  published,
}: {
  coachId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant={published ? 'outline' : 'primary'}
      isLoading={isPending}
      onClick={() =>
        startTransition(async () => {
          await adminSetCoachPublished(coachId, !published);
          router.refresh();
        })
      }
    >
      {published ? 'Unpublish' : 'Publish'}
    </Button>
  );
}

export function RoleSelect({ userId, role }: { userId: string; role: UserRole }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <select
      value={role}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await adminSetUserRole(userId, e.target.value as UserRole);
          router.refresh();
        })
      }
      className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
    >
      <option value="athlete">Athlete</option>
      <option value="coach">Coach</option>
      <option value="admin">Admin</option>
    </select>
  );
}

export function SportToggle({
  sportId,
  isActive,
}: {
  sportId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      isLoading={isPending}
      onClick={() =>
        startTransition(async () => {
          await adminToggleSport(sportId, !isActive);
          router.refresh();
        })
      }
    >
      {isActive ? 'Disable' : 'Enable'}
    </Button>
  );
}

export function AddSportForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!name || !slug) return;
    setError(null);
    startTransition(async () => {
      const result = await adminAddSport({ name, slug, icon });
      if (!result.ok) {
        setError(result.error ?? 'Error');
        return;
      }
      setName('');
      setSlug('');
      setIcon('');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-4">
      <div className="flex-1">
        <Input
          placeholder="Name (e.g. Boxing)"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
          }}
        />
      </div>
      <div className="w-32">
        <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>
      <div className="w-20">
        <Input placeholder="🥊" value={icon} onChange={(e) => setIcon(e.target.value)} />
      </div>
      <Button onClick={submit} isLoading={isPending}>
        Add sport
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}
