/**
 * Icon ids for @iconify/react.
 * Unprefixed names → `mdi:{name}`; `prefix:name` kept as-is.
 */
export function resolveIconifyId(name: string | null | undefined): string {
  if (!name?.trim()) return "mdi:help-circle-outline";

  const value = name.trim();
  if (value.includes(":")) return value;

  const mdiName = value.replace(/_/g, "-");
  return `mdi:${mdiName}`;
}
