import { InputGroupAddonProps } from "./InputGroupAddon";

export type FlagCatalogOption = {
  id?: number;
  code?: string;
  icon: string;
  color: string;
  nome?: string;
};

const EMPTY_ADDON: InputGroupAddonProps = {
  icon: "mdi:form-select",
};

export function flagCatalogAddonFromValue(
  value: unknown,
  options: FlagCatalogOption[] | undefined,
): InputGroupAddonProps {
  if (!options?.length) {
    return EMPTY_ADDON;
  }

  const raw = value == null ? "" : String(value).trim();
  if (!raw) {
    return EMPTY_ADDON;
  }

  const byCode = options.find((o) => o.code != null && o.code === raw);
  if (byCode) {
    return { icon: byCode.icon, color: byCode.color };
  }

  const id = Number(raw);
  if (!Number.isNaN(id)) {
    const byId = options.find((o) => o.id != null && o.id === id);
    if (byId) {
      return { icon: byId.icon, color: byId.color };
    }
  }

  return EMPTY_ADDON;
}
