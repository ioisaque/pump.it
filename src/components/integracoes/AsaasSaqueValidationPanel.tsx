import {
    Alert,
    Box,
    Button,
    IconButton,
    Link,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAsaasWebhookToken, testAsaasSaqueWebhook } from "api/integracoes";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { AsaasConfigPublic } from "domain/integracoes/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type AsaasSaqueValidationPanelProps = {
  data: AsaasConfigPublic;
  themeMain: string;
};

export default function AsaasSaqueValidationPanel({ data, themeMain }: AsaasSaqueValidationPanelProps) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testOk, setTestOk] = useState<boolean | null>(null);

  const tokenMutation = useMutation({
    mutationFn: getAsaasWebhookToken,
    onSuccess: async (res) => {
      setToken(res.authToken);
      await queryClient.invalidateQueries({ queryKey: ["integracoes", "asaas", "config"] });
    },
    onError: () => toast.error("Não foi possível obter o token de autenticação."),
  });

  const testMutation = useMutation({
    mutationFn: testAsaasSaqueWebhook,
    onSuccess: (res) => {
      setTestOk(res.ok);
      setTestMessage(res.mensagem);
      if (res.ok) toast.success("Endpoint de validação OK.");
      else toast.error(res.mensagem);
    },
    onError: () => {
      setTestOk(false);
      setTestMessage("Não foi possível checar o endpoint.");
      toast.error("Não foi possível checar o endpoint.");
    },
  });

  useEffect(() => {
    let cancelled = false;
    void getAsaasWebhookToken()
      .then((res) => {
        if (!cancelled) setToken(res.authToken);
      })
      .catch(() => {
        if (!cancelled) setToken("");
      });
    return () => {
      cancelled = true;
    };
  }, [data.webhook.url]);

  function copy(text: string, label: string) {
    if (!text.trim()) {
      toast.error(`${label} indisponível.`);
      return;
    }
    void navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copiado.`),
      () => toast.error("Falha ao copiar."),
    );
  }

  const url = data.webhook.url ?? "";
  const emailAlertas = data.emailAlertasSaque?.trim() ?? "";
  const tokenReady = Boolean(token);
  const ready = Boolean(url && tokenReady);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: ready ? "info.light" : "warning.light",
        bgcolor: ready ? "info.50" : "warning.50",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Validação de saque via Webhook
        </Typography>
        <Chip
          icon={ready ? "mdi:shield-check-outline" : "mdi:shield-alert-outline"}
          color={ready ? "info.main" : "warning.main"}
          nome={ready ? "Copiar no Asaas" : "Aguardando URL/token"}
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        O Asaas exige um webhook em <strong>Mecanismos de segurança</strong> (separado do de eventos). Sem isso,
        transferências via API ficam pendentes e são canceladas após 3 tentativas. Este sistema responde{" "}
        <code>APPROVED</code> apenas para PIX originados pelas regras agendadas.
      </Typography>

      <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
        Passos no painel Asaas
      </Typography>
      <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 1.5, "& li": { mb: 0.75 } }}>
        <Typography component="li" variant="body2">
          Menu do usuário → <strong>Integrações</strong> → <strong>Mecanismos de segurança</strong>
        </Typography>
        <Typography component="li" variant="body2">
          Cole a <strong>URL</strong>, o <strong>token</strong> e o <strong>e-mail</strong> abaixo (header{" "}
          <code>asaas-access-token</code>)
        </Typography>
        <Typography component="li" variant="body2">
          <strong>Marque</strong> a opção <em>Ativar autorização de saque para estornos Pix</em>
        </Typography>
        <Typography component="li" variant="body2">
          <strong>Deixe desmarcada</strong> a opção <em>Validar também saques via interface</em>
        </Typography>
        <Typography component="li" variant="body2">
          Salve no Asaas. A Asaas não oferece API para confirmar essa tela — use o botão de checar endpoint abaixo
          para validar o nosso lado.
        </Typography>
      </Box>

      <Link
        href="https://docs.asaas.com/docs/mecanismo-para-validacao-de-saque-via-webhooks"
        target="_blank"
        rel="noopener noreferrer"
        variant="body2"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 1.5, color: themeMain }}
      >
        Documentação Asaas
        <Icon name="mdi:open-in-new" width={14} height={14} />
      </Link>

      <Stack gap={1.25}>
        <TextField
          size="small"
          label="URL do webhook de validação"
          fullWidth
          value={url}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton size="small" aria-label="Copiar URL" onClick={() => copy(url, "URL")} disabled={!url}>
                <Icon name="mdi:content-copy" width={18} height={18} />
              </IconButton>
            ),
          }}
          helperText="Mesma URL do webhook de eventos — o sistema diferencia pelo payload."
        />

        <TextField
          size="small"
          label="Token de autenticação (gerado pelo app)"
          fullWidth
          value={tokenMutation.isLoading && !token ? "Gerando…" : token}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <Stack direction="row" alignItems="center">
                {!token ? (
                  <IconButton
                    size="small"
                    aria-label="Gerar token"
                    disabled={tokenMutation.isLoading}
                    onClick={() => tokenMutation.mutate()}
                  >
                    <Icon name="mdi:refresh" width={18} height={18} />
                  </IconButton>
                ) : (
                  <IconButton size="small" aria-label="Copiar token" onClick={() => copy(token, "Token")}>
                    <Icon name="mdi:content-copy" width={18} height={18} />
                  </IconButton>
                )}
              </Stack>
            ),
          }}
          helperText="Copie este token no Asaas — não é editável aqui; o app gera e valida o header."
        />

        <TextField
          size="small"
          label="E-mail para notificação de erros"
          fullWidth
          value={emailAlertas}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton
                size="small"
                aria-label="Copiar e-mail"
                onClick={() => copy(emailAlertas, "E-mail")}
                disabled={!emailAlertas}
              >
                <Icon name="mdi:content-copy" width={18} height={18} />
              </IconButton>
            ),
          }}
          helperText={
            emailAlertas
              ? "E-mail do usuário master (id 1) — cole no campo de alertas do Asaas."
              : "Usuário id 1 sem e-mail cadastrado. Atualize o cadastro da pessoa master."
          }
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} gap={1} alignItems={{ sm: "center" }} sx={{ mt: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          disabled={!url || testMutation.isLoading || tokenMutation.isLoading}
          onClick={() => testMutation.mutate()}
          startIcon={<Icon name="mdi:lan-check" width={18} height={18} />}
          sx={{ borderColor: themeMain, color: themeMain }}
        >
          {testMutation.isLoading ? "Checando…" : "Checar endpoint"}
        </Button>
        <Typography variant="caption" color="text.secondary">
          Testa URL + token no nosso servidor. Não consulta a configuração da tela no Asaas.
        </Typography>
      </Stack>

      {testMessage ? (
        <Alert severity={testOk ? "success" : "warning"} sx={{ mt: 1.5 }}>
          {testMessage}
        </Alert>
      ) : null}
    </Paper>
  );
}
