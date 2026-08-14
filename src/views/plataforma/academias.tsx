import { Alert, Box, Button, Skeleton } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { listAcademias } from "api/academias";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable, { GRID_COL_ACTIONS_ONE } from "components/data-table/GridTable";
import StatusIcon from "components/data-table/StatusIcon";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { useStatusMutation } from "hooks/useStatusMutation";
import { MouseEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";

type AcademiaRow = {
  id: number;
  slug: string;
  nome: string;
  status: string;
  cidade?: string | null;
  estado?: string | null;
  alunos_ativos?: number;
};

export default function AcademiasPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["academias"],
    queryFn: () => listAcademias(),
    retry: 1,
  });

  const toggleStatusMutation = useStatusMutation({
    savePath: "academias",
    queryKey: ["academias"],
  });

  const rows = useMemo(() => {
    const academias = (data?.academias ?? []) as AcademiaRow[];
    const q = filter.trim().toLowerCase();
    if (!q) return academias;
    return academias.filter(
      (a) =>
        a.nome.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.cidade ?? "").toLowerCase().includes(q) ||
        (a.estado ?? "").toLowerCase().includes(q),
    );
  }, [data?.academias, filter]);

  const columns: GridColDef<AcademiaRow>[] = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      {
        field: "status",
        headerName: "Status",
        width: 90,
        sortable: false,
        renderCell: (params) => (
          <StatusIcon
            status={params.row.status || "ACTIVE"}
            pausedCode="BLOCKED"
            id={params.row.id}
            nome={params.row.nome}
            onToggle={toggleStatusMutation.mutate}
          />
        ),
      },
      { field: "nome", headerName: "Nome", flex: 1, minWidth: 160 },
      { field: "slug", headerName: "Slug", flex: 1, minWidth: 120 },
      {
        field: "alunos_ativos",
        headerName: "Alunos",
        width: 110,
        type: "number",
        valueGetter: (_v, row) => row.alunos_ativos ?? 0,
      },
      {
        field: "cidade",
        headerName: "Cidade",
        flex: 1,
        minWidth: 120,
        valueGetter: (_v, row) => {
          const cidade = row.cidade?.trim();
          const uf = row.estado?.trim();
          if (cidade && uf) return `${cidade}/${uf}`;
          return cidade || uf || "—";
        },
      },
      {
        field: "actions",
        headerName: "",
        ...GRID_COL_ACTIONS_ONE,
        sortable: false,
        renderCell: (params) => (
          <TableActions>
            <ActionIcon icon="majesticons:open" color="info.main" to={LINK("/", undefined, params.row.slug)} />
          </TableActions>
        ),
      },
    ],
    [toggleStatusMutation.mutate],
  );

  function onRowClick(params: GridRowParams, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(LINK(`/plataforma/academias/${params.row.id}/edit`));
  }

  return (
    <Box sx={{ py: 1 }}>
      <EntityHeader
        left={
          <SearchInput
            placeholder="Filtrar academias…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        }
        right={
          <Button
            variant="contained"
            color="success"
            startIcon={<Icon name="mdi:plus" />}
            onClick={() => navigate(LINK("/plataforma/academias/add"))}
            sx={{ height: 40 }}
          >
            Nova
          </Button>
        }
      />

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Tentar de novo
            </Button>
          }
          sx={{ mb: 2 }}
        >
          Falha ao carregar academias.
        </Alert>
      ) : null}

      {isLoading ? (
        <Box>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} variant="rounded" width="100%" height={50} sx={{ my: 1 }} />
          ))}
        </Box>
      ) : (
        <GridTable
          color="secondary"
          rows={rows}
          columns={columns}
          loading={isFetching}
          onRowClick={onRowClick}
        />
      )}
    </Box>
  );
}
