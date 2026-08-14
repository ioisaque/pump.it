import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAmbienteTheme, IntegracaoAmbiente } from "domain/integracoes/constants";
import { AsaasConfigPublic, IntegracaoContaFinanceiraResult, IntegracaoContaSummary } from "domain/integracoes/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "services/api";

const STEPS = [
  { key: "welcome", label: "Início" },
  { key: "credentials", label: "Conexão" },
  { key: "toggles", label: "Sync" },
  { key: "webhook", label: "Webhook" },
  { key: "done", label: "Pronto" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];
type ConnectionState = "idle" | "testing" | "success" | "error";

function extractErrorMessage(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join("; ");
  if (typeof msg === "string" && msg.trim()) return msg;
  return "Não foi possível conectar. Verifique a API Key e o ambiente.";
}

type UseAsaasSetupWizardParams = {
  open: boolean;
  onClose: () => void;
  initial: AsaasConfigPublic;
};

export default function useAsaasSetupWizard({ open, onClose, initial }: UseAsaasSetupWizardParams) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<StepKey>("welcome");
  const [ambiente, setAmbiente] = useState<IntegracaoAmbiente>(initial.ambiente);
  const [apiKey, setApiKey] = useState("");
  const [syncPessoas, setSyncPessoas] = useState(initial.syncPessoas);
  const [syncFaturas, setSyncFaturas] = useState(initial.syncFaturas);
  const [webhookHabilitado, setWebhookHabilitado] = useState(initial.webhook.habilitado);
  const [connection, setConnection] = useState<ConnectionState>("idle");
  const [connectionDetail, setConnectionDetail] = useState<string | null>(null);
  const [syncedConta, setSyncedConta] = useState<IntegracaoContaSummary | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);

  const theme = getAmbienteTheme("asaas", ambiente);
  const sandboxTheme = getAmbienteTheme("asaas", "sandbox");
  const producaoTheme = getAmbienteTheme("asaas", "producao");
  const isLocal = initial.runtime.isLocalDev;
  const visibleSteps = isLocal ? STEPS.filter((s) => s.key !== "webhook") : STEPS;
  const stepIndex = visibleSteps.findIndex((s) => s.key === step);

  useEffect(() => {
    if (!open) return;
    setStep("welcome");
    setAmbiente(initial.ambiente);
    setApiKey("");
    setSyncPessoas(initial.syncPessoas);
    setSyncFaturas(initial.syncFaturas);
    setWebhookHabilitado(initial.webhook.habilitado);
    setConnection("idle");
    setConnectionDetail(null);
    setSyncedConta(null);
    setShowApiKey(false);
    setRevealedApiKey(null);
  }, [open, initial]);

  useEffect(() => {
    if (step === "credentials") {
      setConnection("idle");
      setConnectionDetail(null);
    }
  }, [ambiente, apiKey, step]);

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.patch<AsaasConfigPublic>("sistema/integracoes/asaas", body).then((r) => r.data),
    onSuccess: (saved) => {
      queryClient.setQueryData(["integracoes", "asaas", "config"], saved);
      void queryClient.invalidateQueries({ queryKey: ["integracoes"] });
    },
  });

  const revealMutation = useMutation({
    mutationFn: () => api.get<{ apiKey: string }>("sistema/integracoes/asaas/api-key").then((r) => r.data),
    onSuccess: (res) => {
      setRevealedApiKey(res.apiKey);
      setShowApiKey(true);
    },
    onError: () => toast.error("Não foi possível carregar a API Key."),
  });

  const testMutation = useMutation({
    mutationFn: () =>
      api.post<{
        ok: boolean;
        account?: Record<string, unknown>;
        contaFinanceira?: IntegracaoContaFinanceiraResult | null;
      }>("sistema/integracoes/asaas/test", {
        apiKey: apiKey || undefined,
        ambiente,
      }).then((res) => res.data),
    onMutate: () => {
      setConnection("testing");
      setConnectionDetail(null);
      setSyncedConta(null);
    },
    onSuccess: (data) => {
      setConnection("success");
      const balance = data.account?.balance;
      const conta = data.contaFinanceira;
      if (conta) {
        setSyncedConta({ sincronizada: true, id: conta.id, nome: conta.nome });
      }
      const contaMsg = conta
        ? conta.criada
          ? `Conta financeira "${conta.nome}" criada no sistema.`
          : conta.atualizada
            ? `Conta financeira "${conta.nome}" atualizada no sistema.`
            : `Conta financeira "${conta.nome}" vinculada.`
        : null;
      setConnectionDetail(
        balance != null
          ? `Conta verificada — saldo disponível: R$ ${Number(balance).toFixed(2)}${contaMsg ? ` ${contaMsg}` : ""}`
          : contaMsg ?? "API Key válida — pronto para sincronizar.",
      );
    },
    onError: (err) => {
      setConnection("error");
      setConnectionDetail(extractErrorMessage(err));
    },
  });

  const webhookMutation = useMutation({
    mutationFn: () => import("api/integracoes").then((m) => m.setupAsaasWebhook()),
  });

  async function finish() {
    try {
      await saveMutation.mutateAsync({
        ambiente,
        apiKey: apiKey || undefined,
        syncPessoas,
        syncFaturas,
        webhook: { habilitado: webhookHabilitado },
        setupConcluido: true,
      });
      toast.success("Asaas conectado com sucesso.");
      onClose();
    } catch {
      toast.error("Falha ao salvar configuração.");
    }
  }

  function next() {
    if (step === "welcome") setStep("credentials");
    else if (step === "credentials") setStep("toggles");
    else if (step === "toggles") setStep(isLocal ? "done" : "webhook");
    else if (step === "webhook") void finish();
    else onClose();
  }

  const credentialsReady =
    connection === "success" || (initial.apiKeyPreenchida && !apiKey) || Boolean(apiKey.trim());

  return {
    step,
    setStep,
    ambiente,
    setAmbiente,
    apiKey,
    setApiKey,
    syncPessoas,
    setSyncPessoas,
    syncFaturas,
    setSyncFaturas,
    webhookHabilitado,
    setWebhookHabilitado,
    connection,
    connectionDetail,
    syncedConta,
    showApiKey,
    setShowApiKey,
    revealedApiKey,
    setRevealedApiKey,
    theme,
    sandboxTheme,
    producaoTheme,
    isLocal,
    visibleSteps,
    stepIndex,
    initial,
    saveMutation,
    revealMutation,
    testMutation,
    webhookMutation,
    finish,
    next,
    credentialsReady,
  };
}
