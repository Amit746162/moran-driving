import Link from 'next/link';

import { CalendarCheck, Search, ShieldCheck, Star } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { HeroSearch } from '@/features/marketing/hero-search';
import { APP_TAGLINE } from '@/lib/constants';

/** Landing page. Server Component — loads the live sports catalogue. */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: sports } = await supabase
    .from('sports')
    .select('slug, name, icon')
    .eq('is_active', true)
    .order('sort_order');

  const sportList = sports ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="container flex flex-col items-center py-20 text-center md:py-28">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-primary" />
            Trusted by athletes in 40+ countries
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            {APP_TAGLINE}
          </h1>
          <p className="mt-4 max-w-xl text-balance text-lg text-muted-foreground">
            Discover, compare and instantly book personal coaches across every
            sport — online or in person.
          </p>

          <div className="mt-8 flex w-full justify-center">
            <HeroSearch sports={sportList} />
          </div>
        </div>
      </section>

      {/* Sports grid */}
      <section className="container py-12">
        <h2 className="mb-6 text-2xl font-semibold">Browse by sport</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {sportList.map((sport) => (
            <Link
              key={sport.slug}
              href={`/coaches?sport=${sport.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="text-2xl">{sport.icon}</span>
              <span className="text-sm font-medium group-hover:text-primary">
                {sport.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold">
          Booking a coach is effortless
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Feature
            icon={Search}
            title="Discover"
            desc="Filter by sport, city, price, language and availability to find your perfect coach."
          />
          <Feature
            icon={CalendarCheck}
            title="Book instantly"
            desc="See real-time availability and lock in a slot in seconds — no back-and-forth."
          />
          <Feature
            icon={ShieldCheck}
            title="Train with confidence"
            desc="Verified reviews, certified coaches and secure bookings, every time."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="max-w-2xl text-balance text-3xl font-bold">
            Are you a coach? Grow your business with Coachly.
          </h2>
          <p className="max-w-lg text-primary-foreground/90">
            Set your schedule, showcase your expertise and get booked by athletes
            worldwide.
          </p>
          <Link href="/register?role=coach">
            <Button size="lg" variant="secondary">
              Start coaching
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Search;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
