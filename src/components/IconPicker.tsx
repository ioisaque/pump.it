import {
    Avatar,
    Box,
    Button,
    Popover,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import GridColorPicker from "components/data-table/GridColorPicker";
import Icon from "components/Icon";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

const ICON_LIMIT = 250;
const PICKER_DEFAULT_WIDTH = 360;
const PICKER_DEFAULT_HEIGHT = 420;
const PICKER_MIN_WIDTH = 280;
const PICKER_MIN_HEIGHT = 240;

function clampPickerSize(width: number, height: number) {
  const maxWidth = typeof window !== "undefined" ? window.innerWidth - 24 : 1200;
  const maxHeight = typeof window !== "undefined" ? window.innerHeight - 24 : 900;
  return {
    width: Math.min(Math.max(width, PICKER_MIN_WIDTH), maxWidth),
    height: Math.min(Math.max(height, PICKER_MIN_HEIGHT), maxHeight),
  };
}

const ICON_DEFAULT = "mdi:label-outline";
const COLOR_DEFAULT = "#989898";
const PREFS_KEY = "pump-icon-picker";

function readPickerSize() {
  if (typeof window === "undefined") {
    return clampPickerSize(PICKER_DEFAULT_WIDTH, PICKER_DEFAULT_HEIGHT);
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const saved = raw ? (JSON.parse(raw) as { width?: number; height?: number }) : null;
    if (!saved?.width || !saved?.height) {
      return clampPickerSize(PICKER_DEFAULT_WIDTH, PICKER_DEFAULT_HEIGHT);
    }
    return clampPickerSize(saved.width, saved.height);
  } catch {
    return clampPickerSize(PICKER_DEFAULT_WIDTH, PICKER_DEFAULT_HEIGHT);
  }
}

function writePickerSize(size: { width: number; height: number }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(size));
}

const MDI_DEFAULT_ICON_IDS = [
  "mdi:application-braces",
  "mdi:receipt-text-outline",
  "mdi:github",
  "mdi:barcode-scan",
  "mdi:email-outline",
  "mdi:email-fast-outline",
  "mdi:email-multiple",
  "mdi:bell-outline",
  "mdi:bell-badge-outline",
  "mdi:send-check",
  "mdi:send",
  "mdi:webhook",
  "mdi:rocket-launch",
  "mdi:cog-outline",
  "mdi:cloud-outline",
  "mdi:cellphone",
  "mdi:cart-outline",
  "mdi:chart-line",
  "mdi:chart-bar",
  "mdi:shield-check",
  "mdi:key-variant",
  "mdi:package-variant",
  "mdi:domain",
  "mdi:invoice",
  "mdi:account-group",
  "mdi:view-dashboard",
  "mdi:database",
  "mdi:server",
  "mdi:api",
  "mdi:identifier",
  "mdi:link-variant",
  "mdi:lock-outline",
  "mdi:cash-check",
  "mdi:credit-card-outline",
  "mdi:file-document-outline",
  "mdi:folder-outline",
  "mdi:home-outline",
  "mdi:store-outline",
  "mdi:truck-delivery-outline",
  "mdi:calendar-clock",
  "mdi:clock-outline",
  "mdi:alert-circle-outline",
  "mdi:check-circle-outline",
  "mdi:close-circle-outline",
  "mdi:information-outline",
  "mdi:magnify",
  "mdi:pencil-outline",
  "mdi:plus",
  "mdi:delete-outline",
  "mdi:content-save",
  "mdi:undo",
  "mdi:download-outline",
  "mdi:upload-outline",
  "mdi:qrcode",
  "mdi:wifi",
  "mdi:lan",
  "mdi:source-branch",
  "mdi:git",
  "mdi:language-javascript",
  "mdi:language-typescript",
  "mdi:nodejs",
  "mdi:docker",
  "mdi:linux",
  "mdi:apple",
  "mdi:android",
  "mdi:monitor",
  "mdi:tablet",
  "mdi:heart-outline",
  "mdi:star-outline",
  "mdi:flag-outline",
  "mdi:map-marker-outline",
  "mdi:camera-outline",
  "mdi:image-outline",
  "mdi:microphone-outline",
  "mdi:phone-outline",
  "mdi:whatsapp",
  "mdi:telegram",
];

type Props = {
  icon: string;
  color: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  size?: number;
  readOnly?: boolean;
};

let mdiIconIdsCache: string[] | null = null;

async function loadMdiIconIds() {
  if (mdiIconIdsCache) return mdiIconIdsCache;
  const mod = await import("@iconify-json/mdi");
  mdiIconIdsCache = Object.keys(mod.icons.icons)
    .sort()
    .map((name) => `mdi:${name}`);
  return mdiIconIdsCache;
}

function resolveIconPool(all: string[], query: string, currentIcon: string) {
  const q = query.trim().toLowerCase().replace(/^mdi:/, "");

  if (!q) {
    const pool = [...MDI_DEFAULT_ICON_IDS];
    if (currentIcon.startsWith("mdi:") && !pool.includes(currentIcon)) {
      pool.unshift(currentIcon);
    }
    return { pool, mode: "defaults" as const };
  }

  return {
    pool: all.filter((id) => id.slice(4).includes(q)),
    mode: "search" as const,
  };
}

export default function IconPicker({
  icon,
  color,
  onIconChange,
  onColorChange,
  onOpen,
  onClose,
  size = 40,
  readOnly = false,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filter, setFilter] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [mdiIcons, setMdiIcons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickerSize, setPickerSize] = useState(readPickerSize);
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const persistTimerRef = useRef<number | null>(null);

  const open = Boolean(anchorEl);
  const displayIcon = icon.trim() || ICON_DEFAULT;
  const displayColor = color.trim() || COLOR_DEFAULT;
  const isMdiIcon = displayIcon.startsWith("mdi:");

  useEffect(() => {
    if (!open) return;
    setFilter("");
    setManualOpen(!isMdiIcon);
    setManualValue(displayIcon);
    setLoading(true);
    loadMdiIconIds()
      .then(setMdiIcons)
      .finally(() => setLoading(false));
  }, [open, displayIcon, isMdiIcon]);

  const { visibleIcons, totalMatches, limited, mode } = useMemo(() => {
    const { pool, mode: poolMode } = resolveIconPool(mdiIcons, filter, displayIcon);
    const total = pool.length;
    const visible = pool.slice(0, ICON_LIMIT);
    return {
      visibleIcons: visible,
      totalMatches: total,
      limited: total > ICON_LIMIT,
      mode: poolMode,
    };
  }, [mdiIcons, filter, displayIcon]);

  useEffect(() => {
    if (!open) return;
    setPickerSize(readPickerSize());
  }, [open]);

  function persistPickerSize(el: HTMLDivElement | null) {
    if (!el) return;
    const next = clampPickerSize(el.offsetWidth, el.offsetHeight);
    writePickerSize(next);
    setPickerSize(next);
  }

  function schedulePersist(el: HTMLDivElement) {
    if (persistTimerRef.current != null) window.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = window.setTimeout(() => persistPickerSize(el), 120);
  }

  useEffect(() => {
    if (!open || !panelEl) return;

    const observer = new ResizeObserver(() => schedulePersist(panelEl));
    observer.observe(panelEl);

    function onPointerUp() {
      persistPickerSize(panelEl);
    }

    window.addEventListener("pointerup", onPointerUp);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointerup", onPointerUp);
      if (persistTimerRef.current != null) window.clearTimeout(persistTimerRef.current);
    };
  }, [open, panelEl]);

  function openPicker(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    if (readOnly) return;
    setAnchorEl(event.currentTarget);
    onOpen?.();
  }

  function closePicker() {
    persistPickerSize(panelEl);
    setAnchorEl(null);
    onClose?.();
  }

  function pickIcon(next: string) {
    onIconChange(next);
  }

  function applyManualIcon() {
    const next = manualValue.trim();
    if (!next) return;
    onIconChange(next);
    setManualOpen(false);
    setFilter("");
  }

  function captionText() {
    if (loading) return "Carregando…";
    if (mode === "defaults") {
      return `${visibleIcons.length} padrões · digite para buscar (${mdiIcons.length} MDI)`;
    }
    if (limited) {
      return `${ICON_LIMIT} de ${totalMatches} · refine a busca`;
    }
    return `${totalMatches} resultado(s)`;
  }

  return (
    <>
      <Avatar
        role={readOnly ? undefined : "button"}
        aria-label={readOnly ? undefined : "Escolher ícone e cor"}
        onClick={openPicker}
        sx={{
          width: size,
          height: size,
          bgcolor: displayColor,
          cursor: readOnly ? "default" : "pointer",
          "&:hover": readOnly ? undefined : { opacity: 0.92 },
        }}
      >
        <Icon name={displayIcon} color="#fff" width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} />
      </Avatar>

      {!readOnly ? (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        marginThreshold={0}
        PaperProps={{ sx: { p: 0, overflow: "visible", bgcolor: "transparent", boxShadow: "none", mt: 1 } }}
      >
        <Box
          ref={setPanelEl}
          sx={{
            width: pickerSize.width,
            height: pickerSize.height,
            minWidth: PICKER_MIN_WIDTH,
            minHeight: PICKER_MIN_HEIGHT,
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "calc(100vh - 24px)",
            resize: "both",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Box sx={{ p: 1.5, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {manualOpen ? (
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center">
                <GridColorPicker value={displayColor} onChange={onColorChange} />
                <TextField
                  autoFocus
                  size="small"
                  fullWidth
                  label="Ícone (iconify)"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  placeholder="streamline-plump:password-lock"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyManualIcon();
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={applyManualIcon}>
                  Usar ícone
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setManualOpen(false);
                    setFilter("");
                  }}
                >
                  Lista MDI
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <GridColorPicker value={displayColor} onChange={onColorChange} />
                <TextField
                  autoFocus
                  size="small"
                  fullWidth
                  placeholder="Filtrar ícones MDI…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  {captionText()}
                </Typography>
                <Button size="small" variant="text" sx={{ minWidth: 0, px: 0.5 }} onClick={() => setManualOpen(true)}>
                  Outro prefixo…
                </Button>
              </Stack>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 120,
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: 0.5,
                  overflow: "auto",
                  pr: 0.5,
                  alignContent: "start",
                }}
              >
                {visibleIcons.map((id) => {
                  const selected = id === displayIcon;
                  const name = id.slice(4);
                  return (
                    <Box
                      key={id}
                      component="button"
                      type="button"
                      title={name}
                      onClick={() => pickIcon(id)}
                      sx={{
                        appearance: "none",
                        border: selected ? "2px solid" : "1px solid transparent",
                        borderColor: selected ? "primary.main" : "transparent",
                        bgcolor: selected ? "action.selected" : "transparent",
                        borderRadius: 1,
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "text.primary",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Icon name={id} width={22} height={22} />
                    </Box>
                  );
                })}
              </Box>
            </Stack>
          )}
          </Box>
        </Box>
      </Popover>
      ) : null}
    </>
  );
}
