import { Alert, Box, Button, Card, CardContent, Skeleton } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { listTreinos, Treino } from "api/treinos";
import GridTable from "components/data-table/GridTable";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { MouseEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiBaseUrl } from "services/api";
import { DATA_HORA } from "utils/dates";
import { LINK } from "utils/link";

export default function WorkoutsListPage() {
  const navigate = useNavigate();
  const { academiaSlug } = useParams<{ academiaSlug?: string }>();
  const [filter, setFilter] = useState("");

  const scopeParams = useMemo(
    () => (academiaSlug ? { academia_slug: academiaSlug } : undefined),
    [academiaSlug],
  );

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["treinos", academiaSlug ?? "all"],
    queryFn: () => listTreinos(scopeParams),
    retry: 1,
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const ficha = row.ficha?.nome ?? "";
      const hay = `${String(row.id).padStart(5, "0")} ${ficha} ${row.dia}`.toLowerCase();
      return hay.includes(q);
    });
  }, [data, filter]);

  const columns: GridColDef<Treino>[] = useMemo(
    () => [
      {
        field: "ficha",
        headerName: "Ficha",
        flex: 1,
        minWidth: 160,
        valueGetter: (_value, row) => row.ficha?.nome || `#${row.id_ficha}`,
      },
      {
        field: "dia",
        headerName: "Dia",
        width: 80,
      },
      {
        field: "iniciado_em",
        headerName: "Início",
        flex: 1,
        minWidth: 160,
        valueFormatter: (value) => DATA_HORA(value as string | null) || "—",
      },
      {
        field: "encerrado_em",
        headerName: "Fim",
        flex: 1,
        minWidth: 160,
        valueFormatter: (value) => (value ? DATA_HORA(value as string) : "Em andamento"),
      },
    ],
    [],
  );

  function onRowClick(params: GridRowParams<Treino>, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(LINK(`/workout/${params.row.id}/end`));
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
              onRowClick={onRowClick}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
