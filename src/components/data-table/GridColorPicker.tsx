import { Box, Popover, TextField, Theme, useTheme } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";

type GridColorPickerProps = {
  value: string;
  onChange?: (color: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
};

function parseHexColor(value: string) {
  const raw = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw}`;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const short = raw.slice(1);
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`;
  }
  return null;
}

function resolveThemeColor(value: string, theme: Theme) {
  const raw = value.trim();
  if (!raw) return null;

  const hex = parseHexColor(raw);
  if (hex) return hex;

  const parts = raw.split(".");
  const palette = theme.palette as unknown as Record<string, { main?: string; light?: string; dark?: string } | string>;
  if (parts.length === 2) {
    const entry = palette[parts[0]];
    if (entry && typeof entry === "object") {
      const shade = entry[parts[1] as keyof typeof entry];
      if (typeof shade === "string") return shade;
    }
  }

  const entry = palette[parts[0]];
  if (entry && typeof entry === "object" && entry.main) return entry.main;

  return null;
}

function resolveSwatchColor(value: string, theme: Theme) {
  return resolveThemeColor(value, theme) ?? "#989898";
}

export default function GridColorPicker({
  value,
  onChange,
  onFocus,
  onBlur,
  readOnly = false,
}: GridColorPickerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [localHex, setLocalHex] = useState(() => resolveSwatchColor(value, theme));
  const open = Boolean(anchorEl);
  const committedHex = resolveSwatchColor(value, theme);
  const displayHex = open ? localHex : committedHex;

  useEffect(() => {
    if (!open) setLocalHex(committedHex);
  }, [committedHex, open]);

  function openPicker(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    if (readOnly) return;
    setLocalHex(committedHex);
    onFocus?.();
    setAnchorEl(event.currentTarget);
  }

  function closePicker() {
    setAnchorEl(null);
    const nextHex = parseHexColor(localHex) ?? localHex;
    if (nextHex !== committedHex) onChange?.(nextHex);
    onBlur?.();
  }

  return (
    <>
      <Box
        role={readOnly ? undefined : "button"}
        aria-label={readOnly ? displayHex : `Cor ${displayHex}`}
        onClick={openPicker}
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1,
          bgcolor: displayHex,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
          cursor: readOnly ? "default" : "pointer",
          flexShrink: 0,
          mx: "auto",
        }}
      />
      {!readOnly ? (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={closePicker}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, width: 200 }}>
            <Box
              component="input"
              type="color"
              value={localHex}
              onInput={(e) => setLocalHex(parseHexColor(e.currentTarget.value) ?? e.currentTarget.value)}
              sx={{
                width: "100%",
                height: 40,
                border: "none",
                cursor: "pointer",
                p: 0,
                bgcolor: "transparent",
              }}
            />
            <TextField
              size="small"
              label="Hex"
              value={localHex}
              onChange={(e) => setLocalHex(parseHexColor(e.target.value) ?? resolveSwatchColor(e.target.value, theme))}
              inputProps={{ "data-ideyou-mask": "off", spellCheck: false }}
            />
          </Box>
        </Popover>
      ) : null}
    </>
  );
}
