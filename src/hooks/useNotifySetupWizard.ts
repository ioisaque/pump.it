import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeNotifySetup, testNotifyConnection } from "api/integracoes";
import { NOTIFY_THEME } from "domain/integracoes/constants";
import { NotifyConfigPublic } from "domain/integracoes/types";
import { usePushNotifications } from "hooks/usePushNotifications";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const STEPS = [
  { key: "push", label: "Push" },
  { key: "credentials", label: "Conexão" },
  { key: "setup", label: "Webhook" },
  { key: "done", label: "Pronto" },
] as const;

export type NotifySetupWizardStepKey = (typeof STEPS)[number]["key"];
type ConnectionState = "idle" | "testing" | "success" | "error";

type PushTarget = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

type UseNotifySetupWizardParams = {
  open: boolean;
  onClose: () => void;
  initial: NotifyConfigPublic;
};

function extractErrorMessage(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join("; ");
  if (typeof msg === "string" && msg.trim()) return msg;
  return "Não foi possível completar a operação.";
}

async function readPushTarget(): Promise<PushTarget | null> {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  };
}

function resetWizardState(
  setters: {
    setStep: (step: NotifySetupWizardStepKey) => void;
    setApiKey: (value: string) => void;
    setConnection: (value: ConnectionState) => void;
    setConnectionDetail: (value: string | null) => void;
    setSetupResult: (value: Record<string, unknown> | null) => void;
    setShowApiKey: (value: boolean) => void;
    setRevealedApiKey: (value: string | null) => void;
    setApiKeySaved: (value: boolean) => void;
  },
  initial: NotifyConfigPublic,
) {
  setters.setStep(initial.setupConcluido ? "done" : "push");
  setters.setApiKey("");
  setters.setApiKeySaved(initial.apiKeyPreenchida);
  setters.setConnection(initial.apiKeyPreenchida ? "success" : "idle");
  setters.setConnectionDetail(initial.apiKeyPreenchida ? "API key já configurada — teste novamente ou avance." : null);
  setters.setSetupResult(null);
  setters.setShowApiKey(false);
  setters.setRevealedApiKey(null);
}

export default function useNotifySetupWizard({ open, onClose, initial }: UseNotifySetupWizardParams) {
  const queryClient = useQueryClient();
  const { status: pushStatus, enablePush } = usePushNotifications();
  const wasOpen = useRef(false);
  const [step, setStep] = useState<NotifySetupWizardStepKey>("push");
  const [apiKey, setApiKey] = useState("");
  const [connection, setConnection] = useState<ConnectionState>("idle");
  const [connectionDetail, setConnectionDetail] = useState<string | null>(null);
  const [setupResult, setSetupResult] = useState<Record<string, unknown> | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);
  const [apiKeySaved, setApiKeySaved] = useState(initial.apiKeyPreenchida);
  const [runtime, setRuntime] = useState(initial.runtime);

  const theme = NOTIFY_THEME;
  const isLocal = runtime.isLocalDev;
  const webhookDisponivel = runtime.webhookDisponivel;
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const pushReady = pushStatus === "subscribed";
  const credentialsReady =
    connection === "success" && (apiKey.trim() !== "" || apiKeySaved);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setRuntime(initial.runtime);
      resetWizardState(
        {
          setStep,
          setApiKey,
          setConnection,
          setConnectionDetail,
          setSetupResult,
          setShowApiKey,
          setRevealedApiKey,
          setApiKeySaved,
        },
        initial,
      );
    }
    wasOpen.current = open;
  }, [open, initial]);

  useEffect(() => {
    if (step !== "credentials") return;
    if (connection === "success") return;
    setConnection("idle");
    setConnectionDetail(null);
  }, [apiKey, step, connection]);

  const testMutation = useMutation({
    mutationFn: () => testNotifyConnection({ apiKey: apiKey.trim() || undefined }),
    onMutate: () => {
      setConnection("testing");
      setConnectionDetail(null);
    },
    onSuccess: (result: { config?: NotifyConfigPublic }) => {
      setConnection("success");
      setConnectionDetail("notify.it está no ar.");
      if (result.config?.apiKeyPreenchida) {
        setApiKeySaved(true);
      }
      if (result.config) {
        queryClient.setQueryData(["integracoes", "notify", "config"], result.config);
      }
    },
    onError: (err) => {
      setConnection("error");
      setConnectionDetail(extractErrorMessage(err));
    },
  });

  const setupMutation = useMutation({
    mutationFn: async () => {
      const target = await readPushTarget();
      if (!target) {
        throw new Error("Ative o push antes de concluir o setup.");
      }
      return completeNotifySetup({
        apiKey: apiKey.trim() || undefined,
        push: { targets: [target] },
      });
    },
    onSuccess: (result: { config?: NotifyConfigPublic } & Record<string, unknown>) => {
      setSetupResult(result);
      setStep("done");
      if (result.config) {
        queryClient.setQueryData(["integracoes", "notify", "config"], result.config);
        setRuntime(result.config.runtime);
      }
      void queryClient.invalidateQueries({ queryKey: ["integracoes"] });
      toast.success("Integração notify.it concluída!");
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const revealMutation = useMutation({
    mutationFn: () => import("api/integracoes").then((m) => m.getNotifyApiKey()),
    onSuccess: (res: { apiKey: string }) => {
      setRevealedApiKey(res.apiKey);
      setShowApiKey(true);
    },
    onError: () => toast.error("Não foi possível carregar a API Key."),
  });

  function next() {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].key);
    }
  }

  async function activatePush() {
    await enablePush();
  }

  async function finish() {
    if (!webhookDisponivel) {
      toast.error("Webhook indisponível em ambiente local.");
      return;
    }
    await setupMutation.mutateAsync();
  }

  function closeWizard() {
    void queryClient.invalidateQueries({ queryKey: ["integracoes", "notify", "config"] });
    onClose();
  }

  return {
    step,
    setStep,
    theme,
    STEPS,
    stepIndex,
    isLocal,
    webhookDisponivel,
    initial,
    runtime,
    apiKey,
    setApiKey,
    apiKeySaved,
    connection,
    connectionDetail,
    pushStatus,
    pushReady,
    credentialsReady,
    setupResult,
    showApiKey,
    setShowApiKey,
    revealedApiKey,
    setRevealedApiKey,
    testMutation,
    setupMutation,
    revealMutation,
    activatePush,
    next,
    finish,
    onClose: closeWizard,
  };
}
