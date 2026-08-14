import { Box, Stack, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { useEffect, useRef } from "react";

export type TabelaPreviewItem = {
  key: string;
  label: string;
  icon?: string;
  color?: string;
};

export type TabelaPreviewState = {
  focusedKey: string | null;
  items: TabelaPreviewItem[];
  total: number;
};

function resolveIcon(name?: string) {
  if (!name) return "mdi:label";
  if (name.includes(":")) return name;
  return `mdi:${name}`;
}

function buildPreviewState(focusedKey: string | null, items: TabelaPreviewItem[]): TabelaPreviewState {
  if (focusedKey) {
    const focused = items.find((item) => item.key === focusedKey);
    return { focusedKey, items: focused ? [focused] : [], total: items.length };
  }
  return { focusedKey: null, items: items.slice(0, 2), total: items.length };
}

export function useTabelaPreview(
  onPreviewChange: ((state: TabelaPreviewState) => void) | undefined,
  focusedKey: string | null,
  items: TabelaPreviewItem[],
) {
  const onPreviewChangeRef = useRef(onPreviewChange);
  const itemsRef = useRef(items);
  const lastPublishedRef = useRef("");

  onPreviewChangeRef.current = onPreviewChange;
  itemsRef.current = items;

  useEffect(() => {
    const onChange = onPreviewChangeRef.current;
    if (!onChange) return;
    const next = buildPreviewState(focusedKey, itemsRef.current);
    const serialized = JSON.stringify(next);
    if (serialized === lastPublishedRef.current) return;
    lastPublishedRef.current = serialized;
    onChange(next);
  }, [focusedKey, items]);
}

export function TabelaPreviewHeader({ preview }: { preview: TabelaPreviewState | null }) {
  if (!preview || preview.total === 0) {
    return (
      <Box sx={{ minHeight: 40, display: "flex", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
          Sem itens
        </Typography>
      </Box>
    );
  }

  return (
    <Stack alignItems="flex-end" gap={0.5} sx={{ minHeight: 40 }}>
      <Stack direction="row" gap={0.75} flexWrap="wrap" justifyContent="flex-end">
        {preview.items.map((item) => (
          <Stack
            key={item.key}
            direction="row"
            alignItems="center"
            gap={0.5}
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: item.color || "#eceff1",
              color: "#fff",
              typography: "caption",
              fontWeight: 600,
            }}
          >
            <IconifyIcon icon={resolveIcon(item.icon)} width={14} height={14} />
            {item.label || "—"}
          </Stack>
        ))}
      </Stack>
      {!preview.focusedKey && preview.total > 2 ? (
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          e outros…
        </Typography>
      ) : null}
    </Stack>
  );
}
