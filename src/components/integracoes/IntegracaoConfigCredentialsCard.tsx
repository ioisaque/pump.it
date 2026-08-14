import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { UseMutationResult } from "@tanstack/react-query";
import Icon from "components/Icon";
import { IntegracaoProviderSlug } from "domain/integracoes/constants";
import { AsaasConfigPublic, MercadoPagoConfigPublic } from "domain/integracoes/types";

type IntegracaoConfigCredentialsCardProps = {
  provider: IntegracaoProviderSlug;
  theme: { main: string; dark: string; light: string };
  data: AsaasConfigPublic | MercadoPagoConfigPublic;
  credentialsConfigured: boolean;
  providerNome: string;
  showApiKey: boolean;
  showAccessToken: boolean;
  showPublicKey: boolean;
  apiKeyDisplayValue: () => string;
  accessTokenDisplayValue: () => string;
  publicKeyDisplayValue: () => string;
  toggleApiKeyVisibility: () => void;
  toggleAccessTokenVisibility: () => void;
  togglePublicKeyVisibility: () => void;
  revealApiKeyMutation: UseMutationResult<unknown, unknown, void, unknown>;
  revealAccessTokenMutation: UseMutationResult<unknown, unknown, void, unknown>;
  revealPublicKeyMutation: UseMutationResult<unknown, unknown, void, unknown>;
  onOpenWizard: () => void;
};

export default function IntegracaoConfigCredentialsCard({
  provider,
  theme,
  data,
  credentialsConfigured,
  providerNome,
  showApiKey,
  showAccessToken,
  showPublicKey,
  apiKeyDisplayValue,
  accessTokenDisplayValue,
  publicKeyDisplayValue,
  toggleApiKeyVisibility,
  toggleAccessTokenVisibility,
  togglePublicKeyVisibility,
  revealApiKeyMutation,
  revealAccessTokenMutation,
  revealPublicKeyMutation,
  onOpenWizard,
}: IntegracaoConfigCredentialsCardProps) {
  const credentialsTitle =
    provider === "asaas"
      ? credentialsConfigured
        ? "API Key salva!"
        : "API Key não configurada."
      : credentialsConfigured
        ? "Credenciais salvas!"
        : "Credenciais não configuradas.";

  const credentialsSubtitle = credentialsConfigured
    ? `Sistema conectado ao ${providerNome}.`
    : "Abra o Assistente para conectar sua conta.";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: credentialsConfigured ? "success.light" : "divider",
        borderLeft: `4px solid ${credentialsConfigured ? "#2e7d32" : theme.main}`,
        bgcolor: credentialsConfigured ? "success.50" : "background.paper",
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: credentialsConfigured ? "success.100" : theme.light,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            name={credentialsConfigured ? "check_circle" : "mdi:lan-disconnect"}
            color={credentialsConfigured ? "success.main" : theme.main}
            width={26}
            height={26}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={600}>{credentialsTitle}</Typography>
          <Typography variant="body2" color="text.secondary">
            {credentialsSubtitle}
          </Typography>
        </Box>
        {!credentialsConfigured && (
          <Button
            size="small"
            variant="contained"
            onClick={onOpenWizard}
            sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark }, flexShrink: 0 }}
          >
            Configurar
          </Button>
        )}
      </Stack>

      {provider === "asaas" && credentialsConfigured && (
        <TextField
          label="API Key"
          type={showApiKey ? "text" : "password"}
          value={apiKeyDisplayValue()}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showApiKey ? "Ocultar API Key" : "Mostrar API Key"}
                  onClick={toggleApiKeyVisibility}
                  edge="end"
                  disabled={revealApiKeyMutation.isLoading}
                >
                  <Icon name={showApiKey ? "visibility_off" : "visibility"} width={22} height={22} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}

      {provider === "mercadopago" && credentialsConfigured && (
        <Stack gap={1.5} sx={{ mt: 2 }}>
          <TextField
            label="Access Token"
            type={showAccessToken ? "text" : "password"}
            value={accessTokenDisplayValue()}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showAccessToken ? "Ocultar Access Token" : "Mostrar Access Token"}
                    onClick={toggleAccessTokenVisibility}
                    edge="end"
                    disabled={revealAccessTokenMutation.isLoading}
                  >
                    <Icon
                      name={showAccessToken ? "visibility_off" : "visibility"}
                      width={22}
                      height={22}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Public Key"
            type={showPublicKey ? "text" : "password"}
            value={publicKeyDisplayValue()}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPublicKey ? "Ocultar Public Key" : "Mostrar Public Key"}
                    onClick={togglePublicKeyVisibility}
                    edge="end"
                    disabled={revealPublicKeyMutation.isLoading}
                  >
                    <Icon name={showPublicKey ? "visibility_off" : "visibility"} width={22} height={22} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      )}
    </Paper>
  );
}
