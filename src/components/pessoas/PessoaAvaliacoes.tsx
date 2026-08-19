import { Box, Button, Stack, Typography } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAvaliacao, listAvaliacoes } from "api/avaliacoes";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import { calcImc, formatAvaliacaoData } from "domain/avaliacoes/formatters";
import { Avaliacao } from "domain/avaliacoes/types";
import { MouseEvent, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";
import { pessoaSectionSx } from "utils/pessoas/styles";

const BTN_140 = { width: 140, height: 40 } as const;
const GRID_COL_ACTIONS_THREE = { width: 120, minWidth: 120, maxWidth: 120, flex: 0, resizable: false } as const;

export default function PessoaAvaliacoes({ pessoaId }: { pessoaId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["avaliacoes", "pessoa", pessoaId],
    queryFn: () => listAvaliacoes({ id_pessoa: pessoaId }),
  });
  const rows = data?.avaliacoes ?? [];
  const pessoaQuery = { pessoa: pessoaId };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAvaliacao(id),
    onSuccess: async () => {
      toast.success("Avaliação excluída.");
      await queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Falha ao excluir.");
    },
  });

  const showPath = (id: number) => LINK(`/avaliacoes/${id}`, pessoaQuery);
  const editPath = (id: number) => LINK(`/avaliacoes/${id}/edit`, pessoaQuery);

  const columns: GridColDef<Avaliacao>[] = useMemo(
    () => [
      {
        field: "data",
        headerName: "Data",
        flex: 1,
        minWidth: 100,
        valueFormatter: (value) => formatAvaliacaoData(value as string | null),
      },
      {
        field: "peso_kg",
        headerName: "Peso",
        width: 80,
        valueFormatter: (value) => (value == null ? "—" : `${value} kg`),
      },
      {
        field: "imc",
        headerName: "IMC",
        width: 70,
        valueGetter: (_v, row) => calcImc(row.peso_kg, row.altura_cm),
        valueFormatter: (value) => (value == null ? "—" : String(value)),
      },
      {
        field: "actions",
        headerName: "Ações",
        ...GRID_COL_ACTIONS_THREE,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <TableActions>
            <ActionIcon icon="mdi:human" color="secondary.main" to={showPath(params.row.id)} />
            <ActionIcon icon="line-md:edit" color="info.main" to={editPath(params.row.id)} />
            <ActionIcon
              icon="mdi:delete"
              color="error.main"
              to="#delete"
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm("Excluir esta avaliação?")) {
                  deleteMutation.mutate(params.row.id);
                }
              }}
            />
          </TableActions>
        ),
      },
    ],
    [deleteMutation.mutate, pessoaId],
  );

  function onRowClick(params: GridRowParams, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(showPath(params.row.id));
  }

  return (
    <Box sx={{ ...pessoaSectionSx, minWidth: 0, width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Avaliações
        </Typography>
        <Button
          variant="contained"
          color="success"
          sx={BTN_140}
          startIcon={<Icon name="mdi:plus" />}
          onClick={() => navigate(LINK("/avaliacoes/add", pessoaQuery))}
        >
          Adicionar
        </Button>
      </Stack>
      <GridTable
        autoHeight
        color="secondary"
        rows={rows}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />
    </Box>
  );
}
