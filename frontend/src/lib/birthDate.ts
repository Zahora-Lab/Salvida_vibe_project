const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Parses a date-only ISO string ('YYYY-MM-DD') into a Date at local midnight.
 * Never use `new Date(iso)` for date-only strings: it is parsed as UTC and can
 * shift the day in negative-offset timezones.
 * Returns null for empty or invalid input (including impossible dates).
 */
export function parseIsoDateLocal(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const match = ISO_DATE_RE.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Age in whole years, or null if the date is empty, invalid or in the future. */
export function getAge(
  birthDate: string | null | undefined,
  today: Date = new Date(),
): number | null {
  const birth = parseIsoDateLocal(birthDate);
  if (!birth) return null;

  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (birth.getTime() > todayMidnight.getTime()) return null;

  let age = todayMidnight.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    todayMidnight.getMonth() > birth.getMonth() ||
    (todayMidnight.getMonth() === birth.getMonth() &&
      todayMidnight.getDate() >= birth.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

/**
 * True when today (local) is the day/month of the birth date.
 * People born on Feb 29 celebrate on Feb 28 in non-leap years.
 */
export function isBirthdayToday(
  birthDate: string | null | undefined,
  today: Date = new Date(),
): boolean {
  const birth = parseIsoDateLocal(birthDate);
  if (!birth) return false;

  const birthMonth = birth.getMonth();
  const birthDay = birth.getDate();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  if (birthMonth === 1 && birthDay === 29 && !isLeapYear(today.getFullYear())) {
    return todayMonth === 1 && todayDay === 28;
  }
  return todayMonth === birthMonth && todayDay === birthDay;
}
