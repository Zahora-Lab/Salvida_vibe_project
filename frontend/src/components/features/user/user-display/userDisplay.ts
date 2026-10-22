import type { BadgeTone } from '@/components/ui/badge';
import type { UserProfile } from '@/types';

/** Badge tone for a role: administrators stand out, regular users stay neutral. */
export function roleTone(role: UserProfile['role']): BadgeTone {
  return role === 'admin' || role === 'superadmin' ? 'primary' : 'neutral';
}

export const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
};

export function getInitials(u: UserProfile) {
  if (u.firstName || u.lastName) {
    return `${u.firstName?.charAt(0) ?? ''}${u.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }
  return (u.email?.charAt(0) ?? '?').toUpperCase();
}

export function getDisplayName(u: UserProfile) {
  return u.firstName || u.lastName ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—';
}
