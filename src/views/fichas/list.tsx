import { Alert, Box, Button, Card, CardContent, Skeleton } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteFicha, listFichas } from "api/fichas";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable, { GRID_COL_ACTIONS_TWO, GRID_COL_STATUS } from "components/data-table/GridTable";
import StatusIcon from "components/data-table/StatusIcon";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { FICHA_STATUS, fichasQueryKey } from "domain/fichas/constants";
import { formatDescanso, formatPadraoLabel } from "domain/fichas/formatters";
import { Ficha } from "domain/fichas/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import { useStatusMutation } from "hooks/useStatusMutation";
import useTenantBase from "hooks/useTenantBase";
import { MouseEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "services/api";

const HIDE_ON_MOBILE = ["padrao", "descanso"] as const;

export default function FichasList() {
  const navigate = useNavigate();
  const { base } = useTenantBase();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);

  const { data = [], isLoading, error, isFetching, refetch } = useQuery({
    queryKey: fichasQueryKey,
    queryFn: listFichas,
    retry: 1,
  });

  const toggleStatusMutation = useStatusMutation({
    savePath: "fichas",
    queryKey: fichasQueryKey,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteFicha(id),
    onSuccess: async () => {
      toast.success("Ficha excluída.");
      await queryClient.invalidateQueries({ queryKey: fichasQueryKey });
    },
    onError: () => toast.error("Não foi possível excluir a ficha."),
  });

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      const hay = `${String(row.id).padStart(5, "0")} ${row.nome} ${row.padrao} ${row.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [data, filter]);

  const columns: GridColDef<Ficha>[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "Código",
        width: 100,
        renderCell: (params) => params.value?.toString().padStart(5, "0"),
      },
      {
        field: "status",
        headerName: "Status",
        ...GRID_COL_STATUS,
        renderCell: (params) => (
          <StatusIcon
            status={params.row.status || FICHA_STATUS.ACTIVE}
            pausedCode={FICHA_STATUS.BLOCKED}
            id={params.row.id}
            nome={params.row.nome}
            onToggle={isCliente ? undefined : toggleStatusMutation.mutate}
            readOnly={isCliente}
          />
        ),
      },
      { field: "nome", headerName: "Nome", flex: 1, minWidth: 160 },
      {
        field: "padrao",
        headerName: "Padrão",
        width: 120,
        valueGetter: (_value, row) => formatPadraoLabel(row.padrao),
      },
      {
        field: "itens",
        headerName: "Itens",
        width: 90,
        valueGetter: (_value, row) => row.itens?.length ?? 0,
      },
      {
        field: "descanso",
        headerName: "Descanso",
        width: 110,
        valueGetter: (_value, row) => {
          const first = row.itens?.[0];
          return first ? formatDescanso(first.descanso_segundos) : "—";
        },
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
                  <ActionIcon
                    icon="line-md:edit"
                    color="info.main"
                    to={`${base}/fichas/${params.row.id}/edit`}
                  />
                  <ActionIcon
                    icon="mdi:delete"
                    color="error.main"
                    to="#delete"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm(`Excluir ficha "${params.row.nome}"?`)) {
                        removeMutation.mutate(params.row.id);
                      }
                    }}
                  />
                </TableActions>
              ),
            } satisfies GridColDef<Ficha>,
          ]),
    ],
    [base, isCliente, removeMutation, toggleStatusMutation.mutate],
  );

  function onRowClick(params: GridRowParams, event: MouseEvent) {
    if (isCliente) return;
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(`${base}/fichas/${params.row.id}/edit`);
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
                    onClick={() => navigate(`${base}/fichas/add`)}
                    variant="contained"
                    color="success"
                    sx={{ width: 140, height: 40 }}
                    startIcon={<Icon name="mdi:plus" />}
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
              rows={filtered}
              columns={columns}
              loading={isFetching}
              columnVisibilityModel={columnVisibilityModel}
              onRowClick={onRowClick}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
