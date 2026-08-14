import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "services/api";
import { getAmbienteTheme, IntegracaoAmbiente } from "domain/integracoes/constants";
import { IntegracaoContaFinanceiraResult, IntegracaoContaSummary, MercadoPagoConfigPublic } from "domain/integracoes/types";

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
  return "Não foi possível conectar. Verifique o Access Token, a Public Key e o ambiente.";
}

type UseMercadoPagoSetupWizardParams = {
  open: boolean;
  onClose: () => void;
  initial: MercadoPagoConfigPublic;
};

export default function useMercadoPagoSetupWizard({ open, onClose, initial }: UseMercadoPagoSetupWizardParams) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<StepKey>("welcome");
  const [ambiente, setAmbiente] = useState<IntegracaoAmbiente>(initial.ambiente);
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [syncPessoas, setSyncPessoas] = useState(initial.syncPessoas);
  const [syncFaturas, setSyncFaturas] = useState(initial.syncFaturas);
  const [webhookHabilitado, setWebhookHabilitado] = useState(initial.webhook.habilitado);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [connection, setConnection] = useState<ConnectionState>("idle");
  const [connectionDetail, setConnectionDetail] = useState<string | null>(null);
  const [syncedConta, setSyncedConta] = useState<IntegracaoContaSummary | null>(null);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [revealedAccessToken, setRevealedAccessToken] = useState<string | null>(null);
  const [revealedPublicKey, setRevealedPublicKey] = useState<string | null>(null);

  const theme = getAmbienteTheme("mercadopago", ambiente);
  const sandboxTheme = getAmbienteTheme("mercadopago", "sandbox");
  const producaoTheme = getAmbienteTheme("mercadopago", "producao");
  const isLocal = initial.runtime.isLocalDev;
  const visibleSteps = isLocal ? STEPS.filter((s) => s.key !== "webhook") : STEPS;
  const stepIndex = visibleSteps.findIndex((s) => s.key === step);
  const credentialsSaved = initial.accessTokenPreenchido && initial.publicKeyPreenchida;

  useEffect(() => {
    if (!open) return;
    setStep("welcome");
    setAmbiente(initial.ambiente);
    setAccessToken("");
    setPublicKey("");
    setSyncPessoas(initial.syncPessoas);
    setSyncFaturas(initial.syncFaturas);
    setWebhookHabilitado(initial.webhook.habilitado);
    setWebhookSecret("");
    setConnection("idle");
    setConnectionDetail(null);
    setSyncedConta(null);
    setShowAccessToken(false);
    setShowPublicKey(false);
    setRevealedAccessToken(null);
    setRevealedPublicKey(null);
  }, [open, initial]);

  useEffect(() => {
    if (step === "credentials") {
      setConnection("idle");
      setConnectionDetail(null);
    }
  }, [ambiente, accessToken, publicKey, step]);

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.patch<MercadoPagoConfigPublic>("sistema/integracoes/mercadopago", body).then((r) => r.data),
    onSuccess: (saved) => {
      queryClient.setQueryData(["integracoes", "mercadopago", "config"], saved);
      void queryClient.invalidateQueries({ queryKey: ["integracoes"] });
    },
  });

  const revealAccessTokenMutation = useMutation({
    mutationFn: () => api.get<{ accessToken: string }>("sistema/integracoes/mercadopago/access-token").then((r) => r.data),
    onSuccess: (res) => {
      setRevealedAccessToken(res.accessToken);
      setShowAccessToken(true);
    },
    onError: () => toast.error("Não foi possível carregar o Access Token."),
  });

  const revealPublicKeyMutation = useMutation({
    mutationFn: () => api.get<{ publicKey: string }>("sistema/integracoes/mercadopago/public-key").then((r) => r.data),
    onSuccess: (res) => {
      setRevealedPublicKey(res.publicKey);
      setShowPublicKey(true);
    },
    onError: () => toast.error("Não foi possível carregar a Public Key."),
  });

  const testMutation = useMutation({
    mutationFn: () =>
      api.post<{
        ok: boolean;
        account?: { id?: number; nickname?: string };
        contaFinanceira?: IntegracaoContaFinanceiraResult | null;
      }>("sistema/integracoes/mercadopago/test", {
        accessToken: accessToken || undefined,
        publicKey: publicKey || undefined,
        ambiente,
      }).then((res) => res.data),
    onMutate: () => {
      setConnection("testing");
      setConnectionDetail(null);
      setSyncedConta(null);
    },
    onSuccess: (data) => {
      setConnection("success");
      const nickname = data.account?.nickname;
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
        nickname
          ? `Conta verificada — ${nickname}${contaMsg ? `. ${contaMsg}` : ""}`
          : contaMsg ?? "Credenciais válidas — pronto para sincronizar.",
      );
    },
    onError: (err) => {
      setConnection("error");
      setConnectionDetail(extractErrorMessage(err));
    },
  });

  const webhookMutation = useMutation({
    mutationFn: () => import("api/integracoes").then((m) => m.setupMercadoPagoWebhook({ secret: webhookSecret || undefined })),
  });

  async function finish() {
    try {
      await saveMutation.mutateAsync({
        ambiente,
        accessToken: accessToken || undefined,
        publicKey: publicKey || undefined,
        syncPessoas,
        syncFaturas,
        webhook: { habilitado: webhookHabilitado, secret: webhookSecret || undefined },
        setupConcluido: true,
      });
      toast.success("Mercado Pago conectado com sucesso.");
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
    connection === "success" ||
    (credentialsSaved && !accessToken && !publicKey) ||
    Boolean(accessToken.trim() && publicKey.trim());

  return {
    step,
    setStep,
    ambiente,
    setAmbiente,
    accessToken,
    setAccessToken,
    publicKey,
    setPublicKey,
    syncPessoas,
    setSyncPessoas,
    syncFaturas,
    setSyncFaturas,
    webhookHabilitado,
    setWebhookHabilitado,
    webhookSecret,
    setWebhookSecret,
    connection,
    connectionDetail,
    syncedConta,
    showAccessToken,
    setShowAccessToken,
    showPublicKey,
    setShowPublicKey,
    revealedAccessToken,
    setRevealedAccessToken,
    revealedPublicKey,
    setRevealedPublicKey,
    theme,
    sandboxTheme,
    producaoTheme,
    isLocal,
    visibleSteps,
    stepIndex,
    initial,
    saveMutation,
    revealAccessTokenMutation,
    revealPublicKeyMutation,
    testMutation,
    webhookMutation,
    finish,
    next,
    credentialsReady,
  };
}
