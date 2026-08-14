import { Alert, Button, Stack, Typography } from "@mui/material";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { Link as RouterLink } from "react-router-dom";
import { IntegracaoContaSummary } from "domain/integracoes/types";

type IntegracaoContaSyncPanelProps = {
  providerNome: string;
  contaFinanceira?: IntegracaoContaSummary | null;
  compact?: boolean;
  showContaLink?: boolean;
};

export default function IntegracaoContaSyncPanel({
  providerNome,
  contaFinanceira,
  compact = false,
  showContaLink = true,
}: IntegracaoContaSyncPanelProps) {
  const sincronizada = Boolean(contaFinanceira?.sincronizada && contaFinanceira.id);

  if (compact) {
    return (
      <Chip
        icon={sincronizada ? "mdi:bank-check" : "mdi:bank-off-outline"}
        color={sincronizada ? "success.main" : "neutral.main"}
        nome={
          sincronizada
            ? `Conta: ${contaFinanceira?.nome ?? `#${contaFinanceira?.id}`}`
            : "Conta financeira não sincronizada"
        }
      />
    );
  }

  return (
    <Alert
      severity={sincronizada ? "success" : "info"}
      icon={<Icon name={sincronizada ? "mdi:bank-check" : "mdi:bank-outline"} width={22} height={22} />}
      sx={{ my: compact ? 0 : 2 }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1}>
        <Stack gap={0.25}>
          <Typography variant="subtitle2" fontWeight={600}>
            Conta financeira {sincronizada ? "sincronizada" : "pendente"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sincronizada
              ? `Campos bloqueados são sincronizados com a integração e não podem ser editados.`
              : `Ao conectar ou sincronizar, o sistema cria ou vincula a conta bancária do ${providerNome}.`}
          </Typography>
        </Stack>
        {showContaLink && sincronizada && contaFinanceira?.id ? (
          <Button
            component={RouterLink}
            to={`/contas/edit/${contaFinanceira.id}`}
            size="small"
            variant="outlined"
            startIcon={<Icon name="mdi:open-in-new" width={18} height={18} />}
          >
            Ver conta
          </Button>
        ) : null}
      </Stack>
    </Alert>
  );
}
