import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAvaliacao, listAvaliacoes } from "api/avaliacoes";
import { ANATOMIA_HIGHLIGHT } from "components/AnatomiaFigure";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { calcImc, classificacaoImc, formatAvaliacaoData } from "domain/avaliacoes/formatters";
import { Avaliacao } from "domain/avaliacoes/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAnatomiaGenero from "hooks/useAnatomiaGenero";
import useAuth from "hooks/useAuth";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import useTenantBase from "hooks/useTenantBase";
import { MouseEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "services/api";
import { LINK } from "utils/link";

const HIDE_ON_MOBILE = ["peso_kg", "altura_cm", "imc"] as const;

function AvaliacaoAlunoCard({
  row,
  onOpen,
}: {
  row: Avaliacao;
  onOpen: (row: Avaliacao) => void;
}) {
  const { assets } = useAnatomiaGenero();
  const imc = calcImc(row.peso_kg, row.altura_cm);
  const imcLabel = classificacaoImc(imc);

  const stats = [
    { label: "Peso", value: row.peso_kg == null ? "—" : `${row.peso_kg} kg` },
    { label: "Altura", value: row.altura_cm == null ? "—" : `${row.altura_cm} cm` },
    { label: "IMC", value: imc == null ? "—" : String(imc), hint: imcLabel },
  ];

  return (
    <Card
      variant="outlined"
      onClick={() => onOpen(row)}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        borderColor: "divider",
        boxShadow: "none",
        cursor: "pointer",
      }}
    >
      <Box sx={{ display: "flex", minHeight: 148, alignItems: "center" }}>
        <Box
          component="img"
          src={assets.frente}
          alt=""
          draggable={false}
          sx={{
            width: 72,
            height: 120,
            ml: 1.5,
            flexShrink: 0,
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
        <CardContent sx={{ flex: 1, py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack spacing={2}>
            <Box minWidth={0}>
              <Typography variant="h6" fontWeight={700} color={ANATOMIA_HIGHLIGHT} lineHeight={1.25}>
                {formatAvaliacaoData(row.data)}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.4}>
                #{String(row.id).padStart(5, "0")}
              </Typography>
            </Box>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {stats.map((s) => (
                <Stack key={s.label} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {s.label}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {s.value}
                  </Typography>
                  {s.hint ? (
                    <Typography variant="caption" color="text.secondary">
                      {s.hint}
                    </Typography>
                  ) : null}
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardContent>
        <Box sx={{ width: 8, flexShrink: 0, alignSelf: "stretch", bgcolor: ANATOMIA_HIGHLIGHT }} />
      </Box>
    </Card>
  );
}

export default function AvaliacoesList() {
  const navigate = useNavigate();
  const { academiaSlug } = useTenantBase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const [filter, setFilter] = useState("");
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);
  const jwtAcademiaId = user?.academia_id && user.academia_id > 0 ? user.academia_id : undefined;
  const hasAcademia = Boolean(jwtAcademiaId || academiaSlug);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["avaliacoes", jwtAcademiaId ?? academiaSlug ?? "none"],
    queryFn: () => listAvaliacoes(jwtAcademiaId ? { academia_id: jwtAcademiaId } : undefined),
    enabled: hasAcademia,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAvaliacao(id, jwtAcademiaId ? { academia_id: jwtAcademiaId } : undefined),
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

  const showPath = (id: number) =>
    LINK(`/avaliacoes/${id}`, jwtAcademiaId ? { academia_id: jwtAcademiaId } : undefined);
  const editPath = (id: number) =>
    LINK(`/avaliacoes/${id}/edit`, jwtAcademiaId ? { academia_id: jwtAcademiaId } : undefined);

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
              width: 120,
              minWidth: 120,
              maxWidth: 120,
              flex: 0,
              resizable: false,
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
            } satisfies GridColDef<Avaliacao>,
          ]),
    ],
    [jwtAcademiaId, academiaSlug, deleteMutation, isCliente],
  );

  function onRowClick(params: GridRowParams, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(showPath(params.row.id));
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

      {!hasAcademia ? (
        <Alert severity="info" sx={{ mb: 2, flexShrink: 0 }}>
          Selecione uma academia para listar avaliações.
        </Alert>
      ) : null}

      {isCliente ? (
        <>
          <Box sx={{ flexShrink: 0 }}>
            <EntityHeader
              left={
                <SearchInput placeholder="Filtrar lista..." value={filter} onChange={(e) => setFilter(e.target.value)} />
              }
            />
          </Box>
          {isLoading ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton
                  key={`skeleton-${i}`}
                  variant="rounded"
                  width="100%"
                  height={160}
                  sx={{ margin: "10px 0px" }}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {rows.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  Nenhuma avaliação encontrada.
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ pb: 1 }}>
                  {rows.map((row) => (
                    <AvaliacaoAlunoCard
                      key={row.id}
                      row={row}
                      onOpen={(item) => navigate(showPath(item.id))}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </>
      ) : (
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
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: 140, height: 40 }}
                  startIcon={<Icon name="mdi:plus" />}
                  onClick={() => navigate(LINK("/avaliacoes/add"))}
                  disabled={!hasAcademia}
                >
                  Adicionar
                </Button>
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
      )}
    </Box>
  );
}
