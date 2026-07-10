import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/** Public marketing/browse shell with global nav + footer. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
