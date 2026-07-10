import { type Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { DataTable, TD, TH, THead, TR } from '@/components/ui/table';
import { listSports } from '@/features/admin/queries';
import { AddSportForm, SportToggle } from '@/features/admin/components/admin-controls';

export const metadata: Metadata = { title: 'Admin · Sports' };

export default async function AdminSportsPage() {
  const sports = await listSports();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Sports ({sports.length})</h2>
        <p className="text-sm text-muted-foreground">
          The catalogue is data-driven — add unlimited sports with no schema change.
        </p>
      </div>

      <AddSportForm />

      <DataTable>
        <THead>
          <TR>
            <TH>Sport</TH>
            <TH>Slug</TH>
            <TH>Status</TH>
            <TH />
          </TR>
        </THead>
        <tbody>
          {sports.map((s) => (
            <TR key={s.id}>
              <TD className="font-medium">
                {s.icon} {s.name}
              </TD>
              <TD className="text-muted-foreground">{s.slug}</TD>
              <TD>
                {s.is_active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge>Disabled</Badge>
                )}
              </TD>
              <TD>
                <SportToggle sportId={s.id} isActive={s.is_active} />
              </TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}
