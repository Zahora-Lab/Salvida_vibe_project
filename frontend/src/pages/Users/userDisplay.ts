import type { UserProfile } from '../../types';

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
