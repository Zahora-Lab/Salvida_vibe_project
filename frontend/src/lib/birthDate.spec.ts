import { describe, expect, it } from 'vitest';
import { getAge, isBirthdayToday, parseIsoDateLocal } from './birthDate';

describe('parseIsoDateLocal', () => {
  it('builds a local date without timezone shift', () => {
    const date = parseIsoDateLocal('1950-05-03');
    expect(date?.getFullYear()).toBe(1950);
    expect(date?.getMonth()).toBe(4);
    expect(date?.getDate()).toBe(3);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseIsoDateLocal('')).toBeNull();
    expect(parseIsoDateLocal(null)).toBeNull();
    expect(parseIsoDateLocal(undefined)).toBeNull();
    expect(parseIsoDateLocal('not-a-date')).toBeNull();
    expect(parseIsoDateLocal('1950-5-3')).toBeNull();
    expect(parseIsoDateLocal('2023-02-30')).toBeNull();
  });
});

describe('getAge', () => {
  it('returns null for empty or invalid input', () => {
    const today = new Date(2026, 4, 3);
    expect(getAge('', today)).toBeNull();
    expect(getAge(null, today)).toBeNull();
    expect(getAge(undefined, today)).toBeNull();
    expect(getAge('garbage', today)).toBeNull();
  });

  it('subtracts one year when the birthday has not been reached yet', () => {
    expect(getAge('1950-12-25', new Date(2026, 4, 3))).toBe(75);
  });

  it('counts the new year on the birthday itself', () => {
    expect(getAge('1950-05-03', new Date(2026, 4, 3))).toBe(76);
  });

  it('is one year less the day before the birthday', () => {
    expect(getAge('1950-05-03', new Date(2026, 4, 2))).toBe(75);
  });

  it('returns null for future dates', () => {
    expect(getAge('2026-05-04', new Date(2026, 4, 3))).toBeNull();
    expect(getAge('2030-01-01', new Date(2026, 4, 3))).toBeNull();
  });

  it('returns 0 for a baby born today', () => {
    expect(getAge('2026-05-03', new Date(2026, 4, 3))).toBe(0);
  });
});

describe('isBirthdayToday', () => {
  it('returns false for empty or invalid input', () => {
    const today = new Date(2026, 4, 3);
    expect(isBirthdayToday('', today)).toBe(false);
    expect(isBirthdayToday(null, today)).toBe(false);
    expect(isBirthdayToday('garbage', today)).toBe(false);
  });

  it('is true on the same day and month', () => {
    expect(isBirthdayToday('1950-05-03', new Date(2026, 4, 3))).toBe(true);
  });

  it('is false the day before and the day after', () => {
    expect(isBirthdayToday('1950-05-03', new Date(2026, 4, 2))).toBe(false);
    expect(isBirthdayToday('1950-05-03', new Date(2026, 4, 4))).toBe(false);
  });

  it('is false when the birthday has not been reached this year', () => {
    expect(isBirthdayToday('1950-12-25', new Date(2026, 4, 3))).toBe(false);
  });

  it('celebrates Feb 29 births on Feb 29 in leap years only', () => {
    expect(isBirthdayToday('1952-02-29', new Date(2024, 1, 29))).toBe(true);
    expect(isBirthdayToday('1952-02-29', new Date(2024, 1, 28))).toBe(false);
  });

  it('celebrates Feb 29 births on Feb 28 in non-leap years', () => {
    expect(isBirthdayToday('1952-02-29', new Date(2026, 1, 28))).toBe(true);
    expect(isBirthdayToday('1952-02-29', new Date(2026, 2, 1))).toBe(false);
  });
});
