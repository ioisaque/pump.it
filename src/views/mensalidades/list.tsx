import { Alert, Box, Button, Card, CardContent, MenuItem, Skeleton, Stack, TextField } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkoutMensalidade, deleteMensalidade, listMensalidades } from "api/mensalidades";
import Chip from "components/Chip";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable, { GRID_COL_ACTIONS_TWO } from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import MensalidadeFormDialog from "components/mensalidades/MensalidadeFormDialog";
import SearchInput from "components/SearchField";
import { MENSALIDADE_STATUS_LABEL, Mensalidade } from "domain/mensalidades/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import useTenantBase from "hooks/useTenantBase";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiBaseUrl } from "services/api";
import { DATA } from "utils/dates";

const HIDE_ON_MOBILE = ["competencia", "vencimento"] as const;

const STATUS_CHIP: Record<string, { color: string; icon: string }> = {
  PENDING: { color: "warning.main", icon: "mdi:clock-outline" },
  PAID: { color: "success.main", icon: "mdi:check-circle" },
  OVERDUE: { color: "error.main", icon: "mdi:alert-circle" },
  CANCELLED: { color: "neutral.dark", icon: "mdi:cancel" },
  REFUNDED: { color: "info.main", icon: "mdi:undo" },
};

export default function MensalidadesList() {
  const { user } = useAuth();
  const { academiaSlug } = useTenantBase();
  const jwtAcademiaId = user?.academia_id && user.academia_id > 0 ? user.academia_id : undefined;
  const hasAcademia = Boolean(jwtAcademiaId || academiaSlug);
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Mensalidade | null>(null);
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["mensalidades", jwtAcademiaId ?? academiaSlug ?? "none", statusFilter, isCliente ? user?.id : "all"],
    queryFn: () =>
      listMensalidades({
        academia_id: jwtAcademiaId,
        id_pessoa: isCliente ? user?.id : undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    enabled: hasAcademia,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMensalidade(id, jwtAcademiaId),
    onSuccess: async () => {
      toast.success("Mensalidade excluída.");
      await queryClient.invalidateQueries({ queryKey: ["mensalidades"] });
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ id, provider }: { id: number; provider: "asaas" | "mercadopago" }) =>
      checkoutMensalidade(id, provider, jwtAcademiaId),
    onSuccess: (res) => {
      if (res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
        toast.success(`Checkout ${res.provider}`);
      } else {
        toast.error("Link de pagamento indisponível.");
      }
    },
    onError: () => toast.error("Falha no checkout."),
  });

  const rows = useMemo(() => {
    const list = data?.mensalidades ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (m) =>
        String(m.id).padStart(5, "0").includes(term) ||
        m.pessoa_nome?.toLowerCase().includes(term) ||
        m.competencia.includes(term) ||
        (MENSALIDADE_STATUS_LABEL[m.status] ?? m.status).toLowerCase().includes(term),
    );
  }, [data?.mensalidades, q]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "Código",
        width: 100,
        renderCell: (params) => params.value?.toString().padStart(5, "0"),
      },
      ...(isCliente
        ? []
        : [
            {
              field: "pessoa_nome",
              headerName: "Pessoa",
              flex: 1,
              minWidth: 160,
              valueGetter: (_v, row) => row.pessoa_nome || `#${row.id_pessoa}`,
            } satisfies GridColDef,
          ]),
      { field: "competencia", headerName: "Competência", width: 120, ...(isCliente ? { flex: 1, minWidth: 120 } : {}) },
      {
        field: "valor",
        headerName: "Valor",
        width: 120,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <span style={{ fontWeight: 600 }}>{BRL(Number(params.row.valor ?? 0))}</span>
        ),
      },
      {
        field: "vencimento",
        headerName: "Vencimento",
        width: 120,
        valueFormatter: (value) => DATA(value as string | null) || "—",
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (params) => {
          const code = String(params.row.status);
          const chip = STATUS_CHIP[code] ?? { color: "neutral.dark", icon: "mdi:help-circle" };
          return (
            <Chip icon={chip.icon} color={chip.color} nome={MENSALIDADE_STATUS_LABEL[code] ?? code} />
          );
        },
      },
      {
        field: "actions",
        headerName: "Ações",
        ...(isCliente ? GRID_COL_ACTIONS_TWO : { width: 176, minWidth: 176, maxWidth: 176 }),
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row as Mensalidade;
          return (
            <TableActions>
              {!isCliente ? (
                <ActionIcon
                  icon="line-md:edit"
                  color="info.main"
                  to="#edit"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditing(row);
                    setFormOpen(true);
                  }}
                />
              ) : null}
              <ActionIcon
                icon="mdi:cash"
                color="success.main"
                to="#asaas"
                onClick={(e) => {
                  e.preventDefault();
                  checkoutMutation.mutate({ id: row.id, provider: "asaas" });
                }}
              />
              <ActionIcon
                icon="mdi:credit-card-outline"
                color="primary.main"
                to="#mp"
                onClick={(e) => {
                  e.preventDefault();
                  checkoutMutation.mutate({ id: row.id, provider: "mercadopago" });
                }}
              />
              {!isCliente ? (
                <ActionIcon
                  icon="mdi:delete"
                  color="error.main"
                  to="#delete"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm(`Excluir mensalidade #${row.id}?`)) {
                      deleteMutation.mutate(row.id);
                    }
                  }}
                />
              ) : null}
            </TableActions>
          );
        },
      },
    ],
    [checkoutMutation, deleteMutation, isCliente],
  );

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

      {!hasAcademia ? (
        <Alert severity="info" sx={{ mb: 2, flexShrink: 0 }}>
          Selecione uma academia para listar mensalidades.
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
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                  <SearchInput placeholder="Filtrar lista..." value={q} onChange={(e) => setQ(e.target.value)} />
                  <TextField
                    size="small"
                    select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 160, ...compactInputRootSx() }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {Object.entries(MENSALIDADE_STATUS_LABEL).map(([code, label]) => (
                      <MenuItem key={code} value={code}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              }
              right={
                isCliente ? undefined : (
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: 140, height: 40 }}
                  startIcon={<Icon name="mdi:plus" />}
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  disabled={!hasAcademia}
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
              stripeInactiveRows={false}
              rows={rows}
              columns={columns}
              loading={isFetching}
              getRowId={(row) => row.id}
              columnVisibilityModel={columnVisibilityModel}
            />
          )}
        </CardContent>
      </Card>

      {isCliente ? null : (
      <MensalidadeFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        academiaId={jwtAcademiaId}
        initial={editing}
      />
      )}
    </Box>
  );
}
