import { describe, expect, it } from 'vitest';
import type { UserProfile } from '@/types';
import { getDisplayName, getInitials, roleTone } from './userDisplay';

const user = (overrides: Partial<UserProfile>): UserProfile =>
  ({ id: '1', firstName: '', lastName: '', email: '', phone: '', organization: '', role: 'user', ...overrides }) as UserProfile;

describe('roleTone', () => {
  it.each(['admin', 'superadmin'] as const)('highlights %s', (role) => {
    expect(roleTone(role)).toBe('primary');
  });

  it('keeps regular users neutral', () => {
    expect(roleTone('user' as UserProfile['role'])).toBe('neutral');
  });
});

describe('getInitials', () => {
  it('uses both names in upper case', () => {
    expect(getInitials(user({ firstName: 'ana', lastName: 'pérez' }))).toBe('AP');
  });

  it('works with only one name', () => {
    expect(getInitials(user({ firstName: 'Ana' }))).toBe('A');
  });

  it('falls back to the email, then to a question mark', () => {
    expect(getInitials(user({ email: 'zoe@x.com' }))).toBe('Z');
    expect(getInitials(user({}))).toBe('?');
  });
});

describe('getDisplayName', () => {
  it('joins the names and trims the gaps', () => {
    expect(getDisplayName(user({ firstName: 'Ana', lastName: 'Pérez' }))).toBe('Ana Pérez');
    expect(getDisplayName(user({ firstName: 'Ana' }))).toBe('Ana');
  });

  it('shows a dash when there is no name', () => {
    expect(getDisplayName(user({}))).toBe('—');
  });
});
