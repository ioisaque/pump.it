import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAsaasApiKey,
    getAsaasConfig,
    getMercadoPagoAccessToken,
    getMercadoPagoConfig,
    getMercadoPagoPublicKey,
    saveAsaasConfig,
    saveMercadoPagoConfig,
    setupAsaasWebhook,
    setupMercadoPagoWebhook,
} from "api/integracoes";
import {
    getAmbienteTheme,
    INTEGRACAO_SYNC_ITEMS,
    IntegracaoProviderSlug,
} from "domain/integracoes/constants";
import { AsaasConfigPublic, MercadoPagoConfigPublic } from "domain/integracoes/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type IntegracaoFormState = {
  syncPessoas: boolean;
  syncFaturas: boolean;
  transferenciasAutomaticas: boolean;
  webhookHabilitado: boolean;
};

export default function useIntegracaoConfigForm(provider: IntegracaoProviderSlug) {
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [form, setForm] = useState<IntegracaoFormState | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);
  const [revealedAccessToken, setRevealedAccessToken] = useState<string | null>(null);
  const [revealedPublicKey, setRevealedPublicKey] = useState<string | null>(null);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const configQueryKey = ["integracoes", provider, "config"] as const;

  const { data, isLoading } = useQuery({
    queryKey: configQueryKey,
    queryFn: () => (provider === "asaas" ? getAsaasConfig() : getMercadoPagoConfig()),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      provider === "asaas" ? saveAsaasConfig(body) : saveMercadoPagoConfig(body),
    onSuccess: (saved) => {
      queryClient.setQueryData(configQueryKey, saved);
      void queryClient.invalidateQueries({ queryKey: ["integracoes"] });
      if (provider === "asaas") {
        const s = saved as AsaasConfigPublic;
        setForm({
          syncPessoas: s.syncPessoas,
          syncFaturas: s.syncFaturas,
          webhookHabilitado: s.webhook.habilitado,
          transferenciasAutomaticas: s.transferenciasAutomaticas,
        });
      } else {
        const s = saved as MercadoPagoConfigPublic;
        setForm({
          syncPessoas: s.syncPessoas,
          syncFaturas: s.syncFaturas,
          webhookHabilitado: s.webhook.habilitado,
          transferenciasAutomaticas: s.transferenciasAutomaticas,
        });
      }
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    },
    onError: () => toast.error("Falha ao salvar."),
  });

  const revealApiKeyMutation = useMutation({
    mutationFn: getAsaasApiKey,
    onSuccess: (res) => {
      setRevealedApiKey(res.apiKey);
      setShowApiKey(true);
    },
    onError: () => toast.error("Não foi possível carregar a API Key."),
  });

  const revealAccessTokenMutation = useMutation({
    mutationFn: getMercadoPagoAccessToken,
    onSuccess: (res) => {
      setRevealedAccessToken(res.accessToken);
      setShowAccessToken(true);
    },
    onError: () => toast.error("Não foi possível carregar o Access Token."),
  });

  const revealPublicKeyMutation = useMutation({
    mutationFn: getMercadoPagoPublicKey,
    onSuccess: (res) => {
      setRevealedPublicKey(res.publicKey);
      setShowPublicKey(true);
    },
    onError: () => toast.error("Não foi possível carregar a Public Key."),
  });

  const webhookMutation = useMutation({
    mutationFn: () =>
      provider === "asaas" ? setupAsaasWebhook() : setupMercadoPagoWebhook({ secret: webhookSecret }),
    onSuccess: () => {
      toast.success(provider === "asaas" ? "Webhook configurado." : "Webhook validado.");
      void queryClient.invalidateQueries({ queryKey: configQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["integracoes"] });
    },
    onError: () => toast.error(provider === "asaas" ? "Falha ao configurar webhook." : "Falha ao validar webhook."),
  });

  useEffect(() => {
    if (!data) return;
    if (provider === "asaas") {
      const d = data as AsaasConfigPublic;
      setForm({
        syncPessoas: d.syncPessoas,
        syncFaturas: d.syncFaturas,
        transferenciasAutomaticas: d.transferenciasAutomaticas ?? false,
        webhookHabilitado: d.webhook.habilitado,
      });
    } else {
      const d = data as MercadoPagoConfigPublic;
      setForm({
        syncPessoas: d.syncPessoas,
        syncFaturas: d.syncFaturas,
        transferenciasAutomaticas: d.transferenciasAutomaticas ?? false,
        webhookHabilitado: d.webhook.habilitado,
      });
    }
  }, [data, provider]);

  function patchLive(body: Record<string, unknown>) {
    saveMutation.mutate(body);
  }

  function closeWizard() {
    setWizardOpen(false);
    void queryClient.invalidateQueries({ queryKey: configQueryKey });
  }

  const theme = data ? getAmbienteTheme(provider, data.ambiente) : null;
  const runtime = data?.runtime;
  const syncItems = INTEGRACAO_SYNC_ITEMS[provider];

  const credentialsConfigured =
    data &&
    (provider === "asaas"
      ? (data as AsaasConfigPublic).apiKeyPreenchida
      : Boolean(
          (data as MercadoPagoConfigPublic).accessTokenPreenchido &&
            (data as MercadoPagoConfigPublic).publicKeyPreenchida,
        ));

  function apiKeyDisplayValue() {
    if (!data) return "";
    const d = data as AsaasConfigPublic;
    if (showApiKey && revealedApiKey) return revealedApiKey;
    if (d.apiKeyPreenchida) return d.apiKey;
    return "";
  }

  function accessTokenDisplayValue() {
    if (!data) return "";
    const d = data as MercadoPagoConfigPublic;
    if (showAccessToken && revealedAccessToken) return revealedAccessToken;
    if (d.accessTokenPreenchido) return d.accessToken;
    return "";
  }

  function publicKeyDisplayValue() {
    if (!data) return "";
    const d = data as MercadoPagoConfigPublic;
    if (showPublicKey && revealedPublicKey) return revealedPublicKey;
    if (d.publicKeyPreenchida) return d.publicKey;
    return "";
  }

  function toggleApiKeyVisibility() {
    if (!data) return;
    if (showApiKey) {
      setShowApiKey(false);
      return;
    }
    if (revealedApiKey) {
      setShowApiKey(true);
      return;
    }
    if ((data as AsaasConfigPublic).apiKeyPreenchida) {
      revealApiKeyMutation.mutate();
    }
  }

  function toggleAccessTokenVisibility() {
    if (!data) return;
    if (showAccessToken) {
      setShowAccessToken(false);
      return;
    }
    if (revealedAccessToken) {
      setShowAccessToken(true);
      return;
    }
    if ((data as MercadoPagoConfigPublic).accessTokenPreenchido) {
      revealAccessTokenMutation.mutate();
    }
  }

  function togglePublicKeyVisibility() {
    if (!data) return;
    if (showPublicKey) {
      setShowPublicKey(false);
      return;
    }
    if (revealedPublicKey) {
      setShowPublicKey(true);
      return;
    }
    if ((data as MercadoPagoConfigPublic).publicKeyPreenchida) {
      revealPublicKeyMutation.mutate();
    }
  }

  return {
    wizardOpen,
    setWizardOpen,
    form,
    setForm,
    showApiKey,
    showAccessToken,
    showPublicKey,
    webhookSecret,
    setWebhookSecret,
    savedFlash,
    data,
    isLoading,
    saveMutation,
    revealApiKeyMutation,
    revealAccessTokenMutation,
    revealPublicKeyMutation,
    webhookMutation,
    patchLive,
    closeWizard,
    theme,
    runtime,
    syncItems,
    credentialsConfigured: Boolean(credentialsConfigured),
    apiKeyDisplayValue,
    accessTokenDisplayValue,
    publicKeyDisplayValue,
    toggleApiKeyVisibility,
    toggleAccessTokenVisibility,
    togglePublicKeyVisibility,
  };
}
