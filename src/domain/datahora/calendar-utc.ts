/** Calendar dates as UTC noon — aligned with API calendar-date.ts */

export function calendarDateUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function getCalendarPartsUTC(value: Date): { year: number; month: number; day: number } {
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

export function parseDateOnly(value: string): Date {
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    const fallback = new Date(raw);
    if (Number.isNaN(fallback.getTime())) throw new Error(`Data inválida: ${value}`);
    const p = getCalendarPartsUTC(fallback);
    return calendarDateUTC(p.year, p.month, p.day);
  }
  return calendarDateUTC(Number(match[1]), Number(match[2]), Number(match[3]));
}
