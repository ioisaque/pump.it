import { Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFlag, FlagKind, listFlags, saveFlag } from "api/flags";
import Chip from "components/Chip";
import ActionIcon from "components/data-table/ActionIcon";
import GridCellTextField from "components/data-table/GridCellTextField";
import GridTable, {
    GRID_COL_ICONE_PICKER,
    GRID_COL_ROTULO,
    GRID_COL_STATUS,
    GRID_ROW_MIN_HEIGHT_PX,
} from "components/data-table/GridTable";
import StatusIcon from "components/data-table/StatusIcon";
import IconPicker from "components/IconPicker";
import {
    TabelaPreviewItem,
    TabelaPreviewState,
    useTabelaPreview,
} from "components/tabelas/TabelaPreview";
import { emptyFlagRow, isNewFlagRow, NEW_FLAG_ROW_ID } from "domain/tabelas/types";
import { useStatusMutation } from "hooks/useStatusMutation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type AuditableKind = Exclude<FlagKind, "status">;

const GRID_COL_CHIP = {
  width: 180,
  minWidth: 180,
  maxWidth: 180,
  flex: 0,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  resizable: false,
} as const;

const AUDITABLE_CONFIG: Record<AuditableKind, { placeholder: string; queryKey: string[] }> = {
  niveis: { placeholder: "Novo nível", queryKey: ["tabelas", "niveis"] },
  origens: { placeholder: "Nova origem", queryKey: ["tabelas", "origens"] },
  etiquetas: { placeholder: "Nova etiqueta", queryKey: ["tabelas", "etiquetas"] },
  musculos: { placeholder: "Novo músculo", queryKey: ["tabelas", "musculos"] },
};

export interface FlagAuditableGridProps {
  kind: AuditableKind;
  color: string;
  focusedKey: string | null;
  setFocusedKey: (key: string | null) => void;
  setPreview: (state: TabelaPreviewState) => void;
}

export default function FlagAuditableGrid({
  kind,
  color,
  focusedKey,
  setFocusedKey,
  setPreview,
}: FlagAuditableGridProps) {
  const config = AUDITABLE_CONFIG[kind];
  const queryClient = useQueryClient();
  const queryKey = config.queryKey;

  const [newRow, setNewRow] = useState(emptyFlagRow);
  const [drafts, setDrafts] = useState<Record<number, Record<string, any>>>({});

  const { data: flagsData } = useQuery({
    queryKey,
    queryFn: async () => await listFlags<any>(kind),
  });

  const rows = useMemo(() => flagsData ?? [], [flagsData]);
  const gridRows = useMemo(() => [...rows, newRow], [rows, newRow]);

  useEffect(() => {
    setDrafts({});
  }, [flagsData]);

  function rowValue(row: any, field: string) {
    if (isNewFlagRow(row)) return newRow[field as keyof typeof newRow];
    const draft = drafts[Number(row.id)];
    if (draft && field in draft) return draft[field];
    return row[field];
  }

  function setRowDraft(rowId: string | number, field: string, value: any) {
    if (rowId === NEW_FLAG_ROW_ID) {
      setNewRow((prev) => ({ ...prev, [field]: value }));
      return;
    }
    setDrafts((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId as number] ?? {}),
        [field]: value,
      },
    }));
  }

  function resetNewRow() {
    setNewRow(emptyFlagRow());
  }

  const createMutation = useMutation({
    mutationFn: async () =>
      await addFlag(kind, {
        nome: newRow.nome,
        status: Number(newRow.status ?? 1),
        color: newRow.color,
        icon: newRow.icon,
      }),
    onSuccess: async () => {
      resetNewRow();
      toast.success("Registro criado.");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Não foi possível criar."),
  });

  const saveMutation = useMutation({
    mutationFn: async (row: any) => {
      const draft = drafts[Number(row.id)] ?? {};
      const merged = {
        ...row,
        ...draft,
        icon: row.icon,
        color: row.color,
      };
      return await saveFlag(kind, Number(row.id), {
        nome: merged.nome,
        status: Number(merged.status ?? 1),
        color: merged.color,
        icon: merged.icon,
      });
    },
    onSuccess: async () => {
      toast.success("Registro salvo.");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  function createRow() {
    if (!String(rowValue(newRow, "nome") ?? "").trim()) return;
    createMutation.mutate();
  }

  const toggleStatusMutation = useStatusMutation({
    queryKey,
    mutationFn: ({ id, nextStatus }) => saveFlag(kind, Number(id), { status: Number(nextStatus) }),
  });

  const previewItems = useMemo((): TabelaPreviewItem[] => {
    const items = rows
      .filter((row) => Number(row.status ?? 1) === 1)
      .map((row) => ({
        key: String(row.id),
        label: String(rowValue(row, "nome") ?? ""),
        icon: String(rowValue(row, "icon") ?? ""),
        color: String(rowValue(row, "color") ?? ""),
      }));

    if (String(rowValue(newRow, "nome") ?? "").trim()) {
      items.push({
        key: NEW_FLAG_ROW_ID,
        label: String(rowValue(newRow, "nome") ?? ""),
        icon: String(rowValue(newRow, "icon") ?? ""),
        color: String(rowValue(newRow, "color") ?? ""),
      });
    }

    return items;
  }, [rows, drafts, newRow]);

  useTabelaPreview(setPreview, focusedKey, previewItems);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "icon",
        headerName: "Ícone",
        ...GRID_COL_ICONE_PICKER,
        renderCell: (params) => {
          const icon = String(rowValue(params.row, "icon") ?? "");
          const colorValue = String(rowValue(params.row, "color") ?? "");
          return (
            <IconPicker
              icon={icon}
              color={colorValue}
              size={32}
              onOpen={() => setFocusedKey(String(params.row.id))}
              onIconChange={(next) => {
                setRowDraft(params.row.id, "icon", next);
                if (!isNewFlagRow(params.row)) {
                  saveMutation.mutate({ ...params.row, icon: next, color: colorValue });
                }
              }}
              onColorChange={(next) => {
                setRowDraft(params.row.id, "color", next);
                if (!isNewFlagRow(params.row)) {
                  saveMutation.mutate({ ...params.row, icon, color: next });
                }
              }}
              onClose={() => setFocusedKey(null)}
            />
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        ...GRID_COL_STATUS,
        renderCell: (params) =>
          isNewFlagRow(params.row) ? null : (
            <StatusIcon
              status={Number(rowValue(params.row, "status") ?? 1)}
              id={params.row.id}
              nome={rowValue(params.row, "nome") ?? ""}
              onToggle={(vars) => toggleStatusMutation.mutate(vars)}
            />
          ),
      },
      {
        field: "nome",
        headerName: "Rótulo",
        ...GRID_COL_ROTULO,
        renderCell: (params) => (
          <GridCellTextField
            value={String(rowValue(params.row, "nome") ?? "")}
            placeholder={isNewFlagRow(params.row) ? config.placeholder : undefined}
            onFocus={() => setFocusedKey(String(params.row.id))}
            onBlur={() => {
              setFocusedKey(null);
              if (!isNewFlagRow(params.row)) saveMutation.mutate(params.row);
            }}
            onLiveChange={(value) => setRowDraft(params.row.id, "nome", value)}
            onCommit={(value) => setRowDraft(params.row.id, "nome", value)}
            onEnter={() => {
              if (isNewFlagRow(params.row)) createRow();
            }}
          />
        ),
      },
      {
        field: "preview",
        headerName: "",
        ...GRID_COL_CHIP,
        renderCell: (params) => {
          const nome = String(rowValue(params.row, "nome") ?? "").trim();
          const icon = String(rowValue(params.row, "icon") ?? "");
          const colorValue = String(rowValue(params.row, "color") ?? "");
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
                minHeight: GRID_ROW_MIN_HEIGHT_PX,
                gap: 0.5,
                overflow: "hidden",
                px: 0.5,
              }}
            >
              {nome ? (
                <Chip icon={icon || undefined} text={nome} bgColor={colorValue || "#eceff1"} txtColor="#fff" />
              ) : null}
              {isNewFlagRow(params.row) ? (
                <ActionIcon
                  icon="ic:round-add"
                  color="success.main"
                  to="#add"
                  onClick={(e) => {
                    e.preventDefault();
                    createRow();
                  }}
                />
              ) : null}
            </Box>
          );
        },
      },
    ],
    [toggleStatusMutation, saveMutation, createMutation, drafts, newRow],
  );

  return (
    <GridTable
      accentColor={color}
      columns={columns}
      rows={gridRows}
      newRowId={NEW_FLAG_ROW_ID}
    />
  );
}
