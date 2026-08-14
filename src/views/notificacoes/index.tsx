import { Alert, Avatar, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelNotificacao, clearAll, deleteNotificacao, listNotificacoes, resendNotificacaoById } from "api/notificacoes";
import GridTable, { GRID_COL_STATUS } from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import EventKillswitchCard from "components/notificacoes/EventKillswitchCard";
import NotificacaoCreateDialog from "components/notificacoes/modals/NotificacaoCreateDialog";
import { NotificacaoDetailDialog } from "components/notificacoes/modals/NotificacaoDetailDialog";
import PresetManagement from "components/notificacoes/PresetManagement";
import { notificacaoFotoUrl } from "domain/notificacoes/helpers";
import { MASTER_NIVEL_ID, NOTIFICACAO_STATUS_COLOR, NOTIFICACAO_STATUS_LABEL, Notificacao, NotificacaoStatus } from "domain/notificacoes/types";
import useAuth from "hooks/useAuth";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { themeColor } from "theme";

const pageColor: themeColor = "primary";
const HIDE_ON_MOBILE = ["audiencia", "agendado_enviado"] as const;

function NotificacoesPage() {
  const queryClient = useQueryClient();
  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);
  const confirmDialog = useMobileDialog("xs");
  const { user } = useAuth();
  const isMaster = (user?.nivel ?? 0) >= MASTER_NIVEL_ID;
  const academiaId = user?.academia_id && user.academia_id > 0 ? user.academia_id : undefined;
  const [addOpen, setAddOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const { niveis } = useFlagCatalogs(["niveis"]);

  const {
    data,
    isLoading: listLoading,
    isFetching,
    error: listError,
    refetch,
  } = useQuery({
    queryKey: ["notificacoes", academiaId],
    queryFn: () => listNotificacoes(academiaId),
    retry: 1,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelNotificacao(id, academiaId),
    onSuccess: async () => {
      toast.success("Notificação cancelada.");
      await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { statusCode?: number; message?: string } } };
      const payload = err.response?.data;
      if (payload?.message) {
        toast.error(payload.message);
      } else {
        toast.error("Não foi possível cancelar a notificação.");
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: number) => resendNotificacaoById(id, academiaId),
    onSuccess: async () => {
      toast.success("Notificação reenviada!");
      await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      await queryClient.invalidateQueries({ queryKey: ["notificacoes", "inbox"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { statusCode?: number; message?: string } } };
      const payload = err.response?.data;
      if (payload?.message) {
        toast.error(payload.message);
      } else {
        toast.error("Não foi possível reenviar a notificação.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNotificacao(id, academiaId),
    onSuccess: async (_data, id) => {
      toast.success("Notificação excluída.");
      setDeleteId(null);
      if (viewId === id) setViewId(null);
      await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      await queryClient.invalidateQueries({ queryKey: ["notificacoes", "inbox"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { statusCode?: number; message?: string } } };
      const payload = err.response?.data;
      if (payload?.message) {
        toast.error(payload.message);
      } else {
        toast.error("Não foi possível excluir a notificação.");
      }
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => clearAll(academiaId),
    onSuccess: async () => {
      toast.success("Histórico de notificações apagado.");
      setClearOpen(false);
      setViewId(null);
      await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      await queryClient.invalidateQueries({ queryKey: ["notificacoes", "inbox"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { statusCode?: number; message?: string } } };
      const payload = err.response?.data;
      if (payload?.message) {
        toast.error(payload.message);
      } else {
        toast.error("Não foi possível limpar o histórico.");
      }
    },
  });

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "status",
        headerName: "Status",
        ...GRID_COL_STATUS,
        renderCell: (params) => {
          const status = params.value as NotificacaoStatus;
          const label = NOTIFICACAO_STATUS_LABEL[status];
          const icon = status === 2 ? "mdi:check-circle" : status === 1 ? "mdi:clock-outline" : "mdi:close-circle";
          return (
            <Tooltip title={label} arrow>
              <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={icon} color={NOTIFICACAO_STATUS_COLOR[status]} width={22} height={22} />
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "message",
        headerName: "Mensagem",
        flex: 1,
        minWidth: 160,
        renderCell: (params) => {
          const row = params.row as Notificacao;
          const url = notificacaoFotoUrl(row.foto as string | null);
          return (
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Avatar src={url} variant="rounded" />
              <Box flex="1" minWidth={0}>
                <Typography variant="subtitle2" component="div">
                  {row.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  {row.mensagem}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        field: "actions",
        headerName: "Ações",
        width: 280,
        minWidth: 260,
        align: "right",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => {
          const row = params.row as Notificacao;
          const btnSx = { textTransform: "none" as const, fontWeight: 600, px: 1.25, whiteSpace: "nowrap" };

          return (
            <TableActions sx={{ justifyContent: "flex-end", gap: 0.75, alignItems: "center" }}>
              <Button
                size="small"
                color="info"
                variant="text"
                startIcon={<Icon name="mdi:replay" width={16} height={16} />}
                onClick={() => resendMutation.mutate(row.id)}
                sx={btnSx}
              >
                Reenviar
              </Button>
              {row.status === 1 ? (
                <Button
                  size="small"
                  color="warning"
                  variant="text"
                  startIcon={<Icon name="mdi:cancel" width={16} height={16} />}
                  onClick={() => cancelMutation.mutate(row.id)}
                  sx={btnSx}
                >
                  Cancelar
                </Button>
              ) : null}
              <Button
                size="small"
                color="error"
                variant="text"
                startIcon={<Icon name="mdi:delete-outline" width={16} height={16} />}
                onClick={() => setDeleteId(row.id)}
                sx={btnSx}
              >
                Excluir
              </Button>
            </TableActions>
          );
        },
      },
    ],
    [cancelMutation, resendMutation],
  );

  const loadError = Boolean(listError);
  const rows: Notificacao[] = !loadError && Array.isArray(data) ? data : [];

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column" }}>
      {loadError && (
        <Alert
          severity="error"
          sx={{ mb: 2, flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          }
        >
          Não foi possível carregar as notificações.
        </Alert>
      )}

      <Box
        sx={{
          flexShrink: 0,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 3fr) minmax(360px, 2fr)" },
          alignItems: "start",
          gap: 2,
        }}
      >
        <Card sx={{ height: 600, minHeight: 0, display: "flex", flexDirection: "column" }}>
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
                  <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                    <Icon name="notifications" color="primary.main" width={40} height={40} />
                    <Box minWidth={0}>
                      <Typography variant="subtitle1" color="primary.main" fontWeight={700} lineHeight={1.2}>
                        Notificações
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Mensagens agendadas e enviadas
                      </Typography>
                    </Box>
                  </Stack>
                }
                right={
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button
                      onClick={() => setClearOpen(true)}
                      variant="contained"
                      color="error"
                      disabled={rows.length === 0}
                      sx={{ height: 40, minWidth: { xs: 40, sm: 160 }, px: { xs: 1, sm: 1.5 } }}
                      startIcon={<Icon name="mdi:delete-sweep-outline" />}
                    >
                      Limpar histórico
                    </Button>
                    <Button
                      onClick={() => setAddOpen(true)}
                      variant="contained"
                      color="success"
                      sx={{ width: 140, height: 40 }}
                      startIcon={<Icon name="mdi:plus" />}
                    >
                      Adicionar
                    </Button>
                  </Box>
                }
              />
            </Box>

            {listLoading ? (
              <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton
                    key={`notificacao-skeleton-${i}`}
                    variant="rounded"
                    width="100%"
                    height={50}
                    sx={{ margin: "10px 0px" }}
                  />
                ))}
              </Box>
            ) : (
              <GridTable
                autoHeightFill
                color={pageColor}
                columns={columns}
                loading={isFetching}
                rows={rows}
                columnVisibilityModel={columnVisibilityModel}
                getRowHeight={() => "auto"}
                stripeInactiveRows={false}
                onRowClick={(params, event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest(".tableActions, a, button, [role='button']")) return;
                  setViewId(params.row.id);
                }}
                sx={{
                  color: `${pageColor}.main`,
                  "& .MuiDataGrid-cell": { py: 1, alignItems: "flex-start" },
                }}
              />
            )}
          </CardContent>
        </Card>

        <EventKillswitchCard isMaster={isMaster} />
      </Box>

      <PresetManagement isMaster={isMaster} academiaId={academiaId} />

      <NotificacaoDetailDialog
        notificacaoId={viewId}
        open={viewId != null}
        onClose={() => setViewId(null)}
        niveis={niveis}
        academiaId={academiaId}
      />

      <Dialog open={clearOpen} onClose={() => setClearOpen(false)} {...confirmDialog}>
        <DialogTitle>Limpar histórico</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Isso apaga todas as notificações do banco de dados, incluindo as entradas da caixa de entrada dos
            usuários e as imagens enviadas. Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setClearOpen(false)} variant="contained" color="quinzel" sx={{ width: 120 }}>
            Cancelar
          </Button>
          <Button
            onClick={() => clearAllMutation.mutate()}
            variant="contained"
            color="error"
            disabled={clearAllMutation.isLoading}
            sx={{ width: 120 }}
          >
            Apagar tudo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteId != null} onClose={() => setDeleteId(null)} {...confirmDialog}>
        <DialogTitle>Excluir notificação</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Excluir a notificação #{deleteId}? A imagem associada também será removida do servidor.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteId(null)} variant="contained" color="quinzel" sx={{ width: 120 }}>
            Cancelar
          </Button>
          <Button
            onClick={() => deleteId != null && deleteMutation.mutate(deleteId)}
            variant="contained"
            color="error"
            disabled={deleteMutation.isLoading}
            sx={{ width: 120 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <NotificacaoCreateDialog open={addOpen} onClose={() => setAddOpen(false)} academiaId={academiaId} />
    </Box>
  );
}

export default NotificacoesPage;
