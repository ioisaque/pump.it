import { Alert, Box, Button, Card, CardContent, Skeleton, Stack } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAcesso, deleteAcesso, listAcessos, saveAcesso } from "api/acessos";
import AcessoFormDialog from "components/acessos/AcessoFormDialog";
import Chip from "components/Chip";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable, { GRID_COL_ACTIONS_TWO } from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { acessoTipoLabel } from "domain/acessos/labels";
import { Acesso, AcessoFormValues, AcessoTipo } from "domain/acessos/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { apiBaseUrl } from "services/api";
import { DATA_HORA } from "utils/dates";

const HIDE_ON_MOBILE = ["origem"] as const;
const BTN_140 = { width: 140, height: 40 } as const;

export default function AcessosListPage() {
  const { academiaSlug } = useParams<{ academiaSlug?: string }>();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultTipo, setDefaultTipo] = useState<AcessoTipo>("ENTRADA");
  const [editing, setEditing] = useState<Acesso | null>(null);
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);

  const scopeParams = useMemo(
    () => (academiaSlug ? { academia_slug: academiaSlug } : undefined),
    [academiaSlug],
  );

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["acessos", academiaSlug ?? "all"],
    queryFn: () => listAcessos(scopeParams),
    retry: 1,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["acessos"] });

  const addMutation = useMutation({
    mutationFn: (values: AcessoFormValues) =>
      addAcesso(
        {
          id_pessoa: Number(values.id_pessoa),
          tipo: values.tipo,
          criado_em: values.criado_em || undefined,
          origem: values.origem || null,
          academia_slug: academiaSlug,
        },
        scopeParams,
      ),
    onSuccess: async () => {
      toast.success("Check-in registrado.");
      setDialogOpen(false);
      await invalidate();
    },
    onError: () => toast.error("Não foi possível registrar o check-in."),
  });

  const saveMutation = useMutation({
    mutationFn: (values: AcessoFormValues) =>
      saveAcesso(
        editing!.id,
        {
          id_pessoa: Number(values.id_pessoa),
          tipo: values.tipo,
          criado_em: values.criado_em || undefined,
          origem: values.origem || null,
        },
        scopeParams,
      ),
    onSuccess: async () => {
      toast.success("Check-in atualizado.");
      setEditing(null);
      setDialogOpen(false);
      await invalidate();
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAcesso(id, scopeParams),
    onSuccess: async () => {
      toast.success("Check-in excluído.");
      await invalidate();
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  const rows = useMemo(() => {
    const list = data?.acessos ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const hay = `${String(row.id).padStart(5, "0")} ${row.id_pessoa} ${row.pessoa_nome ?? ""} ${row.tipo} ${row.origem ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [data?.acessos, filter]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "Código",
        width: 100,
        renderCell: (params) => params.value?.toString().padStart(5, "0"),
      },
      {
        field: "criado_em",
        headerName: "Quando",
        flex: 1,
        minWidth: 160,
        valueFormatter: (value) => DATA_HORA(value as string | null) || "—",
      },
      {
        field: "tipo",
        headerName: "Tipo",
        width: 140,
        renderCell: (params) => {
          const tipo = String(params.row.tipo);
          const entrada = tipo === "ENTRADA";
          return (
            <Chip
              icon={entrada ? "mdi:login" : "mdi:logout"}
              color={entrada ? "success.main" : "quinzel.main"}
              nome={acessoTipoLabel(tipo)}
            />
          );
        },
      },
      {
        field: "pessoa",
        headerName: "Pessoa",
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) =>
          row.pessoa_nome ? `${row.pessoa_nome} (#${row.id_pessoa})` : `#${row.id_pessoa}`,
      },
      {
        field: "origem",
        headerName: "Origem",
        width: 120,
        valueGetter: (_value, row) => row.origem || "—",
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
                    to="#edit"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditing(params.row as Acesso);
                      setDefaultTipo((params.row as Acesso).tipo as AcessoTipo);
                      setDialogOpen(true);
                    }}
                  />
                  <ActionIcon
                    icon="mdi:delete"
                    color="error.main"
                    to="#delete"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm("Excluir este check-in?")) {
                        deleteMutation.mutate(params.row.id);
                      }
                    }}
                  />
                </TableActions>
              ),
            } satisfies GridColDef<Acesso>,
          ]),
    ],
    [deleteMutation, isCliente],
  );

  function openRegister(tipo: AcessoTipo) {
    setEditing(null);
    setDefaultTipo(tipo);
    setDialogOpen(true);
  }

  const saving = addMutation.isLoading || saveMutation.isLoading;
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
                  <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      sx={BTN_140}
                      startIcon={<Icon name="mdi:login" />}
                      onClick={() => openRegister("ENTRADA")}
                    >
                      Entrada
                    </Button>
                    <Button
                      variant="contained"
                      color="quinzel"
                      sx={BTN_140}
                      startIcon={<Icon name="mdi:logout" />}
                      onClick={() => openRegister("SAIDA")}
                    >
                      Saída
                    </Button>
                  </Stack>
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
            />
          )}
        </CardContent>
      </Card>

      <AcessoFormDialog
        open={dialogOpen}
        title={editing ? "Editar check-in" : `Registrar ${defaultTipo === "ENTRADA" ? "entrada" : "saída"}`}
        initial={editing}
        defaultTipo={defaultTipo}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={(values) => {
          if (editing) saveMutation.mutate(values);
          else addMutation.mutate(values);
        }}
      />
    </Box>
  );
}
