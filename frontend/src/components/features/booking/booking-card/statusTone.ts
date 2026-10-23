import type { BadgeTone } from '@/components/ui/badge';
import type { Booking } from '@/types';

/** Badge tone that represents each booking status. */
export const STATUS_TONE: Record<Booking['status'], BadgeTone> = {
  Approved: 'success',
  Pending: 'warning',
  Completed: 'neutral',
  Cancelled: 'danger',
  SignPending: 'info',
};
