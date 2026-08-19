import { Box, Button, MenuItem, Select, Stack, Typography } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { desvincularFichaAluno, listFichas, vincularFichaAluno } from "api/fichas";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable, { GRID_COL_ACTIONS_TWO } from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import { formatPadraoLabel } from "domain/fichas/formatters";
import { Ficha } from "domain/fichas/types";
import { MouseEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";
import { pessoaSectionSx } from "utils/pessoas/styles";

export default function PessoaFichas({ pessoaId }: { pessoaId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modeloId, setModeloId] = useState("");

  const { data: fichas = [], isLoading } = useQuery({
    queryKey: ["fichas", "pessoa", pessoaId],
    queryFn: () => listFichas({ id_pessoa: pessoaId }),
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ["fichas", "modelos"],
    queryFn: () => listFichas({ escopo: "modelos" }),
  });

  const vincular = useMutation({
    mutationFn: (fichaId: number) => vincularFichaAluno(fichaId, pessoaId),
    onSuccess: async () => {
      toast.success("Plano vinculado.");
      setModeloId("");
      await queryClient.invalidateQueries({ queryKey: ["fichas", "pessoa", pessoaId] });
    },
    onError: () => toast.error("Não foi possível vincular o plano."),
  });

  const desvincular = useMutation({
    mutationFn: (fichaId: number) => desvincularFichaAluno(fichaId, pessoaId),
    onSuccess: async () => {
      toast.success("Plano desvinculado.");
      await queryClient.invalidateQueries({ queryKey: ["fichas", "pessoa", pessoaId] });
    },
    onError: () => toast.error("Não foi possível desvincular."),
  });

  const jaVinculados = new Set(fichas.map((f) => f.id));
  const disponiveis = modelos.filter((m) => !jaVinculados.has(m.id));
  const editPath = (id: number) => LINK(`/workout-plans/${id}/edit`, { pessoa: pessoaId });

  const columns: GridColDef<Ficha>[] = useMemo(
    () => [
      {
        field: "nome",
        headerName: "Plano",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "padrao",
        headerName: "Padrão",
        width: 100,
        valueFormatter: (value) => formatPadraoLabel(String(value ?? "")),
      },
      {
        field: "actions",
        headerName: "Ações",
        ...GRID_COL_ACTIONS_TWO,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <TableActions>
            <ActionIcon icon="line-md:edit" color="info.main" to={editPath(params.row.id)} />
            <ActionIcon
              icon="mdi:link-off"
              color="error.main"
              to="#unlink"
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm(`Desvincular plano "${params.row.nome}"?`)) {
                  desvincular.mutate(params.row.id);
                }
              }}
            />
          </TableActions>
        ),
      },
    ],
    [desvincular.mutate, pessoaId],
  );

  function onRowClick(params: GridRowParams, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(editPath(params.row.id));
  }

  return (
    <Box sx={{ ...pessoaSectionSx, minWidth: 0, width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Planos de treino
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Select
            size="small"
            displayEmpty
            value={modeloId}
            onChange={(e) => setModeloId(String(e.target.value))}
            sx={{ minWidth: 160, ...compactInputRootSx() }}
          >
            <MenuItem value="">
              <em>Escolher modelo</em>
            </MenuItem>
            {disponiveis.map((m) => (
              <MenuItem key={m.id} value={String(m.id)}>
                {m.nome} ({formatPadraoLabel(String(m.padrao))})
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="success"
            disabled={!modeloId || vincular.isLoading}
            onClick={() => vincular.mutate(Number(modeloId))}
          >
            Vincular
          </Button>
        </Stack>
      </Stack>
      <GridTable
        autoHeight
        color="secondary"
        rows={fichas}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />
    </Box>
  );
}
