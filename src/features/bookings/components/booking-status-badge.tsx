import { Badge } from '@/components/ui/badge';
import { type BookingStatus } from '@/lib/supabase/database.types';

const CONFIG: Record<
  BookingStatus,
  { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive' }
> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  no_show: { label: 'No show', variant: 'default' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, variant } = CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
