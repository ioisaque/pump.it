/**
 * Global input masks — same conventions as miodelivery `_ideyou.masks.js`.
 * Binds automatically by `name`, `inputMode`, and `class` on any `<input>` / `<textarea>`.
 * Percent fields use class `porcento` (cent-style comma decimals + `%` suffix, max 100%).
 *
 * Import once from `main.tsx`.
 */

import { BRN, CAPS } from "domain/shared/formatters";

const BOUND = new WeakSet<HTMLElement>();

type MaskHandler = {
  inputMode?: string;
  bind: (el: HTMLInputElement | HTMLTextAreaElement) => () => void;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Assign via the native prototype setter so React's value tracker keeps the
 * stale value and still fires `onChange` for controlled inputs — a plain
 * `el.value = x` updates the tracker, suppresses `onChange`, and React later
 * reverts the field to its (old) state, e.g. wiping a pasted CNPJ on blur.
 */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
}

function formatCardNumber(value: string): string {
  const d = digitsOnly(value).slice(0, 16);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}${"*".repeat(d.length - 4)}`;
  return `${d.slice(0, 4)}****${d.slice(-4)}`;
}

function formatCpfCnpj(value: string): string {
  const d = digitsOnly(value).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function formatPattern(digits: string, pattern: string): string {
  let di = 0;
  let out = "";
  for (let i = 0; i < pattern.length && di < digits.length; i++) {
    if (pattern[i] === "9") {
      out += digits[di++];
    } else {
      out += pattern[i];
      if (digits[di] === pattern[i]) di++;
    }
  }
  return out;
}

function formatPlaca(value: string): string {
  const raw = CAPS(value.replace(/[^a-zA-Z0-9]/g, "")).slice(0, 7);
  if (raw.length <= 3) return raw;
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

function clampOctet(digits: string): string {
  if (!digits) return "";
  const n = parseInt(digits, 10);
  if (Number.isNaN(n)) return "";
  if (n > 255) return "255";
  return String(n);
}

/** IPv4 — up to four octets (0–255), dots optional while typing. */
function formatIpv4(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const octets: string[] = [];
  let current = "";

  const pushOctet = () => {
    if (!current) return;
    octets.push(clampOctet(current));
    current = "";
  };

  for (let i = 0; i < cleaned.length && octets.length < 4; i++) {
    const ch = cleaned[i];
    if (ch === ".") {
      pushOctet();
      continue;
    }
    if (octets.length >= 4) break;

    const next = current + ch;
    const n = parseInt(next, 10);
    if (next.length > 3 || n > 255) {
      pushOctet();
      if (octets.length < 4) current = ch;
    } else {
      current = next;
    }

    if (current.length === 3 && octets.length < 3) {
      pushOctet();
    }
  }

  const parts = [...octets];
  if (current && parts.length < 4) {
    parts.push(clampOctet(current));
  }

  let out = parts.slice(0, 4).join(".");
  if (cleaned.endsWith(".") && parts.length < 4 && !cleaned.endsWith("..")) {
    out += ".";
  }
  return out;
}

export function formatMoney(
  value: string,
  opts: { symbol?: string; precision?: number; allowNegative?: boolean },
): string {
  const negative = opts.allowNegative && value.trim().startsWith("-");
  const precision = opts.precision ?? 2;
  const decZeros = "0".repeat(precision);
  const raw = digitsOnly(value);
  if (!raw) return opts.symbol ? `${opts.symbol}0,${decZeros}` : "";

  // Cent-style mask: digits are the amount in minor units (no leading zeros).
  const d = raw.replace(/^0+/, "") || "0";
  const amount = parseInt(d, 10);
  const intPart = String(Math.floor(amount / 10 ** precision));
  const decPart = String(amount % 10 ** precision).padStart(precision, "0");

  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatted = `${withThousands},${decPart}`;
  const prefix = opts.symbol ?? "";
  return `${negative ? "-" : ""}${prefix}${formatted}`;
}

const PORCENTO_MAX = 100;
const PORCENTO_MAX_CENTS = PORCENTO_MAX * 100;

/** Percent input — cent-style (2 decimal places) with `%` suffix, capped at 100%. */
function formatPorcento(value: string): string {
  const digits = value.replace(/%/g, "").replace(/\D/g, "");
  if (!digits) return "";

  const d = digits.replace(/^0+/, "") || "0";
  let amount = parseInt(d, 10);
  if (!Number.isFinite(amount) || amount < 0) amount = 0;
  if (amount > PORCENTO_MAX_CENTS) amount = PORCENTO_MAX_CENTS;

  const precision = 2;
  const intPart = String(Math.floor(amount / 10 ** precision));
  const decPart = String(amount % 10 ** precision).padStart(precision, "0");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart}%`;
}

function bindFormatter(
  el: HTMLInputElement | HTMLTextAreaElement,
  format: (raw: string) => string,
  options?: { inputMode?: string; caretAtEnd?: boolean },
): () => void {
  if (options?.inputMode && el instanceof HTMLInputElement) {
    el.inputMode = options.inputMode;
  }

  const apply = (caretAtEnd = false, notify = false) => {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = el.value;
    const next = format(before);
    if (next !== before) {
      setNativeValue(el, next);
      if (notify) el.dispatchEvent(new Event("input", { bubbles: true }));
      if (document.activeElement === el) {
        try {
          if (caretAtEnd || options?.caretAtEnd) {
            el.setSelectionRange(next.length, next.length);
          } else if (start != null && end != null) {
            const pos = Math.min(next.length, start + (next.length - before.length));
            el.setSelectionRange(pos, pos);
          }
        } catch {
          /* readOnly / type=number */
        }
      }
    }
  };

  const onInput = () => apply(true);
  const onBlur = () => apply(true, true);
  el.addEventListener("input", onInput);
  el.addEventListener("paste", onInput);
  el.addEventListener("blur", onBlur);
  apply();

  return () => {
    el.removeEventListener("input", onInput);
    el.removeEventListener("paste", onInput);
    el.removeEventListener("blur", onBlur);
  };
}

function bindUppercase(el: HTMLInputElement | HTMLTextAreaElement): () => void {
  const apply = () => {
    const upper = CAPS(el.value);
    if (upper !== el.value) el.value = upper;
  };
  el.addEventListener("input", apply);
  el.addEventListener("paste", apply);
  el.addEventListener("change", apply);
  apply();
  return () => {
    el.removeEventListener("input", apply);
    el.removeEventListener("paste", apply);
    el.removeEventListener("change", apply);
  };
}

/** `name` → mask (mirrors `_ideyou.masks.js`). */
const MASK_BY_NAME: Record<string, MaskHandler> = {
  placa: {
    bind: (el) =>
      bindFormatter(el, (v) => formatPlaca(v), { inputMode: "text" }),
  },
  renavam: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "999999999999999"), {
        inputMode: "numeric",
      }),
  },
  numero: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "999999"), { inputMode: "numeric" }),
  },
  data: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99/99/9999"), { inputMode: "numeric" }),
  },
  data_i: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99/99/9999"), { inputMode: "numeric" }),
  },
  data_e: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99/99/9999"), { inputMode: "numeric" }),
  },
  data_nasc: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99/99/9999"), { inputMode: "numeric" }),
  },
  hora: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99:99"), { inputMode: "numeric" }),
  },
  contato: {
    inputMode: "numeric",
    bind: (el) => bindFormatter(el, formatPhone, { inputMode: "numeric" }),
  },
  cep: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99999-999"), { inputMode: "numeric" }),
  },
  ip: {
    inputMode: "decimal",
    bind: (el) => bindFormatter(el, formatIpv4, { inputMode: "decimal" }),
  },
  ip_address: {
    inputMode: "decimal",
    bind: (el) => bindFormatter(el, formatIpv4, { inputMode: "decimal" }),
  },
  cpf_cnpj: {
    inputMode: "numeric",
    bind: (el) => bindFormatter(el, formatCpfCnpj, { inputMode: "numeric" }),
  },
  rg: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99.999.999"), { inputMode: "numeric" }),
  },
  cpf: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "999.999.999-99"), { inputMode: "numeric" }),
  },
  ie: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "999999999.99-99"), {
        inputMode: "numeric",
      }),
  },
  cnpj: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "99.999.999/9999-99"), {
        inputMode: "numeric",
      }),
  },
  numero_cartao: {
    inputMode: "numeric",
    bind: (el) => bindFormatter(el, formatCardNumber, { inputMode: "numeric" }),
  },
  pin: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatPattern(digitsOnly(v), "999999"), { inputMode: "numeric" }),
  },
  cod_barras: {
    bind: (el) => {
      if (el instanceof HTMLInputElement) el.inputMode = "search";
      return () => {};
    },
  },
};

const MASK_BY_CLASS: Record<string, MaskHandler> = {
  BRN: {
    inputMode: "numeric",
    bind: (el) => bindFormatter(el, BRN, { inputMode: "numeric" }),
  },
  BRL: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(
        el,
        (v) => formatMoney(v, { symbol: "R$ ", precision: 2, allowNegative: true }),
        { inputMode: "numeric", caretAtEnd: true },
      ),
  },
  BRL_P: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(
        el,
        (v) => formatMoney(v, { symbol: "R$ ", precision: 3, allowNegative: true }),
        { inputMode: "numeric", caretAtEnd: true },
      ),
  },
  decimal: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatMoney(v, { precision: 2, allowNegative: true }), {
        inputMode: "numeric",
        caretAtEnd: true,
      }),
  },
  decimalp: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, (v) => formatMoney(v, { precision: 3, allowNegative: true }), {
        inputMode: "numeric",
        caretAtEnd: true,
      }),
  },
  porcento: {
    inputMode: "numeric",
    bind: (el) =>
      bindFormatter(el, formatPorcento, { inputMode: "numeric", caretAtEnd: true }),
  },
  CAPS: {
    bind: (el) => bindUppercase(el),
  },
  IP: {
    inputMode: "decimal",
    bind: (el) => bindFormatter(el, formatIpv4, { inputMode: "decimal" }),
  },
};

function shouldSkip(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (el.readOnly || el.disabled) return true;
  if (el.dataset.ideyouMask === "off") return true;
  if (el.closest(".MuiDataGrid-cell")) return true;
  if (el instanceof HTMLInputElement) {
    const type = (el.type || "text").toLowerCase();
    if (type === "date" || type === "datetime-local" || type === "time" || type === "month") return true;
    if (type === "checkbox" || type === "radio" || type === "file" || type === "hidden") return true;
    if (type === "password") return true;
  }
  return false;
}

function resolveHandler(
  el: HTMLInputElement | HTMLTextAreaElement,
): MaskHandler | null {
  for (const cls of el.classList) {
    if (MASK_BY_CLASS[cls]) return MASK_BY_CLASS[cls];
  }

  const name = el.getAttribute("name");
  if (name && MASK_BY_NAME[name]) return MASK_BY_NAME[name];

  return null;
}

function bindElement(el: HTMLInputElement | HTMLTextAreaElement): void {
  if (BOUND.has(el) || shouldSkip(el)) return;

  const handler = resolveHandler(el);
  if (!handler) return;

  // Mask plugins expect text inputs; `type="number"` blocks punctuation masks.
  if (el instanceof HTMLInputElement && el.type === "number") {
    el.type = "text";
  }

  BOUND.add(el);
  el.dataset.ideyouMask = "on";

  const cleanup = handler.bind(el);
  const observer = new MutationObserver(() => {
    if (!document.contains(el)) {
      cleanup();
      observer.disconnect();
      BOUND.delete(el);
    }
  });
  observer.observe(el.parentNode ?? document.body, { childList: true, subtree: true });
}

function scan(root: ParentNode): void {
  root.querySelectorAll("input, textarea").forEach((node) => {
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      bindElement(node);
    }
  });
}

let observerStarted = false;

/** Call once at app startup for global mask behavior. */
export function initIdeyouMasks(): void {
  if (typeof document === "undefined" || observerStarted) return;
  observerStarted = true;

  const start = () => {
    scan(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
            bindElement(node);
          } else if (node instanceof HTMLElement) {
            scan(node);
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

export function formatBRLInput(value: string): string {
  return formatMoney(value, { symbol: "R$ ", precision: 2, allowNegative: true });
}

export function formatBRLPInput(value: string): string {
  return formatMoney(value, { symbol: "R$ ", precision: 3, allowNegative: true });
}

export function formatPorcentoInput(value: string): string {
  const s = value.trim();
  if (!s) return "";
  if (s.includes("%")) return formatPorcento(s);
  if (/^-?\d+([.,]\d+)?$/.test(s)) {
    const n = parseFloat(s.replace(",", "."));
    if (Number.isFinite(n)) {
      return formatPorcento(String(Math.round(Math.abs(n) * 100)));
    }
  }
  return formatPorcento(s);
}

export function parsePorcento(value: unknown, fallback = 0): number {
  if (value === "" || value === null || value === undefined) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(PORCENTO_MAX, Math.max(0, value));
  }
  const digits = String(value).replace(/%/g, "").replace(/\D/g, "");
  if (!digits) return fallback;
  const amount = parseInt(digits, 10);
  if (!Number.isFinite(amount)) return fallback;
  const n = amount / 100;
  return Math.min(PORCENTO_MAX, Math.max(0, n));
}

/** Format value for a money-masked input (`className` on the native input). */
export function formatMoneyInputValue(value: string, className: string): string {
  if (className.includes("porcento")) return formatPorcentoInput(value);
  if (className.includes("BRL_P")) return formatBRLPInput(value);
  if (className.includes("BRL")) return formatBRLInput(value);
  if (className.includes("decimalp")) {
    return formatMoney(value, { precision: 3, allowNegative: true });
  }
  if (className.includes("decimal")) {
    return formatMoney(value, { precision: 2, allowNegative: true });
  }
  return value;
}

export function isMoneyMaskClass(className: string | undefined): boolean {
  if (!className) return false;
  return (
    className.includes("BRL") ||
    className.includes("BRL_P") ||
    className.includes("decimal") ||
    className.includes("porcento")
  );
}

export { digitsOnly, formatCpfCnpj, formatIpv4, formatPhone };

