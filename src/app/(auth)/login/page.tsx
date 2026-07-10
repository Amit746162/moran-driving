import { type Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { GoogleButton } from '@/features/auth/components/google-button';
import { LoginForm } from '@/features/auth/components/login-form';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Log in to manage your sessions and bookings.
      </p>

      <div className="mt-8 space-y-4">
        <Suspense fallback={null}>
          <GoogleButton />
        </Suspense>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Coachly?{' '}
        <Link href={ROUTES.register} className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
