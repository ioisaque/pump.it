import { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listEntityStatus, saveEntityStatus, StatusEntity } from "api/flags";
import GridCellTextField from "components/data-table/GridCellTextField";
import GridTable, {
    GRID_COL_ICONE_PICKER,
    GRID_COL_ROTULO,
} from "components/data-table/GridTable";
import IconPicker from "components/IconPicker";
import {
    TabelaPreviewItem,
    TabelaPreviewState,
    useTabelaPreview,
} from "components/tabelas/TabelaPreview";
import { EntityStatusFlag } from "domain/tabelas/types";
import { flagsStatusQueryKey } from "hooks/useFlagCatalogs";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export interface FlagStatusGridProps {
  entity: StatusEntity;
  color: string;
  focusedKey: string | null;
  setFocusedKey: (key: string | null) => void;
  setPreview: (state: TabelaPreviewState) => void;
}

export default function FlagStatusGrid({
  entity,
  color,
  focusedKey,
  setFocusedKey,
  setPreview,
}: FlagStatusGridProps) {
  const queryClient = useQueryClient();
  const queryKey = ["tabelas", "status", entity];
  const [drafts, setDrafts] = useState<Record<string, Partial<EntityStatusFlag>>>({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listEntityStatus(entity),
  });

  const saveMutation = useMutation({
    mutationFn: async (row: EntityStatusFlag) => {
      const draft = drafts[row.code] ?? {};
      const merged = {
        ...row,
        ...draft,
        icon: row.icon,
        color: row.color,
      };
      return saveEntityStatus(entity, row.code, {
        label: merged.label ?? merged.nome,
        icon: merged.icon,
        color: merged.color,
      });
    },
    onSuccess: async () => {
      toast.success("Status salvo.");
      setDrafts({});
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: flagsStatusQueryKey(entity) });
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  function rowValue(row: EntityStatusFlag, field: keyof EntityStatusFlag) {
    const draft = drafts[row.code];
    if (draft && field in draft) return draft[field];
    return row[field];
  }

  function setRowDraft(code: string, field: keyof EntityStatusFlag, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [code]: { ...(prev[code] ?? {}), [field]: value },
    }));
  }

  const previewItems = useMemo((): TabelaPreviewItem[] => {
    return rows.map((row) => ({
      key: row.code,
      label: String(rowValue(row, "label") ?? rowValue(row, "nome") ?? row.code),
      icon: String(rowValue(row, "icon") ?? "label"),
      color: String(rowValue(row, "color") ?? "neutral.main"),
    }));
  }, [rows, drafts]);

  useTabelaPreview(setPreview, focusedKey, previewItems);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "icon",
        headerName: "Ícone",
        ...GRID_COL_ICONE_PICKER,
        renderCell: (params) => {
          const row = params.row as EntityStatusFlag;
          const icon = String(rowValue(row, "icon") ?? "");
          const colorValue = String(rowValue(row, "color") ?? "");
          return (
            <IconPicker
              icon={icon}
              color={colorValue}
              size={32}
              onOpen={() => setFocusedKey(row.code)}
              onIconChange={(next) => {
                setRowDraft(row.code, "icon", next);
                saveMutation.mutate({ ...row, icon: next, color: colorValue });
              }}
              onColorChange={(next) => {
                setRowDraft(row.code, "color", next);
                saveMutation.mutate({ ...row, icon, color: next });
              }}
              onClose={() => setFocusedKey(null)}
            />
          );
        },
      },
      {
        field: "label",
        headerName: "Rótulo",
        ...GRID_COL_ROTULO,
        renderCell: (params) => {
          const row = params.row as EntityStatusFlag;
          return (
            <GridCellTextField
              value={String(rowValue(row, "label") ?? rowValue(row, "nome") ?? "")}
              onFocus={() => setFocusedKey(row.code)}
              onLiveChange={(value) => setRowDraft(row.code, "label", value)}
              onCommit={(value) => setRowDraft(row.code, "label", value)}
              onBlur={() => {
                setFocusedKey(null);
                saveMutation.mutate(row);
              }}
            />
          );
        },
      },
    ],
    [saveMutation],
  );

  return (
    <GridTable
      accentColor={color}
      rows={rows}
      columns={columns}
      loading={isLoading}
      getRowId={(row) => `${entity}-${row.code}`}
      disableRowSelectionOnClick
    />
  );
}
