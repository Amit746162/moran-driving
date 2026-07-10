'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dumbbell, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { signUpAction } from '@/features/auth/actions';
import { registerSchema, type RegisterInput } from '@/features/auth/schema';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get('role') === 'coach' ? 'coach' : 'athlete';

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: initialRole },
  });

  const role = watch('role');

  function onSubmit(values: RegisterInput) {
    setServerError(null);
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.set(k, String(v)));

    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Role selector */}
      <div>
        <Label>I want to join as</Label>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            active={role === 'athlete'}
            icon={User}
            label="Athlete"
            desc="Book coaches"
            onClick={() => setValue('role', 'athlete')}
          />
          <RoleCard
            active={role === 'coach'}
            icon={Dumbbell}
            label="Coach"
            desc="Offer sessions"
            onClick={() => setValue('role', 'coach')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" placeholder="Alex Morgan" {...register('full_name')} />
        {errors.full_name && (
          <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="At least 8 characters" {...register('password')} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" isLoading={isPending}>
        Create account
      </Button>
    </form>
  );
}

function RoleCard({
  active,
  icon: Icon,
  label,
  desc,
  onClick,
}: {
  active: boolean;
  icon: typeof User;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
        active
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border hover:border-foreground/20',
      )}
    >
      <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} />
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}
