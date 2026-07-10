import { type Metadata } from 'next';

import { DataTable, TD, TH, THead, TR } from '@/components/ui/table';
import { listUsers } from '@/features/admin/queries';
import { RoleSelect } from '@/features/admin/components/admin-controls';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin · Users' };

export default async function AdminUsersPage() {
  const users = await listUsers();

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Users ({users.length})</h2>
      <DataTable>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Role</TH>
            <TH>Location</TH>
            <TH>Joined</TH>
          </TR>
        </THead>
        <tbody>
          {users.map((u) => (
            <TR key={u.id}>
              <TD className="font-medium">{u.full_name ?? '—'}</TD>
              <TD>
                <RoleSelect userId={u.id} role={u.role} />
              </TD>
              <TD className="text-muted-foreground">
                {[u.city, u.country].filter(Boolean).join(', ') || '—'}
              </TD>
              <TD className="text-muted-foreground">{formatDate(u.created_at)}</TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}
