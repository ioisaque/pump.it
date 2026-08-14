import { getCalendarPartsUTC, parseDateOnly } from "./calendar-utc";
import { US_DATE } from "domain/shared/formatters";

export { US_DATE };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function NOW(): Date {
  return new Date();
}

export function TODAY(): Date {
  const n = NOW();
  const d = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseStorageDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const iso = US_DATE(value);
  if (!iso) return null;
  try {
    return parseDateOnly(iso);
  } catch {
    return null;
  }
}

export function dateToISO(d: Date): string {
  const { year, month, day } = getCalendarPartsUTC(d);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function inputDateValue(value: string | null | undefined): string {
  return US_DATE(value);
}

export function maskBrDateInputTyping(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function formatBrDateInputShort(iso: string | null | undefined): string {
  const storage = US_DATE(iso);
  if (!storage) return "";
  const [y, m, d] = storage.split("-");
  return `${d}/${m}/${y.slice(-2)}`;
}

function expandTwoDigitYear(yy: number): number {
  if (yy >= 100) return yy;
  return yy >= 70 ? 1900 + yy : 2000 + yy;
}

function brPartsToStorage(day: number, month: number, year: number): string | null {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  try {
    parseDateOnly(iso);
    return iso;
  } catch {
    return null;
  }
}

export function parseBrDateInputToStorage(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const long = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (long) {
    return brPartsToStorage(Number(long[1]), Number(long[2]), Number(long[3]));
  }
  const short = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (short) {
    return brPartsToStorage(Number(short[1]), Number(short[2]), expandTwoDigitYear(Number(short[3])));
  }
  return null;
}

export function formatBrDateRangeInput(from: string, to: string): string {
  const a = formatBrDateInputShort(from);
  const b = formatBrDateInputShort(to);
  if (!a && !b) return "";
  if (!a) return b;
  if (!b) return a;
  return `${a} à ${b}`;
}

export function maskBrDateRangeInputTyping(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 6) return maskBrDateInputTyping(digits);
  return `${maskBrDateInputTyping(digits.slice(0, 6))} à ${maskBrDateInputTyping(digits.slice(6))}`;
}

export function parseBrDateRangeInputToStorage(text: string): { from: string; to: string } | null {
  const trimmed = text.trim();
  if (!trimmed) return { from: "", to: "" };
  const parts = trimmed.split(/\s*à\s*/i);
  if (parts.length !== 2) return null;
  const from = parseBrDateInputToStorage(parts[0].trim());
  const to = parseBrDateInputToStorage(parts[1].trim());
  if (from === null || to === null) return null;
  if (from === "" && to === "") return { from: "", to: "" };
  if (!from || !to) return null;
  return { from, to };
}
