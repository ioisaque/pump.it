import { Box, Stack, Typography } from "@mui/material";
import { FlagKind, StatusEntity } from "api/flags";
import Icon from "components/Icon";
import FlagAuditableGrid from "components/tabelas/FlagAuditableGrid";
import FlagStatusGrid from "components/tabelas/FlagStatusGrid";
import { useState } from "react";
import { TabelaPreviewHeader, TabelaPreviewState } from "components/tabelas/TabelaPreview";

export type FlagManagementFlag =
  | Exclude<FlagKind, "status">
  | `status:${StatusEntity}`
;

export type FlagManagementProps = {
  flag: FlagManagementFlag;
  title: string;
  description: string;
  icon: string;
  color: string;
  surfaceColor?: string;
};

type AuditableKind = Exclude<FlagKind, "status">;

function parseFlag(flag: FlagManagementFlag) {
  if (flag.startsWith("status:")) {
    return { mode: "status" as const, entity: flag.slice(7) as StatusEntity };
  }
  return { mode: "auditable" as const, kind: flag as AuditableKind };
}

export default function FlagManagement({
  flag,
  title,
  description,
  icon,
  color,
  surfaceColor,
}: FlagManagementProps) {
  const parsed = parseFlag(flag);
  const headerSurface = surfaceColor ?? `${color.split(".")[0]}.50`;

  const [preview, setPreview] = useState<TabelaPreviewState | null>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ minHeight: 52 }}
      >
        <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: headerSurface,
              color,
              flexShrink: 0,
            }}
          >
            <Icon name={icon} width={20} height={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35 }}>
              {description}
            </Typography>
          </Box>
        </Stack>
        <TabelaPreviewHeader preview={preview} />
      </Stack>

      <Box sx={{ width: "100%", overflow: "auto" }}>
        {parsed.mode === "status" ? (
          <FlagStatusGrid
            entity={parsed.entity}
            color={color}
            focusedKey={focusedKey}
            setFocusedKey={setFocusedKey}
            setPreview={setPreview}
          />
        ) : (
          <FlagAuditableGrid
            kind={parsed.kind}
            color={color}
            focusedKey={focusedKey}
            setFocusedKey={setFocusedKey}
            setPreview={setPreview}
          />
        )}
      </Box>
    </Box>
  );
}
