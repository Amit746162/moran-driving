import { type Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { DataTable, TD, TH, THead, TR } from '@/components/ui/table';
import { listCoaches } from '@/features/admin/queries';
import { PublishToggle } from '@/features/admin/components/admin-controls';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin · Coaches' };

export default async function AdminCoachesPage() {
  const coaches = await listCoaches();

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Coaches ({coaches.length})</h2>
      <DataTable>
        <THead>
          <TR>
            <TH>Coach</TH>
            <TH>Status</TH>
            <TH>Price</TH>
            <TH>Rating</TH>
            <TH>Location</TH>
            <TH />
          </TR>
        </THead>
        <tbody>
          {coaches.map((c) => (
            <TR key={c.id}>
              <TD>
                <p className="font-medium">{c.profile?.full_name ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{c.headline}</p>
              </TD>
              <TD>
                {c.is_published ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="warning">Draft</Badge>
                )}
              </TD>
              <TD>{formatPrice(c.price_per_session, c.currency)}</TD>
              <TD>
                {c.rating_count > 0 ? `${c.rating_avg.toFixed(1)} (${c.rating_count})` : '—'}
              </TD>
              <TD className="text-muted-foreground">
                {[c.city, c.country].filter(Boolean).join(', ') || '—'}
              </TD>
              <TD>
                <PublishToggle coachId={c.id} published={c.is_published} />
              </TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}
