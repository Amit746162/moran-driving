import { type Metadata } from 'next';

import { DataTable, TD, TH, THead, TR } from '@/components/ui/table';
import { BookingStatusBadge } from '@/features/bookings/components/booking-status-badge';
import { listBookings } from '@/features/admin/queries';
import { type BookingStatus } from '@/lib/supabase/database.types';
import { formatDate, formatPrice, formatTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin · Bookings' };

export default async function AdminBookingsPage() {
  const bookings = await listBookings();

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Bookings ({bookings.length})</h2>
      <DataTable>
        <THead>
          <TR>
            <TH>When</TH>
            <TH>Coach</TH>
            <TH>Athlete</TH>
            <TH>Sport</TH>
            <TH>Status</TH>
            <TH>Price</TH>
          </TR>
        </THead>
        <tbody>
          {bookings.map((b) => (
            <TR key={b.id}>
              <TD className="text-muted-foreground">
                {formatDate(b.starts_at)} · {formatTime(b.starts_at)}
              </TD>
              <TD className="font-medium">{b.coach?.profile?.full_name ?? '—'}</TD>
              <TD>{b.athlete?.full_name ?? '—'}</TD>
              <TD>
                {b.sport?.icon} {b.sport?.name}
              </TD>
              <TD>
                <BookingStatusBadge status={b.status as BookingStatus} />
              </TD>
              <TD>{formatPrice(Number(b.price), b.currency)}</TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}
