import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { listExercicios } from "api/exercicios";
import Chip from "components/Chip";
import GridTable, { GRID_COL_STATUS } from "components/data-table/GridTable";
import StatusIcon from "components/data-table/StatusIcon";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { EXERCICIO_STATUS, EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { resolveUploadUrl } from "domain/exercicios/formatters";
import { Exercicio } from "domain/exercicios/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import { useStatusMutation } from "hooks/useStatusMutation";
import useTenantBase from "hooks/useTenantBase";
import { MouseEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "services/api";

const HIDE_ON_MOBILE = ["descricao"] as const;

function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function capaSrc(capa?: { tipo: string; caminho: string } | null): string {
  if (!capa?.caminho) return "";
  if (capa.tipo === "VIDEO") {
    const id = youtubeIdFromUrl(capa.caminho);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  }
  return resolveUploadUrl(capa.caminho);
}

function formatCarga(carga?: number | null): string {
  if (carga == null || Number.isNaN(Number(carga))) return "—";
  return `${carga} kg`;
}

export default function ExerciciosList() {
  const { base } = useTenantBase();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);

  const { data = [], isLoading, error, isFetching, refetch } = useQuery({
    queryKey: EXERCICIOS_QUERY_KEY,
    queryFn: listExercicios,
    retry: 1,
  });

  const toggleStatusMutation = useStatusMutation({
    savePath: "exercicios",
    queryKey: EXERCICIOS_QUERY_KEY,
  });

  const rows = useMemo(() => {
    const source = isCliente ? data.filter((row) => row.status === EXERCICIO_STATUS.ACTIVE) : data;
    const q = filter.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (row) =>
        row.nome.toLowerCase().includes(q) ||
        (row.descricao ?? "").toLowerCase().includes(q) ||
        (row.musculos ?? []).some((m) => m.nome.toLowerCase().includes(q)) ||
        String(row.id).padStart(5, "0").includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [data, filter, isCliente]);

  const columns: GridColDef<Exercicio>[] = useMemo(() => {
    if (isCliente) {
      return [
        {
          field: "exercicio",
          headerName: "Exercício",
          flex: 1,
          minWidth: 280,
          sortable: false,
          filterable: false,
          renderCell: (params) => {
            const src = capaSrc(params.row.capa);
            return (
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1, width: "100%", minWidth: 0 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {src ? (
                    <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Icon name="mdi:dumbbell" />
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {params.row.nome}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between" sx={{ mt: 0.25 }}>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ minWidth: 0, pr: 1, flex: 1 }}>
                      {params.row.descricao?.trim() || "—"}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                      {formatCarga(params.row.carga_inicial)}
                    </Typography>
                  </Stack>
                  {(params.row.musculos ?? []).length ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                      {(params.row.musculos ?? []).map((m) => (
                        <Chip key={m.id} icon={m.icon} nome={m.nome} color={m.color} fontSize="72%" />
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              </Stack>
            );
          },
        },
      ];
    }
    return [
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
            status={params.row.status || EXERCICIO_STATUS.ACTIVE}
            pausedCode={EXERCICIO_STATUS.INACTIVE}
            id={params.row.id}
            nome={params.row.nome}
            onToggle={toggleStatusMutation.mutate}
          />
        ),
      },
      { field: "nome", headerName: "Nome", flex: 1, minWidth: 160 },
      {
        field: "descricao",
        headerName: "Descrição",
        flex: 1.2,
        minWidth: 180,
        valueGetter: (_v, row) => row.descricao ?? "",
      },
      {
        field: "musculos",
        headerName: "Músculos",
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center" sx={{ py: 0.5 }}>
            {(params.row.musculos ?? []).map((m) => (
              <Chip key={m.id} icon={m.icon} nome={m.nome} color={m.color} />
            ))}
          </Stack>
        ),
      },
    ];
  }, [isCliente, toggleStatusMutation.mutate]);

  function onRowClick(params: GridRowParams, event: MouseEvent) {
    if (isCliente) return;
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(`${base}/exercicios/${params.row.id}`);
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
                    onClick={() => navigate(`${base}/exercicios/add`)}
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
              rows={rows}
              columns={columns}
              loading={isFetching}
              columnVisibilityModel={isCliente ? undefined : columnVisibilityModel}
              onRowClick={isCliente ? undefined : onRowClick}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
