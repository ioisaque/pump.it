import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPreset, deletePreset, listPresets, savePreset } from "api/notificacoes";
import Chip from "components/Chip";
import GridTable from "components/data-table/GridTable";
import TableActions from "components/data-table/TableActions";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import {
    NOTIFICACAO_PRESET_STATUS,
    NOTIFICACAO_PRESET_TYPE,
    NotificacaoPreset,
    NotificacaoPresetType,
} from "domain/notificacoes/types";
import { useMobileDialog } from "hooks/useMobileDialog";
import { Fragment, useMemo, useState } from "react";
import toast from "react-hot-toast";

const PRESET_TYPE_LABEL: Record<string, string> = {
  [NOTIFICACAO_PRESET_TYPE.pessoa_foto_updated]: "Foto de perfil atualizada",
  [NOTIFICACAO_PRESET_TYPE.novo_login]: "Novo login",
  [NOTIFICACAO_PRESET_TYPE.senha_redefinida]: "Senha redefinida",
};

const PRESET_TYPE_DESCRIPTION: Record<string, string> = {
  [NOTIFICACAO_PRESET_TYPE.pessoa_foto_updated]: "texto aleatório ao atualizar foto",
  [NOTIFICACAO_PRESET_TYPE.novo_login]: "texto aleatório ao detectar novo login",
  [NOTIFICACAO_PRESET_TYPE.senha_redefinida]: "texto aleatório ao redefinir senha",
};

const PRESET_TYPE_VARS: Record<string, string[]> = {};

interface PresetManagementProps {
  isMaster: boolean;
  academiaId?: number;
}

export default function PresetManagement({ isMaster, academiaId }: PresetManagementProps) {
  const queryClient = useQueryClient();
  const formDialog = useMobileDialog("sm");
  const confirmDialog = useMobileDialog("xs");
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [presetEdit, setPresetEdit] = useState<NotificacaoPreset | null>(null);
  const [presetMensagem, setPresetMensagem] = useState("");
  const [presetTitulo, setPresetTitulo] = useState("");
  const [presetDeleteId, setPresetDeleteId] = useState<number | null>(null);

  const [presetType, setPresetType] = useState<NotificacaoPresetType>(
    NOTIFICACAO_PRESET_TYPE.pessoa_foto_updated,
  );

  const {
    data: presetsData,
    isLoading: presetsLoading,
    isFetching: presetsFetching,
    error: presetsError,
    refetch: refetchPresets,
  } = useQuery({
    queryKey: ["notificacao-presets", presetType, academiaId],
    queryFn: () => listPresets(presetType, academiaId),
    enabled: isMaster,
    retry: 1,
  });

  const createPresetMutation = useMutation({
    mutationFn: (body: { type: string; mensagem: string; titulo?: string | null; status?: number }) =>
      addPreset(body, academiaId),
    onSuccess: async () => {
      toast.success("Variação criada.");
      setPresetDialogOpen(false);
      setPresetEdit(null);
      await queryClient.invalidateQueries({ queryKey: ["notificacao-presets"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Não foi possível criar a mensagem.");
    },
  });

  const savePresetMutation = useMutation({
    mutationFn: (payload: { id: number; mensagem?: string; titulo?: string | null }) =>
      savePreset(payload.id, payload, academiaId),
    onSuccess: async () => {
      toast.success("Variação atualizada.");
      setPresetDialogOpen(false);
      setPresetEdit(null);
      await queryClient.invalidateQueries({ queryKey: ["notificacao-presets"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Não foi possível salvar a mensagem.");
    },
  });

  const deletePresetMutation = useMutation({
    mutationFn: (id: number) => deletePreset(id, academiaId),
    onSuccess: async () => {
      toast.success("Variação excluída.");
      setPresetDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: ["notificacao-presets"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Não foi possível excluir a mensagem.");
    },
  });

  function closePresetDialog() {
    setPresetDialogOpen(false);
    setPresetEdit(null);
  }

  function openPresetDialog(preset?: NotificacaoPreset) {
    if (preset) {
      setPresetEdit(preset);
      setPresetMensagem(preset.mensagem);
      setPresetTitulo(preset.titulo ?? "");
    } else {
      setPresetEdit(null);
      setPresetMensagem("");
      setPresetTitulo("");
    }
    setPresetDialogOpen(true);
  }

  async function submitPreset() {
    const mensagem = presetMensagem.trim();
    if (!mensagem) {
      toast.error("Informe a mensagem.");
      return;
    }
    const titulo = presetTitulo.trim() || null;

    if (presetEdit) {
      await savePresetMutation.mutateAsync({
        id: presetEdit.id,
        mensagem,
        titulo,
      });
      return;
    }

    await createPresetMutation.mutateAsync({
      type: presetType,
      mensagem,
      titulo,
      status: NOTIFICACAO_PRESET_STATUS.active,
    });
  }

  if (!isMaster) {
    return null;
  }

  const presetRows: NotificacaoPreset[] = !presetsError && Array.isArray(presetsData) ? presetsData : [];
  const saving = createPresetMutation.isLoading || savePresetMutation.isLoading;

  const presetColumns = useMemo<GridColDef[]>(
    () => [
      {
        field: "titulo",
        headerName: "Título",
        width: 160,
        valueFormatter: (value) => (value ? String(value) : "—"),
      },
      {
        field: "mensagem",
        headerName: "Mensagem",
        flex: 1,
        minWidth: 240,
      },
      {
        field: "actions",
        headerName: "Ações",
        width: 130,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => {
          const row = params.row as NotificacaoPreset;
          return (
            <TableActions>
              <Button
                size="small"
                color="error"
                variant="text"
                startIcon={<Icon name="mdi:delete-outline" width={18} height={18} />}
                onClick={() => setPresetDeleteId(row.id)}
                sx={{ textTransform: "none", fontWeight: 600, px: 1 }}
              >
                Excluir
              </Button>
            </TableActions>
          );
        },
      },
    ],
    [],
  );

  return (
    <Fragment>
      <Box sx={{ flexShrink: 0, mt: 4 }}>
        <EntityHeader
          left={
            <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
              <Icon name="auto_awesome" color="secondary.main" />
              <Box minWidth={0}>
                <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                  Mensagens automáticas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {PRESET_TYPE_LABEL[presetType] ?? presetType} — {PRESET_TYPE_DESCRIPTION[presetType] ?? "texto aleatório"}
                </Typography>
              </Box>
            </Stack>
          }
          right={
            <Button
              onClick={() => openPresetDialog()}
              variant="contained"
              color="success"
              sx={{ height: 40, px: 2 }}
              startIcon={<Icon name="mdi:plus" />}
            >
              Adicionar variação
            </Button>
          }
        />

        <Tabs
          value={presetType}
          onChange={(_, value: NotificacaoPresetType) => setPresetType(value)}
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ mt: 1, minHeight: 40, "& .MuiTab-root": { minHeight: 40 } }}
        >
          {Object.values(NOTIFICACAO_PRESET_TYPE).map((type) => (
            <Tab key={type} value={type} label={PRESET_TYPE_LABEL[type] ?? type} />
          ))}
        </Tabs>

        {presetsError ? (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => refetchPresets()}>
                Tentar de novo
              </Button>
            }
          >
            Não foi possível carregar as mensagens automáticas.
          </Alert>
        ) : presetsLoading ? (
          <Box sx={{ mt: 2 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={`preset-skeleton-${i}`} variant="rounded" width="100%" height={50} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : presetRows.length === 0 ? (
          <Box
            sx={{
              mt: 2,
              py: 4,
              px: 2,
              textAlign: "center",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Nenhuma variação ainda. No envio, uma das mensagens é escolhida aleatoriamente.
            </Typography>
            <Button
              onClick={() => openPresetDialog()}
              variant="contained"
              color="success"
              startIcon={<Icon name="mdi:plus" />}
            >
              Adicionar variação
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <GridTable
              color="secondary"
              columns={presetColumns}
              loading={presetsFetching}
              rows={presetRows}
              getRowHeight={() => "auto"}
              onRowClick={(params, event) => {
                const target = event.target as HTMLElement;
                if (target.closest(".tableActions, a, button")) return;
                openPresetDialog(params.row as NotificacaoPreset);
              }}
              sx={{
                color: "secondary.main",
                "& .MuiDataGrid-row": { cursor: "pointer" },
                "& .MuiDataGrid-cell": { py: 1, alignItems: "flex-start" },
              }}
            />
          </Box>
        )}
      </Box>

      <Dialog open={presetDialogOpen} onClose={closePresetDialog} {...formDialog}>
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 2 }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
          >
            <Box sx={{ minWidth: 0, flex: "1 1 180px" }}>
              <Typography variant="h6" fontWeight={700} lineHeight={1.35}>
                {presetEdit ? "Editar variação" : "Nova variação"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {PRESET_TYPE_DESCRIPTION[presetType] ?? "Mensagem usada no envio automático"}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0, ml: "auto" }}>
              <Chip
                icon="mdi:tag-outline"
                color="info.main"
                text={PRESET_TYPE_LABEL[presetType] ?? presetType}
              />
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Título (opcional)"
              fullWidth
              size="small"
              value={presetTitulo}
              onChange={(e) => setPresetTitulo(e.target.value)}
              placeholder="Ex.: Revisar plano"
              InputLabelProps={{ shrink: true }}
              sx={compactInputRootSx()}
            />

            <TextField
              label="Mensagem"
              fullWidth
              required
              multiline
              minRows={4}
              value={presetMensagem}
              onChange={(e) => setPresetMensagem(e.target.value)}
              placeholder="Texto enviado na notificação automática"
              InputLabelProps={{ shrink: true }}
            />

            {PRESET_TYPE_VARS[presetType]?.length ? (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                  Variáveis disponíveis
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
                  {PRESET_TYPE_VARS[presetType].map((v) => (
                    <Chip key={v} color="secondary.main" text={`[${v}]`} fontSize="78%" />
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={closePresetDialog}
            variant="contained"
            color="quinzel"
            startIcon={<Icon name="mdi:close" />}
            sx={{ minWidth: 120, height: 40 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => void submitPreset()}
            variant="contained"
            color="info"
            disabled={saving}
            startIcon={<Icon name="mdi:content-save-outline" />}
            sx={{ minWidth: 120, height: 40 }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={presetDeleteId != null} onClose={() => setPresetDeleteId(null)} {...confirmDialog}>
        <DialogTitle>Excluir variação</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Excluir a mensagem #{presetDeleteId}? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPresetDeleteId(null)} variant="contained" color="quinzel" sx={{ width: 120 }}>
            Cancelar
          </Button>
          <Button
            onClick={() => presetDeleteId != null && deletePresetMutation.mutate(presetDeleteId)}
            variant="contained"
            color="error"
            disabled={deletePresetMutation.isLoading}
            startIcon={<Icon name="mdi:delete-outline" />}
            sx={{ minWidth: 120 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
