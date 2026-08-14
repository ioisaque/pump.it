import { Alert, Box, Button, Card, CardContent, Skeleton } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAvaliacao, listAvaliacoes } from "api/avaliacoes";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable, { GRID_COL_ACTIONS_TWO } from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { calcImc, formatAvaliacaoData } from "domain/avaliacoes/formatters";
import { Avaliacao } from "domain/avaliacoes/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import useTenantBase from "hooks/useTenantBase";
import { MouseEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "services/api";

const HIDE_ON_MOBILE = ["peso_kg", "altura_cm", "imc"] as const;

export default function AvaliacoesList() {
  const navigate = useNavigate();
  const { base } = useTenantBase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const [filter, setFilter] = useState("");
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);
  const academiaId = user?.academia_id && user.academia_id > 0 ? user.academia_id : undefined;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["avaliacoes", academiaId],
    queryFn: () => listAvaliacoes(academiaId ? { academia_id: academiaId } : undefined),
    enabled: !!academiaId,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAvaliacao(id, academiaId ? { academia_id: academiaId } : undefined),
    onSuccess: async () => {
      toast.success("Avaliação excluída.");
      await queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Falha ao excluir.");
    },
  });

  const rows = useMemo(() => {
    const list = data?.avaliacoes ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const nome = row.pessoa_nome?.toLowerCase() ?? "";
      return (
        nome.includes(q) ||
        String(row.id_pessoa).includes(q) ||
        String(row.id).padStart(5, "0").includes(q) ||
        (row.data ?? "").includes(q)
      );
    });
  }, [data?.avaliacoes, filter]);

  const editPath = (id: number) =>
    academiaId ? `${base}/avaliacoes/${id}?academia_id=${academiaId}` : `${base}/avaliacoes/${id}`;

  const columns: GridColDef<Avaliacao>[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "Código",
        width: 100,
        renderCell: (params) => params.value?.toString().padStart(5, "0"),
      },
      {
        field: "pessoa_nome",
        headerName: "Pessoa",
        flex: 1,
        minWidth: 160,
        valueGetter: (_v, row) => row.pessoa_nome || `#${row.id_pessoa}`,
      },
      {
        field: "data",
        headerName: "Data",
        width: 110,
        valueFormatter: (value) => formatAvaliacaoData(value as string | null),
      },
      {
        field: "peso_kg",
        headerName: "Peso",
        width: 90,
        valueFormatter: (value) => (value == null ? "—" : `${value} kg`),
      },
      {
        field: "altura_cm",
        headerName: "Altura",
        width: 90,
        valueFormatter: (value) => (value == null ? "—" : `${value} cm`),
      },
      {
        field: "imc",
        headerName: "IMC",
        width: 80,
        valueGetter: (_v, row) => calcImc(row.peso_kg, row.altura_cm),
        valueFormatter: (value) => (value == null ? "—" : String(value)),
      },
      ...(isCliente
        ? []
        : [
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
            } satisfies GridColDef<Avaliacao>,
          ]),
    ],
    [academiaId, base, deleteMutation, isCliente],
  );

  function onRowClick(params: GridRowParams, event: MouseEvent) {
    if (isCliente) return;
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(editPath(params.row.id));
  }

  const loadError = error as { message?: string } | null;

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column" }}>
      {loadError ? (
        <Alert
          severity="error"
          sx={{ mb: 2, flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          }
        >
          Não foi possível carregar a lista. Verifique se a API está rodando ({apiBaseUrl()}).
        </Alert>
      ) : null}

      {!academiaId ? (
        <Alert severity="info" sx={{ mb: 2, flexShrink: 0 }}>
          Selecione uma academia para listar avaliações.
        </Alert>
      ) : null}

      <Card sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <CardContent
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            pt: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <EntityHeader
              left={
                <SearchInput placeholder="Filtrar lista..." value={filter} onChange={(e) => setFilter(e.target.value)} />
              }
              right={
                isCliente ? undefined : (
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ width: 140, height: 40 }}
                    startIcon={<Icon name="mdi:plus" />}
                    onClick={() => navigate(`${base}/avaliacoes/add`)}
                    disabled={!academiaId}
                  >
                    Adicionar
                  </Button>
                )
              }
            />
          </Box>

          {isLoading ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {Array.from({ length: 10 }, (_, i) => (
                <Skeleton key={`skeleton-${i}`} variant="rounded" width="100%" height={50} sx={{ margin: "10px 0px" }} />
              ))}
            </Box>
          ) : (
            <GridTable
              autoHeightFill
              color="secondary"
              rows={rows}
              columns={columns}
              loading={isFetching}
              getRowId={(row) => row.id}
              columnVisibilityModel={columnVisibilityModel}
              onRowClick={onRowClick}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
