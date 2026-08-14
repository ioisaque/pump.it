import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import Chip from "components/Chip";
import Icon from "components/Icon";
import AsaasSaqueValidationPanel from "components/integracoes/AsaasSaqueValidationPanel";
import IntegracaoConfigCredentialsCard from "components/integracoes/IntegracaoConfigCredentialsCard";
import IntegracaoConfigWebhookPanel from "components/integracoes/IntegracaoConfigWebhookPanel";
import IntegracaoContaSyncPanel from "components/integracoes/IntegracaoContaSyncPanel";
import IntegracaoSyncSidebar from "components/integracoes/IntegracaoSyncSidebar";
import EntityHeader from "components/layout/EntityHeader";
import { INTEGRACAO_PROVIDER_META, IntegracaoProviderSlug } from "domain/integracoes/constants";
import { AsaasConfigPublic, MercadoPagoConfigPublic } from "domain/integracoes/types";
import useIntegracaoConfigForm from "hooks/useIntegracaoConfigForm";
import useTenantBase from "hooks/useTenantBase";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

type IntegracaoConfigFormProps = {
  provider: IntegracaoProviderSlug;
  logo: string;
  renderWizard: (props: {
    open: boolean;
    onClose: () => void;
    initial: AsaasConfigPublic | MercadoPagoConfigPublic;
  }) => ReactNode;
};

export default function IntegracaoConfigForm({ provider, logo, renderWizard }: IntegracaoConfigFormProps) {
  const { base } = useTenantBase();
  const meta = INTEGRACAO_PROVIDER_META[provider];
  const {
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
    credentialsConfigured,
    apiKeyDisplayValue,
    accessTokenDisplayValue,
    publicKeyDisplayValue,
    toggleApiKeyVisibility,
    toggleAccessTokenVisibility,
    togglePublicKeyVisibility,
  } = useIntegracaoConfigForm(provider);

  if (isLoading || !data || !form || !theme || !runtime) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  const switchSx = {
    "& .MuiSwitch-switchBase.Mui-checked": { color: theme.main },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: theme.main,
      opacity: 1,
    },
    "& .MuiSwitch-switchBase.Mui-checked.Mui-disabled": { color: theme.light },
    "& .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track": {
      backgroundColor: theme.main,
      opacity: 0.45,
    },
  };

  return (
    <>
      <EntityHeader
        left={
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Box component="img" src={logo} alt={meta.nome} sx={{ height: meta.logoHeight, display: "block" }} />
            <Chip icon={theme.icon} color={theme.main} nome={theme.label} />
            {credentialsConfigured && <Chip icon="vpn_key" color="success.main" nome="Conectado" />}
          </Stack>
        }
        right={
          <Stack direction="row" alignItems="center" gap={1}>
            {saveMutation.isLoading && (
              <Stack direction="row" alignItems="center" gap={0.75}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Salvando…
                </Typography>
              </Stack>
            )}
            {savedFlash && !saveMutation.isLoading && (
              <Chip icon="check_circle" color="success.main" nome="Salvo" />
            )}
            <Button
              variant="contained"
              onClick={() => setWizardOpen(true)}
              startIcon={<Icon name="mdi:account-question-outline" width={20} height={20} />}
              sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
            >
              Assistente
            </Button>
            <Button
              component={RouterLink}
              to={`${base}/sistema/integracoes`}
              variant="contained"
              color="quinzel"
              sx={{ width: 140, height: 40 }}
            >
              <Icon name="undo" />
              Voltar
            </Button>
          </Stack>
        }
      />

      {data.ultimoErro && (
        <Alert severity="warning" sx={{ mb: 2, borderLeft: `4px solid ${theme.main}` }}>
          Último erro de sync: {data.ultimoErro}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ borderTop: `4px solid ${theme.main}` }}>
            <CardContent>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} lg={8}>
                  <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1.5, minHeight: 40 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: theme.light,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="mdi:database-sync-outline" color={theme.main} width={22} height={22} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                      Conecte sua conta do <b>{meta.nome}</b> para sincronizar dados do sistema.
                    </Typography>
                  </Stack>

                  <IntegracaoConfigCredentialsCard
                    provider={provider}
                    theme={theme}
                    data={data}
                    credentialsConfigured={credentialsConfigured}
                    providerNome={meta.nome}
                    showApiKey={showApiKey}
                    showAccessToken={showAccessToken}
                    showPublicKey={showPublicKey}
                    apiKeyDisplayValue={apiKeyDisplayValue}
                    accessTokenDisplayValue={accessTokenDisplayValue}
                    publicKeyDisplayValue={publicKeyDisplayValue}
                    toggleApiKeyVisibility={toggleApiKeyVisibility}
                    toggleAccessTokenVisibility={toggleAccessTokenVisibility}
                    togglePublicKeyVisibility={togglePublicKeyVisibility}
                    revealApiKeyMutation={revealApiKeyMutation}
                    revealAccessTokenMutation={revealAccessTokenMutation}
                    revealPublicKeyMutation={revealPublicKeyMutation}
                    onOpenWizard={() => setWizardOpen(true)}
                  />

                  <IntegracaoContaSyncPanel providerNome={meta.nome} contaFinanceira={data.contaFinanceira} />

                  <IntegracaoConfigWebhookPanel
                    provider={provider}
                    data={data}
                    form={form}
                    webhookSecret={webhookSecret}
                    onWebhookSecretChange={setWebhookSecret}
                    webhookMutation={webhookMutation}
                    runtimeWebhookDisponivel={runtime.webhookDisponivel}
                  />

                  {provider === "asaas" ? (
                    <AsaasSaqueValidationPanel data={data as AsaasConfigPublic} themeMain={theme.main} />
                  ) : null}
                </Grid>

                <Grid item xs={12} lg={4}>
                  <IntegracaoSyncSidebar
                    providerNome={meta.nome}
                    theme={theme}
                    form={form}
                    syncItems={syncItems}
                    switchSx={switchSx}
                    saving={saveMutation.isLoading}
                    webhookDisponivel={runtime.webhookDisponivel}
                    onToggleSync={(key, value) => {
                      setForm((f) => (f ? { ...f, [key]: value } : f));
                      patchLive({ [key]: value });
                    }}
                    onToggleWebhook={(value) => {
                      setForm((f) => (f ? { ...f, webhookHabilitado: value } : f));
                      patchLive({ webhook: { habilitado: value } });
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderWizard({ open: wizardOpen, onClose: closeWizard, initial: data })}
    </>
  );
}
