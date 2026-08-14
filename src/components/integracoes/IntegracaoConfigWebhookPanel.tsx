import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { UseMutationResult } from "@tanstack/react-query";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { IntegracaoProviderSlug } from "domain/integracoes/constants";
import { AsaasConfigPublic, MercadoPagoConfigPublic } from "domain/integracoes/types";

type IntegracaoConfigWebhookPanelProps = {
  provider: IntegracaoProviderSlug;
  data: AsaasConfigPublic | MercadoPagoConfigPublic;
  form: { webhookHabilitado: boolean };
  webhookSecret: string;
  onWebhookSecretChange: (value: string) => void;
  webhookMutation: UseMutationResult<unknown, unknown, void, unknown>;
  runtimeWebhookDisponivel: boolean;
};

export default function IntegracaoConfigWebhookPanel({
  provider,
  data,
  form,
  webhookSecret,
  onWebhookSecretChange,
  webhookMutation,
  runtimeWebhookDisponivel,
}: IntegracaoConfigWebhookPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: provider === "mercadopago" ? 2.5 : undefined,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Webhook (entrada)
      </Typography>
      {provider === "mercadopago" && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Configure o webhook manualmente no <strong>Painel de Desenvolvedores do Mercado Pago</strong> usando a URL
          abaixo. Informe o secret definido no painel para validar a configuração.
        </Typography>
      )}
      {data.webhook.url && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: "break-all" }}>
          {data.webhook.url}
        </Typography>
      )}
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: provider === "mercadopago" ? 1.5 : 0 }}>
        <Chip
          icon={data.webhook.configurado ? "check_circle" : "mdi:cloud-off-outline"}
          color={data.webhook.configurado ? "success.main" : "neutral.main"}
          nome={data.webhook.configurado ? "Webhook configurado" : "Webhook não configurado"}
        />
        {!runtimeWebhookDisponivel && (
          <Chip icon="mdi:home-outline" color="info.main" nome="Indisponível em local" />
        )}
      </Stack>
      {provider === "mercadopago" && (
        <TextField
          label="Secret do webhook"
          type="password"
          value={webhookSecret}
          onChange={(e) => onWebhookSecretChange(e.target.value)}
          placeholder="Secret configurado no painel Mercado Pago"
          fullWidth
          size="small"
          sx={{ mb: 1.5 }}
        />
      )}
      <Button
        sx={{ mt: provider === "asaas" ? 1.5 : 0 }}
        variant="outlined"
        disabled={
          !runtimeWebhookDisponivel ||
          !form.webhookHabilitado ||
          webhookMutation.isLoading ||
          (provider === "mercadopago" && !webhookSecret.trim())
        }
        onClick={() => webhookMutation.mutate()}
        startIcon={<Icon name="mdi:webhook" width={20} height={20} />}
        fullWidth
      >
        {provider === "asaas" ? "Configurar webhook no Asaas" : "Validar webhook"}
      </Button>
    </Paper>
  );
}
