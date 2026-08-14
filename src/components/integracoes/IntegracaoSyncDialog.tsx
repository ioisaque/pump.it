import { Alert, Box, Button, Checkbox, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, LinearProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import Chip from "components/Chip";
import Icon from "components/Icon";
import IntegracaoContaSyncPanel from "components/integracoes/IntegracaoContaSyncPanel";
import { ReconcileJob, SyncAuditResult } from "domain/integracoes/types";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "services/api";

type IntegracaoSyncDialogProps = {
  open: boolean;
  onClose: () => void;
  provider: string;
  providerNome: string;
  ambiente: string;
};

type EntidadeKey = "pessoa" | "fatura" | "contrato";

const ENTIDADE_LABELS: Record<EntidadeKey, string> = {
  pessoa: "Pessoas",
  fatura: "Faturas",
  contrato: "Contratos",
};

function entidadeIcon(done: number, total: number, running: boolean) {
  if (running) return "sync";
  if (total === 0 || done >= total) return "check_circle";
  return "warning";
}

function EntidadeProgress({
  label,
  audit,
  job,
  entidade,
  providerNome,
}: {
  label: string;
  audit: SyncAuditResult[EntidadeKey & keyof SyncAuditResult] | undefined;
  job: ReconcileJob | null;
  entidade: EntidadeKey;
  providerNome: string;
}) {
  if (!audit || typeof audit !== "object" || !("total" in audit)) return null;

  const row = audit as SyncAuditResult["pessoas"];
  const jobRow = job?.porEntidade[entidade];
  const total = row.total;
  const reconciling = Boolean(jobRow && jobRow.total > 0 && (job?.status === "running" || job?.status === "done"));
  const done = reconciling ? (jobRow?.done ?? 0) : row.sincronizados;
  const progressTotal = reconciling ? (jobRow?.total ?? total) : total;
  const progress = progressTotal > 0 ? Math.min(100, (done / progressTotal) * 100) : 100;
  const running = job?.entidadeAtual === entidade && job.status === "running";
  const iconName = entidadeIcon(done, progressTotal, running);

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Icon
            name={iconName}
            color={iconName === "check_circle" ? "success.main" : iconName === "warning" ? "warning.main" : "primary.main"}
            width={20}
            height={20}
            sx={running ? { animation: "spin 1s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } } : undefined}
          />
          <Typography variant="subtitle2">{label}</Typography>
        </Stack>
        <Chip
          icon={row.pendentes > 0 && !reconciling ? "mdi:cloud-off-outline" : "mdi:cloud-check-outline"}
          color={row.pendentes > 0 && !reconciling ? "warning.main" : "success.main"}
          nome={reconciling ? `${done}/${progressTotal}` : `${row.sincronizados}/${row.total}`}
        />
      </Stack>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
      {row.pendentes > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {row.pendentes} pendente(s)
          {row.idsPendentes.length > 0 ? ` — ex.: ${row.idsPendentes.slice(0, 5).join(", ")}` : ""}
        </Typography>
      )}
      {row.fantasmas > 0 && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: "block" }}>
          {row.fantasmas} no {providerNome} sem registro ativo no sistema (serão removidos ao atualizar)
        </Typography>
      )}
      {jobRow && jobRow.erros.length > 0 && (
        <Collapse in>
          {jobRow.erros.map((e) => (
            <Typography key={`${entidade}-${e.id}`} variant="caption" color="error.main" display="block">
              #{e.id}: {e.message}
            </Typography>
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export default function IntegracaoSyncDialog({
  open,
  onClose,
  provider,
  providerNome,
  ambiente,
}: IntegracaoSyncDialogProps) {
  const mobileDialog = useMobileDialog("sm");
  const strictConfirmDialog = useMobileDialog("xs");
  const [jobId, setJobId] = useState<string | null>(null);
  const [strictMode, setStrictMode] = useState(false);
  const [strictConfirmOpen, setStrictConfirmOpen] = useState(false);
  const isSandbox = ambiente === "sandbox";
  const strictAvailable = provider === "asaas" && isSandbox;

  useEffect(() => {
    if (!open) {
      setStrictConfirmOpen(false);
      setStrictMode(false);
    }
  }, [open]);

  const auditQuery = useQuery({
    queryKey: ["integracoes", provider, "audit"],
    queryFn: () => import("api/integracoes").then((m) => m.getProviderSyncAudit(provider)),
    enabled: open,
  });

  const configQuery = useQuery({
    queryKey: ["integracoes", provider, "config"],
    queryFn: () =>
      import("api/integracoes").then((m) => m.getProvider(provider)),
    enabled: open,
  });

  const jobQuery = useQuery({
    queryKey: ["integracoes", provider, "job", jobId],
    queryFn: () => import("api/integracoes").then((m) => m.getProviderSyncJob(provider, jobId!)),
    enabled: Boolean(jobId),
    refetchInterval: (data) => {
      const status = data?.status;
      return status === "running" || status === "pending" ? 1000 : false;
    },
  });

  useEffect(() => {
    if (jobQuery.data?.status === "done" || jobQuery.data?.status === "error") {
      void auditQuery.refetch();
      void configQuery.refetch();
    }
  }, [jobQuery.data?.status]);

  const reconcileMutation = useMutation({
    mutationFn: () =>
      api
        .post<{ jobId: string }>(`sistema/integracoes/${provider}/sync/reconcile`, { strict: strictMode })
        .then((r) => r.data),
    onSuccess: (data) => {
      setJobId(data.jobId);
      toast.success("Sincronização iniciada.");
    },
    onError: () => toast.error("Falha ao iniciar sincronização."),
  });

  const audit = auditQuery.data;
  const job = jobQuery.data ?? null;
  const totalPendentes = audit
    ? audit.pessoas.pendentes + audit.faturas.pendentes + audit.contratos.pendentes
    : 0;
  const totalFantasmas = audit
    ? audit.pessoas.fantasmas + audit.faturas.fantasmas + audit.contratos.fantasmas
    : 0;
  const totalAtivos = audit
    ? audit.pessoas.total + audit.faturas.total + audit.contratos.total
    : 0;
  const jobProgress = job && job.total > 0 ? (job.done / job.total) * 100 : 0;
  const syncing = job?.status === "running" || reconcileMutation.isLoading;
  const canSync = totalAtivos > 0 || totalFantasmas > 0 || strictMode;
  const pruning = job?.entidadeAtual === "prune" && job.status === "running";
  const syncingConta = job?.entidadeAtual === "conta" && job.status === "running";
  const contaFinanceira = configQuery.data?.contaFinanceira;

  const startSync = () => reconcileMutation.mutate();

  const handleSyncClick = () => {
    if (strictMode) {
      setStrictConfirmOpen(true);
      return;
    }
    startSync();
  };

  const handleStrictConfirm = () => {
    setStrictConfirmOpen(false);
    startSync();
  };

  return (
    <Dialog open={open} onClose={onClose} {...mobileDialog}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pr: 1 }}>
        <span>Sincronização — {providerNome}</span>
        <IconButton aria-label="Fechar" onClick={onClose} size="small" edge="end">
          <Icon name="close" width={22} height={22} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#f4f1e6" }}>
        {auditQuery.isLoading ? (
          <LinearProgress />
        ) : audit ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Atualiza no {providerNome} todos os registros ativos do sistema e remove cobranças/clientes cancelados ou deletados aqui.
              {totalPendentes > 0 ? ` ${totalPendentes} ativo(s) ainda sem vínculo.` : ""}
              {totalFantasmas > 0 ? ` ${totalFantasmas} vínculo(s) obsoleto(s) no ${providerNome}.` : ""}
            </Typography>
            <IntegracaoContaSyncPanel providerNome={providerNome} contaFinanceira={contaFinanceira} />
            {syncingConta && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Icon
                    name="sync"
                    width={20}
                    height={20}
                    sx={{ animation: "spin 1s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } }}
                  />
                  <Typography variant="body2">Verificando conta financeira no {providerNome}…</Typography>
                </Stack>
              </Alert>
            )}
            {strictAvailable && (
              <Alert
                severity="error"
                variant={strictMode ? "filled" : "outlined"}
                icon={<Icon name="mdi:alert-octagon-outline" width={22} height={22} />}
                sx={{
                  mb: 2,
                  borderWidth: 2,
                  borderStyle: "solid",
                  ...(strictMode
                    ? { bgcolor: "error.dark", color: "error.contrastText", "& .MuiAlert-icon": { color: "error.contrastText" } }
                    : { borderColor: "error.main", bgcolor: "rgba(249, 20, 42, 0.08)" }),
                }}
              >
                <FormControlLabel
                  sx={{ m: 0, alignItems: "flex-start", width: "100%" }}
                  control={
                    <Checkbox
                      checked={strictMode}
                      onChange={(e) => setStrictMode(e.target.checked)}
                      disabled={syncing}
                      color="error"
                      sx={{ mt: -0.5, color: strictMode ? "error.contrastText" : "error.main" }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color={strictMode ? "error.contrastText" : "error.dark"}>
                        Sync estrito (sandbox)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: strictMode ? "error.contrastText" : "error.dark", opacity: strictMode ? 0.95 : 0.85 }}
                      >
                        Remove do {providerNome} clientes, cobranças e contratos que não existem no sistema.
                      </Typography>
                      {strictMode && (
                        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "error.contrastText", fontWeight: 600 }}>
                          Ação destrutiva — será solicitada confirmação antes de executar.
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Alert>
            )}
            {pruning && (
              <Alert severity="error" variant="outlined" sx={{ mb: 2, borderWidth: 2, borderColor: "error.main" }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Icon
                    name="sync"
                    color="error.main"
                    width={20}
                    height={20}
                    sx={{ animation: "spin 1s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } }}
                  />
                  <Typography variant="body2" fontWeight={600} color="error.dark">
                    Limpando registros obsoletos no {providerNome}…
                  </Typography>
                </Stack>
                <LinearProgress color="error" sx={{ height: 8, borderRadius: 1, mt: 1 }} />
              </Alert>
            )}
            {syncing && !pruning && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Progresso geral
                </Typography>
                <LinearProgress variant="determinate" value={jobProgress} sx={{ height: 10, borderRadius: 1, mt: 0.5 }} />
              </Box>
            )}
            {job?.prune && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: "background.paper", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Limpeza no {providerNome}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Removidos: {job.prune.removidos.pessoa} pessoa(s), {job.prune.removidos.fatura} fatura(s),{" "}
                  {job.prune.removidos.contrato} contrato(s)
                </Typography>
                {job.prune.erros.length > 0 &&
                  job.prune.erros.map((e) => (
                    <Typography key={`${e.entidade}-${e.ref}`} variant="caption" color="error.main" display="block">
                      {e.entidade} {e.ref}: {e.message}
                    </Typography>
                  ))}
              </Box>
            )}
            <EntidadeProgress label={ENTIDADE_LABELS.pessoa} audit={audit.pessoas} job={job} entidade="pessoa" providerNome={providerNome} />
            <EntidadeProgress label={ENTIDADE_LABELS.contrato} audit={audit.contratos} job={job} entidade="contrato" providerNome={providerNome} />
            <EntidadeProgress label={ENTIDADE_LABELS.fatura} audit={audit.faturas} job={job} entidade="fatura" providerNome={providerNome} />
          </>
        ) : (
          <Typography color="text.secondary">Não foi possível carregar a auditoria.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => void auditQuery.refetch()} disabled={auditQuery.isFetching || syncing}>
          Recarregar status
        </Button>
        <Button
          variant="contained"
          color={strictMode ? "error" : "primary"}
          disabled={syncing || !canSync}
          onClick={handleSyncClick}
        >
          {strictMode && totalAtivos === 0 ? `Limpar órfãos no ${providerNome}` : `Sincronizar com ${providerNome}`}
        </Button>
      </DialogActions>

      <Dialog
        open={strictConfirmOpen}
        onClose={() => setStrictConfirmOpen(false)}
        {...strictConfirmDialog}
        PaperProps={{ sx: { border: 2, borderColor: "error.main" } }}
      >
        <DialogTitle sx={{ bgcolor: "error.main", color: "error.contrastText", display: "flex", alignItems: "center", gap: 1 }}>
          <Icon name="mdi:alert-octagon" width={24} height={24} color="error.contrastText" />
          Confirmar sync estrito
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText component="div">
            <Typography variant="body1" fontWeight={600} color="error.dark" gutterBottom>
              Esta ação é irreversível.
            </Typography>
            <Typography variant="body2" color="text.primary" paragraph>
              O sync estrito vai <strong>excluir permanentemente</strong> do {providerNome} (sandbox) todos os clientes, cobranças e
              contratos que não existem no sistema.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Confirma que deseja continuar?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStrictConfirmOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleStrictConfirm}>
            Sim, excluir órfãos
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
