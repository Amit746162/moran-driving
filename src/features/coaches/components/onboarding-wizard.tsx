'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Check, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CURRENCIES, LANGUAGES, SESSION_MODES } from '@/lib/constants';
import {
  type CoachProfileRow,
  type SportRow,
} from '@/lib/supabase/database.types';
import {
  setCoachSports,
  setPublished,
  updateCoachProfile,
} from '../actions';

const STEPS = ['Basics', 'Sports', 'Pricing & location', 'Media', 'Publish'] as const;

interface Props {
  coach: CoachProfileRow;
  sports: Pick<SportRow, 'id' | 'slug' | 'name' | 'icon'>[];
  selectedSportIds: string[];
}

/** 5-step coach onboarding wizard. Each step persists before advancing. */
export function OnboardingWizard({ coach, sports, selectedSportIds }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(coach.is_published ? 4 : 0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state seeded from the existing profile.
  const [form, setForm] = useState({
    headline: coach.headline ?? '',
    bio: coach.bio ?? '',
    years_experience: coach.years_experience ?? 0,
    price_per_session: coach.price_per_session ?? 50,
    currency: coach.currency ?? 'USD',
    mode: coach.mode ?? 'both',
    country: coach.country ?? '',
    region: coach.region ?? '',
    city: coach.city ?? '',
    cover_image_url: coach.cover_image_url ?? '',
    certifications: coach.certifications.join(', '),
    languages: coach.languages,
    training_locations: coach.training_locations.join(', '),
    gallery: coach.gallery.join('\n'),
    videos: coach.videos.join('\n'),
  });
  const [selected, setSelected] = useState<string[]>(selectedSportIds);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toList(value: string, sep: RegExp | string = ',') {
    return value
      .split(sep)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function persistStep(index: number) {
    if (index === 0) {
      return updateCoachProfile({
        headline: form.headline,
        bio: form.bio,
        years_experience: Number(form.years_experience),
      });
    }
    if (index === 1) return setCoachSports(selected);
    if (index === 2) {
      return updateCoachProfile({
        price_per_session: Number(form.price_per_session),
        currency: form.currency,
        mode: form.mode,
        country: form.country,
        region: form.region,
        city: form.city,
      });
    }
    if (index === 3) {
      return updateCoachProfile({
        cover_image_url: form.cover_image_url || null,
        certifications: toList(form.certifications),
        languages: form.languages,
        training_locations: toList(form.training_locations),
        gallery: toList(form.gallery, /\n/),
        videos: toList(form.videos, /\n/),
      });
    }
    return { ok: true as const };
  }

  function next() {
    setError(null);
    startTransition(async () => {
      const result = await persistStep(step);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      await updateCoachProfile({ onboarding_step: step + 1 });
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    });
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      const result = await setPublished(true);
      if (!result.ok) {
        setError(result.error ?? 'Could not publish.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  i < step && 'border-primary bg-primary text-primary-foreground',
                  i === step && 'border-primary text-primary',
                  i > step && 'border-border text-muted-foreground',
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="hidden text-xs sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  'mx-2 h-0.5 flex-1',
                  i < step ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        {/* Step 0 — Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tell athletes about you</h2>
            <div>
              <Label>Headline</Label>
              <Input
                placeholder="UEFA-A licensed football coach"
                value={form.headline}
                onChange={(e) => update('headline', e.target.value)}
              />
            </div>
            <div>
              <Label>Bio</Label>
              <textarea
                rows={5}
                placeholder="Share your background, coaching philosophy and who you love working with…"
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <Label>Years of experience</Label>
              <Input
                type="number"
                min={0}
                value={form.years_experience}
                onChange={(e) => update('years_experience', Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Step 1 — Sports */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Which sports do you coach?</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sports.map((sport) => {
                const active = selected.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    onClick={() =>
                      setSelected((s) =>
                        active ? s.filter((x) => x !== sport.id) : [...s, sport.id],
                      )
                    }
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors',
                      active
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    <span className="text-lg">{sport.icon}</span>
                    {sport.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Pricing & location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pricing & location</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price per session</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_per_session}
                  onChange={(e) => update('price_per_session', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <select
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Session type</Label>
              <div className="flex gap-2">
                {SESSION_MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => update('mode', m.value)}
                    className={cn(
                      'flex-1 rounded-lg border py-2 text-sm transition-colors',
                      form.mode === m.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => update('country', e.target.value)} />
              </div>
              <div>
                <Label>Region</Label>
                <Input value={form.region} onChange={(e) => update('region', e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Media */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Showcase your work</h2>
            <div>
              <Label>Cover image URL</Label>
              <Input
                placeholder="https://…"
                value={form.cover_image_url}
                onChange={(e) => update('cover_image_url', e.target.value)}
              />
            </div>
            <div>
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const active = form.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      onClick={() =>
                        update(
                          'languages',
                          active
                            ? form.languages.filter((l) => l !== lang)
                            : [...form.languages, lang],
                        )
                      }
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm transition-colors',
                        active
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:bg-muted',
                      )}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Certifications (comma-separated)</Label>
              <Input
                placeholder="UEFA-A, First Aid, …"
                value={form.certifications}
                onChange={(e) => update('certifications', e.target.value)}
              />
            </div>
            <div>
              <Label>Training locations (comma-separated)</Label>
              <Input
                placeholder="Camp Nou training ground, Online, …"
                value={form.training_locations}
                onChange={(e) => update('training_locations', e.target.value)}
              />
            </div>
            <div>
              <Label>Gallery image URLs (one per line)</Label>
              <textarea
                rows={3}
                value={form.gallery}
                onChange={(e) => update('gallery', e.target.value)}
                className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <Label>Video URLs (one per line)</Label>
              <textarea
                rows={2}
                value={form.videos}
                onChange={(e) => update('videos', e.target.value)}
                className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Step 4 — Publish */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Rocket className="h-8 w-8" />
            </span>
            <h2 className="text-xl font-semibold">You’re ready to go live!</h2>
            <p className="text-muted-foreground">
              Publish your profile to appear in search and start receiving bookings.
              You can edit everything anytime from your dashboard.
            </p>
            <div className="rounded-xl border border-border p-4 text-left text-sm">
              <p className="font-medium">Next steps after publishing:</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Set your weekly availability</li>
                <li>• Add photos & videos to stand out</li>
                <li>• Respond quickly to booking requests</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={step === 0 || isPending}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} isLoading={isPending}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={publish} isLoading={isPending}>
              <Rocket className="h-4 w-4" /> Publish profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
