export const NEW_FLAG_ROW_ID = "__new__";

export type Flag = {
  id: number;
  status: number | string;
  code?: string;
  entity?: string;
  label?: string;
  nome: string;
  color: string;
  icon: string;
};

export type EntityStatusFlag = {
  entity: string;
  code: string;
  label: string;
  nome: string;
  color: string;
  icon: string;
};

export type FlagDraftRow = Omit<Flag, "id"> & {
  id: typeof NEW_FLAG_ROW_ID;
};

export function emptyFlagRow(): FlagDraftRow {
  return {
    id: NEW_FLAG_ROW_ID,
    nome: "Prévia",
    status: 1,
    color: "#989898",
    icon: "label",
  };
}

export function isNewFlagRow(row: { id: unknown }): row is FlagDraftRow {
  return row.id === NEW_FLAG_ROW_ID;
}

export type AuditableFlag = Flag & {
  criado_por: number;
  criado_em: string;
  alterado_por: number;
  alterado_em?: string | null;
};

export function isFlag(value: unknown): value is Flag {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "nome" in value &&
    "icon" in value
  );
}

const LEGACY_FLAG_ID_TO_CODE: Record<number, string> = {
  0: "DELETED",
  1: "ACTIVE",
  2: "BLOCKED",
};

export type LookupFieldValue = number | string | Flag | AuditableFlag | null | undefined;

export function flagId(
  value: number | string | Flag | AuditableFlag | null | undefined,
): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const codeToId: Record<string, number> = {
      DELETED: 0,
      ACTIVE: 1,
      BLOCKED: 2,
    };
    return codeToId[value];
  }
  return value.id;
}

export function flagCode(
  value: number | string | Flag | AuditableFlag | null | undefined,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number") return LEGACY_FLAG_ID_TO_CODE[value];
  if (value.code) return value.code;
  return LEGACY_FLAG_ID_TO_CODE[value.id];
}

/** Resolves a lookup field to its expanded flag (from API or catalog). */
export function resolveFlag<T extends Flag>(
  value: number | string | T | null | undefined,
  catalog?: T[],
): T | undefined {
  if (value != null && typeof value === "object") return value;
  const id = typeof value === "number" ? value : undefined;
  const code = typeof value === "string" ? value : undefined;
  if (id != null) return catalog?.find((item) => item.id === id);
  if (code != null) return catalog?.find((item) => item.code === code || item.status === code);
  return undefined;
}

/**
 * Resolves lookup fields on any entity (embedded flag or catalog fallback by id).
 *
 * @example
 * resolveFlags(pessoa, ["status", "origem"], [allStatus, allOrigens])
 */
export function resolveFlags(
  entity: object,
  fields: readonly string[],
  catalogs: readonly (Flag[] | undefined)[],
): Record<string, Flag | undefined> {
  if (fields.length !== catalogs.length) {
    throw new Error("resolveFlags: fields and catalogs must have the same length");
  }

  const record = entity as Record<string, LookupFieldValue | undefined>;
  const resolved: Record<string, Flag | undefined> = {};
  fields.forEach((field, index) => {
    resolved[field] = resolveFlag(record[field], catalogs[index]);
  });
  return resolved;
}
