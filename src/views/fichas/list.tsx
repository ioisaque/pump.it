import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Skeleton,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
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
import { diasFromPadrao, formatDescanso, formatPadraoLabel } from "domain/fichas/formatters";
import { Ficha } from "domain/fichas/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useStatusMutation } from "hooks/useStatusMutation";
import useTenantBase from "hooks/useTenantBase";
import { MouseEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "services/api";

const HIDE_ON_MOBILE = ["padrao", "descanso"] as const;

const DIA_COLORS: Record<string, string> = {
  A: "#FF5356",
  B: "#33CC66",
  C: "#0076F3",
  D: "#FFD22B",
};

function FichaAlunoCard({ ficha, onPlay }: { ficha: Ficha; onPlay: (ficha: Ficha) => void }) {
  const dias = diasFromPadrao(String(ficha.padrao));
  const itens = ficha.itens ?? [];
  const descanso = itens[0] ? formatDescanso(itens[0].descanso_segundos) : "—";
  const ativa = (ficha.status || FICHA_STATUS.ACTIVE) === FICHA_STATUS.ACTIVE;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box sx={{ display: "flex", minHeight: 148, alignItems: "center" }}>
        <Box sx={{ width: 8, flexShrink: 0, alignSelf: "stretch", bgcolor: ativa ? "secondary.main" : "action.disabled" }} />
        <CardContent sx={{ flex: 1, py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack spacing={2}>
            <Box minWidth={0}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.4}>
                #{String(ficha.id).padStart(5, "0")}
              </Typography>
              <Typography variant="h6" fontWeight={700} color="secondary.main" lineHeight={1.25} sx={{ mt: 0.25 }}>
                {ficha.nome}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {dias.map((dia) => (
                <Box
                  key={dia}
                  sx={{
                    minWidth: 36,
                    height: 36,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: DIA_COLORS[dia] ?? "secondary.main",
                    color: dia === "D" ? "#333" : "#fff",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {dia}
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Exercícios
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {itens.length}
                </Typography>
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Descanso
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {descanso}
                </Typography>
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Padrão
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatPadraoLabel(String(ficha.padrao))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
        <IconButton
          aria-label="Iniciar treino"
          onClick={() => onPlay(ficha)}
          sx={{
            width: 64,
            height: 64,
            mr: 2.5,
            bgcolor: "#33CC66",
            color: "#fff",
            flexShrink: 0,
            "&:hover": { bgcolor: "#2bb359" },
          }}
        >
          <Icon name="mdi:play" width={36} height={36} />
        </IconButton>
      </Box>
    </Card>
  );
}

export default function FichasList() {
  const navigate = useNavigate();
  const { base } = useTenantBase();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [escopo, setEscopo] = useState<"modelos" | "todas">("modelos");
  const [treinoFicha, setTreinoFicha] = useState<Ficha | null>(null);
  const treinoDialog = useMobileDialog("xs");
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);

  const { data = [], isLoading, error, isFetching, refetch } = useQuery({
    queryKey: [...fichasQueryKey, isCliente ? "aluno" : escopo],
    queryFn: () => listFichas(isCliente ? undefined : { escopo }),
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
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={escopo}
                      onChange={(_e, next) => {
                        if (next) setEscopo(next);
                      }}
                    >
                      <ToggleButton value="modelos">Modelos</ToggleButton>
                      <ToggleButton value="todas">Todas</ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                      onClick={() => navigate(`${base}/fichas/add`)}
                      variant="contained"
                      color="success"
                      sx={{ width: 140, height: 40 }}
                      startIcon={<Icon name="mdi:plus" />}
                    >
                      Adicionar
                    </Button>
                  </Box>
                )
              }
            />
          </Box>

          {isLoading ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {Array.from({ length: isCliente ? 3 : 10 }, (_, i) => (
                <Skeleton
                  key={`skeleton-${i}`}
                  variant="rounded"
                  width="100%"
                  height={isCliente ? 160 : 50}
                  sx={{ margin: "10px 0px" }}
                />
              ))}
            </Box>
          ) : isCliente ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {filtered.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  Nenhuma ficha vinculada.
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ pb: 1 }}>
                  {filtered.map((ficha) => (
                    <FichaAlunoCard key={ficha.id} ficha={ficha} onPlay={setTreinoFicha} />
                  ))}
                </Stack>
              )}
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

      <Dialog
        {...treinoDialog}
        open={Boolean(treinoFicha)}
        onClose={() => setTreinoFicha(null)}
      >
        <DialogTitle>Qual treino você vai fazer?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {treinoFicha?.nome}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {diasFromPadrao(String(treinoFicha?.padrao ?? "")).map((dia) => (
              <Button
                key={dia}
                variant="contained"
                onClick={() => {
                  if (!treinoFicha) return;
                  navigate(`${base}/fichas/${treinoFicha.id}/treino?dia=${dia}`);
                  setTreinoFicha(null);
                }}
                sx={{
                  minWidth: 72,
                  height: 56,
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  bgcolor: DIA_COLORS[dia] ?? "secondary.main",
                  color: dia === "D" ? "#333" : "#fff",
                  "&:hover": { bgcolor: DIA_COLORS[dia] ?? "secondary.main", filter: "brightness(0.92)" },
                }}
              >
                {dia}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTreinoFicha(null)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
