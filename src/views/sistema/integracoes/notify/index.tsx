import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getNotifyConfig } from "api/integracoes";
import notifyItLogo from "assets/providers/notify-it-logo.svg";
import Chip from "components/Chip";
import Icon from "components/Icon";
import NotifySetupWizardDialog from "components/integracoes/NotifySetupWizardDialog";
import EntityHeader from "components/layout/EntityHeader";
import { NOTIFY_THEME } from "domain/integracoes/constants";
import { NotifyConfigPublic } from "domain/integracoes/types";
import { useState } from "react";
import useTenantBase from "hooks/useTenantBase";
import { Link as RouterLink } from "react-router-dom";

export default function NotifyIntegracaoPage() {
  const { base } = useTenantBase();
  const [wizardOpen, setWizardOpen] = useState(false);
  const theme = NOTIFY_THEME;

  const { data, isLoading } = useQuery({
    queryKey: ["integracoes", "notify", "config"],
    queryFn: () => getNotifyConfig() as Promise<NotifyConfigPublic>,
  });

  if (isLoading || !data) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  const runtime = data.runtime;

  return (
    <>
      <EntityHeader
        left={
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Box component="img" src={notifyItLogo} alt="notify.it" sx={{ height: 28, display: "block" }} />
            {data.apiKeyPreenchida && <Chip icon="vpn_key" color="success.main" nome="Conectado" />}
            {data.setupConcluido && <Chip icon="webhook" color="success.main" nome="Webhook ativo" />}
          </Stack>
        }
        right={
          <Stack direction="row" alignItems="center" gap={1}>
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {data.ultimoErro}
        </Alert>
      )}

      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Credenciais
            </Typography>
            <TextField
              fullWidth
              label="API key"
              value={data.apiKey}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            {data.notifyUrl && (
              <TextField
                fullWidth
                label="notify.it URL"
                value={data.notifyUrl}
                InputProps={{ readOnly: true }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Webhook
            </Typography>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <Icon
                name={data.webhook.configurado ? "check_circle" : "schedule"}
                color={data.webhook.configurado ? "success.main" : "warning.main"}
                width={20}
                height={20}
              />
              <Typography variant="body2">
                {data.webhook.configurado ? "Webhook registrado no notify.it" : "Pendente — use o Assistente"}
              </Typography>
            </Stack>
            <TextField
              fullWidth
              label="Webhook URL"
              value={data.webhook.url ?? ""}
              InputProps={{ readOnly: true }}
              helperText={
                runtime.webhookDisponivel
                  ? "notify.it envia eventos de deploy e setup para esta URL."
                  : "Indisponível em ambiente local (exige PUBLIC_API_URL HTTPS)."
              }
            />
          </CardContent>
        </Card>

        {!data.setupConcluido && (
          <Box>
            <Button
              variant="contained"
              onClick={() => setWizardOpen(true)}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Icon name="play_arrow" width={20} height={20} />}
              sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
            >
              Iniciar assistente de setup
            </Button>
          </Box>
        )}
      </Stack>

      <NotifySetupWizardDialog open={wizardOpen} onClose={() => setWizardOpen(false)} initial={data} />
    </>
  );
}
