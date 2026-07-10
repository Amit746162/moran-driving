import { Logo } from '@/components/layout/logo';

/** Split-screen auth shell: brand panel + form. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-black/10" />
        <Logo className="relative text-primary-foreground" />
        <div className="relative">
          <blockquote className="text-2xl font-semibold leading-snug">
            “I booked a UEFA-licensed coach in another country and trained the
            same week. Coachly makes it feel effortless.”
          </blockquote>
          <p className="mt-4 text-sm text-primary-foreground/80">
            — Daniela R., semi-pro footballer
          </p>
        </div>
        <div className="relative text-sm text-primary-foreground/70">
          10 sports · 40+ countries · instant booking
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
