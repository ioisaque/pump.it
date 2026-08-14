import { DATA, HORA, US_DATE } from "domain/shared/formatters";

export { DATA, HORA, US_DATE };

export function NOW(): Date {
  return new Date();
}

export function DATA_HORA(value?: string | Date | null, withSeconds = false): string {
  if (value == null || value === "") return "";
  const d = DATA(value);
  const h = HORA(value, withSeconds);
  if (!d) return h;
  if (!h) return d;
  return `${d} ${h}`;
}

export function inputDateValue(value: string | Date | null | undefined): string {
  return US_DATE(value);
}
