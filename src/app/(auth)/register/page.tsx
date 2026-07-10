import { type Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { GoogleButton } from '@/features/auth/components/google-button';
import { RegisterForm } from '@/features/auth/components/register-form';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = { title: 'Sign up' };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Join Coachly to book coaches or grow your coaching business.
      </p>

      <div className="mt-8 space-y-4">
        <Suspense fallback={null}>
          <GoogleButton />
        </Suspense>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or sign up with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href={ROUTES.login} className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
