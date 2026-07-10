import { type Metadata } from 'next';
import Link from 'next/link';

import { CalendarCheck, Globe2, LineChart, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Become a coach',
  description: 'Grow your coaching business with Coachly.',
};

const benefits = [
  {
    icon: Globe2,
    title: 'Reach athletes worldwide',
    desc: 'Get discovered by motivated athletes searching for your exact sport and location.',
  },
  {
    icon: CalendarCheck,
    title: 'Bookings on autopilot',
    desc: 'Set your availability once. Athletes book open slots — no double-booking, ever.',
  },
  {
    icon: Wallet,
    title: 'Keep more of what you earn',
    desc: 'Transparent, low commission. Secure payouts land straight in your account.',
  },
  {
    icon: LineChart,
    title: 'Build your reputation',
    desc: 'Collect verified reviews and climb the rankings as you deliver great sessions.',
  },
];

export default function BecomeACoachPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container flex flex-col items-center py-20 text-center">
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Turn your expertise into a thriving coaching business
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Join Coachly and get booked by athletes around the world — on your
            schedule, your terms.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register?role=coach">
              <Button size="lg">Start coaching — it’s free</Button>
            </Link>
            <Link href="/coaches">
              <Button size="lg" variant="outline">
                Explore the marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <b.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">{b.title}</h3>
                <p className="mt-1 text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold">Ready in minutes</h2>
          <p className="max-w-md text-primary-foreground/90">
            Create your profile, set availability, and start receiving bookings today.
          </p>
          <Link href="/register?role=coach">
            <Button size="lg" variant="secondary">
              Create your coach profile
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
