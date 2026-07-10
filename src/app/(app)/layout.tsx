import { Navbar } from '@/components/layout/navbar';

/** Authenticated app shell (dashboard, bookings, favorites, onboarding). */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">{children}</main>
    </div>
  );
}
