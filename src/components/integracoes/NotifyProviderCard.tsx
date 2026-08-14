import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import notifyItLogo from "assets/providers/notify-it-logo.svg";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { NOTIFY_THEME } from "domain/integracoes/constants";
import { IntegracaoProviderSummary } from "domain/integracoes/types";
import useTenantBase from "hooks/useTenantBase";
import { Link as RouterLink } from "react-router-dom";

type NotifyProviderCardProps = {
  provider: IntegracaoProviderSummary;
};

export default function NotifyProviderCard({ provider }: NotifyProviderCardProps) {
  const { base } = useTenantBase();
  const theme = NOTIFY_THEME;

  return (
    <Card sx={{ height: "100%", overflow: "hidden" }}>
      <Box
        component={RouterLink}
        to={`${base}/sistema/integracoes/${provider.id}`}
        sx={{
          display: "block",
          height: "100%",
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Box component="img" src={notifyItLogo} alt="notify.it" sx={{ marginLeft: -1, height: 50, display: "block" }} />
            <Chip icon="notifications_active" color={theme.main} nome="Mail + Push" />
          </Stack>

          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Icon
              name={provider.configurado ? "check_circle" : "error"}
              color={provider.configurado ? "success.main" : "warning.main"}
              width={18}
              height={18}
            />
            <Typography variant="body2" color="text.secondary">
              {provider.configurado ? "API key configurada" : "Não configurado"}
            </Typography>
          </Stack>

          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip
              icon="webhook"
              color={provider.setupConcluido ? "success.main" : "warning.main"}
              nome={provider.setupConcluido ? "Webhook ativo" : "Webhook pendente"}
            />
            {provider.setupConcluido && (
              <Chip icon="mail" color={theme.main} nome="Mail via notify.it" />
            )}
          </Stack>

          {provider.ultimoErro && (
            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
              {provider.ultimoErro}
            </Typography>
          )}
        </CardContent>
      </Box>
    </Card>
  );
}
