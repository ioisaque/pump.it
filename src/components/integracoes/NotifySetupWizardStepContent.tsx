import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { UseMutationResult } from "@tanstack/react-query";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { AmbienteTheme } from "domain/integracoes/constants";
import { NotifyConfigPublic } from "domain/integracoes/types";
import { NotifySetupWizardStepKey } from "hooks/useNotifySetupWizard";
import { PushStatus } from "hooks/usePushNotifications";

type ConnectionState = "idle" | "testing" | "success" | "error";

type NotifySetupWizardStepContentProps = {
  step: NotifySetupWizardStepKey;
  theme: AmbienteTheme;
  initial: NotifyConfigPublic;
  webhookDisponivel: boolean;
  apiKey: string;
  apiKeySaved: boolean;
  setApiKey: (value: string) => void;
  connection: ConnectionState;
  connectionDetail: string | null;
  pushStatus: PushStatus;
  pushReady: boolean;
  setupResult: Record<string, unknown> | null;
  showApiKey: boolean;
  setShowApiKey: (value: boolean) => void;
  revealedApiKey: string | null;
  setRevealedApiKey: (value: string | null) => void;
  testMutation: UseMutationResult<unknown, unknown, void, unknown>;
  setupMutation: UseMutationResult<unknown, unknown, void, unknown>;
  revealMutation: UseMutationResult<{ apiKey: string }, unknown, void, unknown>;
  activatePush: () => Promise<void>;
};

export default function NotifySetupWizardStepContent({
  step,
  theme,
  initial,
  webhookDisponivel,
  apiKey,
  apiKeySaved,
  setApiKey,
  connection,
  connectionDetail,
  pushStatus,
  pushReady,
  setupResult,
  showApiKey,
  setShowApiKey,
  revealedApiKey,
  setRevealedApiKey,
  testMutation,
  setupMutation,
  revealMutation,
  activatePush,
}: NotifySetupWizardStepContentProps) {
  if (step === "push") {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Ativar notificações push
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          O notify.it envia um push de confirmação ao concluir o setup. Ative as notificações neste browser antes de continuar.
        </Typography>
        {pushStatus === "unsupported" && (
          <Alert severity="error">Este browser não suporta Web Push.</Alert>
        )}
        {pushStatus === "denied" && (
          <Alert severity="warning">Permissão negada — libere notificações nas configurações do browser.</Alert>
        )}
        {pushReady ? (
          <Alert severity="success" icon={<Icon name="notifications_active" width={20} height={20} />}>
            Push ativado — pode continuar.
          </Alert>
        ) : (
          <Button
            type="button"
            variant="contained"
            onClick={() => void activatePush()}
            disabled={pushStatus === "loading" || pushStatus === "unsupported"}
            startIcon={pushStatus === "loading" ? <CircularProgress size={16} color="inherit" /> : <Icon name="notifications" width={20} height={20} />}
            sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
          >
            Ativar push
          </Button>
        )}
      </Paper>
    );
  }

  if (step === "credentials") {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          API key do notify.it
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gere a key no admin notify.it (app <strong>invoices</strong>) e cole abaixo. A key fica armazenada no servidor — não trafega direto para notify.it a partir do browser.
        </Typography>
        <TextField
          fullWidth
          label="API key (ntf_…)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type={showApiKey ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {initial.apiKeyPreenchida && !apiKey && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (revealedApiKey) {
                        setShowApiKey(!showApiKey);
                        return;
                      }
                      void revealMutation.mutate();
                    }}
                    aria-label="Revelar API key salva"
                  >
                    <Icon name={showApiKey ? "visibility_off" : "visibility"} width={20} height={20} />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        {initial.apiKeyPreenchida && !apiKey && revealedApiKey && showApiKey && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Key salva: {revealedApiKey.slice(0, 8)}…
          </Typography>
        )}
        <Stack direction="row" gap={1} alignItems="center">
          <Button
            type="button"
            variant="outlined"
            onClick={() => void testMutation.mutate()}
            disabled={(!apiKey.trim() && !apiKeySaved) || testMutation.isLoading}
            startIcon={testMutation.isLoading ? <CircularProgress size={16} /> : <Icon name="link" width={18} height={18} />}
          >
            Testar conexão
          </Button>
          {connection === "success" && <Chip icon="check_circle" color="success.main" nome="Conectado" />}
          {connection === "error" && <Chip icon="error" color="error.main" nome="Falhou" />}
        </Stack>
        {connectionDetail && (
          <Typography variant="body2" color={connection === "error" ? "error.main" : "text.secondary"} sx={{ mt: 1 }}>
            {connectionDetail}
          </Typography>
        )}
        {initial.notifyUrl && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            notify.it: {initial.notifyUrl}
          </Typography>
        )}
      </Paper>
    );
  }

  if (step === "setup") {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Registrar webhook
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          O servidor chama <code>POST /notify.it/setup/complete</code> e registra o webhook abaixo no notify.it.
        </Typography>
        {!webhookDisponivel && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Webhook indisponível em ambiente local. Configure <code>PUBLIC_API_URL</code> HTTPS na API e conclua o setup em staging/produção.
          </Alert>
        )}
        <TextField
          fullWidth
          label="Webhook URL"
          value={initial.webhook.url ?? ""}
          InputProps={{ readOnly: true }}
          sx={{ mb: 2 }}
        />
        {setupMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Falha ao registrar webhook. Verifique a API key e tente novamente.
          </Alert>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <Icon name="check_circle" color="success.main" width={32} height={32} />
        <Typography variant="h6" fontWeight={700}>
          Integração concluída
        </Typography>
      </Stack>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
        <Chip icon="webhook" color="success.main" nome="Webhook registrado" />
        <Chip icon="mail" color={theme.main} nome="Mail via notify.it" />
        <Chip icon="notifications" color={theme.main} nome="Push via notify.it" />
      </Stack>
      {setupResult && (
        <Box
          component="pre"
          sx={{
            p: 1.5,
            bgcolor: "#1e1e1e",
            color: "#d4d4d4",
            borderRadius: 1,
            fontSize: "0.75rem",
            overflow: "auto",
            maxHeight: 200,
          }}
        >
          {JSON.stringify(setupResult, null, 2)}
        </Box>
      )}
    </Paper>
  );
}
