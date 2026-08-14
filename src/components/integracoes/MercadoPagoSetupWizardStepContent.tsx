import { Alert, Box, Button, CircularProgress, FormControlLabel, IconButton, InputAdornment, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import { UseMutationResult } from "@tanstack/react-query";
import Chip from "components/Chip";
import Icon from "components/Icon";
import IntegracaoContaSyncPanel from "components/integracoes/IntegracaoContaSyncPanel";
import { AmbienteTheme, IntegracaoAmbiente } from "domain/integracoes/constants";
import { IntegracaoContaSummary, MercadoPagoConfigPublic } from "domain/integracoes/types";

type ConnectionState = "idle" | "testing" | "success" | "error";

export type MercadoPagoSetupWizardStepKey = "welcome" | "credentials" | "toggles" | "webhook" | "done";

type MercadoPagoSetupWizardStepContentProps = {
  step: MercadoPagoSetupWizardStepKey;
  theme: AmbienteTheme;
  sandboxTheme: AmbienteTheme;
  producaoTheme: AmbienteTheme;
  isLocal: boolean;
  initial: MercadoPagoConfigPublic;
  ambiente: IntegracaoAmbiente;
  setAmbiente: (value: IntegracaoAmbiente) => void;
  accessToken: string;
  setAccessToken: (value: string) => void;
  publicKey: string;
  setPublicKey: (value: string) => void;
  syncPessoas: boolean;
  setSyncPessoas: (value: boolean) => void;
  syncFaturas: boolean;
  setSyncFaturas: (value: boolean) => void;
  webhookHabilitado: boolean;
  setWebhookHabilitado: (value: boolean) => void;
  webhookSecret: string;
  setWebhookSecret: (value: string) => void;
  connection: ConnectionState;
  connectionDetail: string | null;
  syncedConta: IntegracaoContaSummary | null;
  showAccessToken: boolean;
  setShowAccessToken: (value: boolean) => void;
  showPublicKey: boolean;
  setShowPublicKey: (value: boolean) => void;
  revealedAccessToken: string | null;
  setRevealedAccessToken: (value: string | null) => void;
  revealedPublicKey: string | null;
  setRevealedPublicKey: (value: string | null) => void;
  testMutation: UseMutationResult<
    {
      ok: boolean;
      account?: { id?: number; nickname?: string };
      contaFinanceira?: { id: number; nome: string; criada?: boolean; atualizada?: boolean } | null;
    },
    unknown,
    void,
    unknown
  >;
  webhookMutation: UseMutationResult<unknown, unknown, void, unknown>;
  revealAccessTokenMutation: UseMutationResult<{ accessToken: string }, unknown, void, unknown>;
  revealPublicKeyMutation: UseMutationResult<{ publicKey: string }, unknown, void, unknown>;
};

export default function MercadoPagoSetupWizardStepContent({
  step,
  theme,
  sandboxTheme,
  producaoTheme,
  isLocal,
  initial,
  ambiente,
  setAmbiente,
  accessToken,
  setAccessToken,
  publicKey,
  setPublicKey,
  syncPessoas,
  setSyncPessoas,
  syncFaturas,
  setSyncFaturas,
  webhookHabilitado,
  setWebhookHabilitado,
  webhookSecret,
  setWebhookSecret,
  connection,
  connectionDetail,
  syncedConta,
  showAccessToken,
  setShowAccessToken,
  showPublicKey,
  setShowPublicKey,
  revealedAccessToken,
  setRevealedAccessToken,
  revealedPublicKey,
  setRevealedPublicKey,
  testMutation,
  webhookMutation,
  revealAccessTokenMutation,
  revealPublicKeyMutation,
}: MercadoPagoSetupWizardStepContentProps) {
  function connectionPanelBg() {
    if (connection === "success") return "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)";
    if (connection === "error") return "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)";
    if (connection === "testing") return `linear-gradient(135deg, ${theme.light} 0%, #e8f4fc 100%)`;
    return `linear-gradient(135deg, ${theme.light} 0%, #fafafa 100%)`;
  }

  function connectionBorderColor() {
    if (connection === "success") return "#2e7d32";
    if (connection === "error") return "#c62828";
    return theme.main;
  }

  function accessTokenInputValue() {
    if (accessToken) return accessToken;
    if (showAccessToken && revealedAccessToken) return revealedAccessToken;
    if (initial.accessTokenPreenchido) return initial.accessToken;
    return "";
  }

  function publicKeyInputValue() {
    if (publicKey) return publicKey;
    if (showPublicKey && revealedPublicKey) return revealedPublicKey;
    if (initial.publicKeyPreenchida) return initial.publicKey;
    return "";
  }

  function toggleAccessTokenVisibility() {
    if (showAccessToken) {
      setShowAccessToken(false);
      return;
    }
    if (revealedAccessToken) {
      setShowAccessToken(true);
      return;
    }
    if (initial.accessTokenPreenchido && !accessToken) {
      revealAccessTokenMutation.mutate();
      return;
    }
    setShowAccessToken(true);
  }

  function togglePublicKeyVisibility() {
    if (showPublicKey) {
      setShowPublicKey(false);
      return;
    }
    if (revealedPublicKey) {
      setShowPublicKey(true);
      return;
    }
    if (initial.publicKeyPreenchida && !publicKey) {
      revealPublicKeyMutation.mutate();
      return;
    }
    setShowPublicKey(true);
  }

  if (step === "welcome") {
    return (
      <Stack gap={2}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.main}33` }}>
          <Stack direction="row" gap={2} alignItems="flex-start">
            <Icon name="mdi:database-sync-outline" color={theme.main} width={36} height={36} />
            <Box>
              <Typography fontWeight={600} gutterBottom>
                Seu sistema é a fonte da verdade
              </Typography>
              <Typography variant="body2" color="text.secondary">
                O Mercado Pago recebe cópias dos dados quando os toggles de sincronização estiverem ativos. Você
                continua gerenciando tudo por aqui.
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip icon="groups" color={theme.main} nome="Pessoas" />
          <Chip icon="mdi:file-document-outline" color={theme.main} nome="Faturas" />
        </Stack>
        {isLocal && (
          <Alert severity="info" icon={<Icon name="mdi:home-outline" width={22} height={22} />}>
            Ambiente local: use <strong>Sandbox</strong> para testar sync de saída. Webhooks só em produção.
          </Alert>
        )}
      </Stack>
    );
  }

  if (step === "credentials") {
    return (
      <Stack gap={2}>
        <Stack direction="row" gap={1}>
          <Button
            fullWidth
            variant={ambiente === "sandbox" ? "contained" : "outlined"}
            onClick={() => setAmbiente("sandbox")}
            startIcon={<Icon name="mdi:flask-outline" width={20} height={20} />}
            sx={{
              py: 1.25,
              bgcolor: ambiente === "sandbox" ? sandboxTheme.main : "transparent",
              borderColor: sandboxTheme.main,
              color: ambiente === "sandbox" ? "#fff" : sandboxTheme.main,
              "&:hover": {
                bgcolor: ambiente === "sandbox" ? sandboxTheme.dark : sandboxTheme.light,
              },
            }}
          >
            Sandbox
          </Button>
          <Button
            fullWidth
            variant={ambiente === "producao" ? "contained" : "outlined"}
            onClick={() => setAmbiente("producao")}
            startIcon={<Icon name="mdi:rocket-launch-outline" width={20} height={20} />}
            sx={{
              py: 1.25,
              bgcolor: ambiente === "producao" ? producaoTheme.main : "transparent",
              borderColor: producaoTheme.main,
              color: ambiente === "producao" ? "#fff" : producaoTheme.main,
              "&:hover": {
                bgcolor: ambiente === "producao" ? producaoTheme.dark : producaoTheme.light,
              },
            }}
          >
            Produção
          </Button>
        </Stack>

        <TextField
          label="Access Token"
          type={showAccessToken ? "text" : "password"}
          value={accessTokenInputValue()}
          onChange={(e) => {
            setAccessToken(e.target.value);
            setShowAccessToken(false);
            setRevealedAccessToken(null);
          }}
          placeholder={initial.accessTokenPreenchido ? "" : "Cole seu Access Token do Mercado Pago"}
          helperText={
            initial.accessTokenPreenchido && !accessToken
              ? "Token já salvo. Use o olho para visualizar ou digite outro para substituir."
              : undefined
          }
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: theme.main },
            "& .MuiInputLabel-root.Mui-focused": { color: theme.main },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showAccessToken ? "Ocultar Access Token" : "Mostrar Access Token"}
                  onClick={toggleAccessTokenVisibility}
                  edge="end"
                  disabled={revealAccessTokenMutation.isLoading || (!initial.accessTokenPreenchido && !accessToken)}
                >
                  <Icon name={showAccessToken ? "visibility_off" : "visibility"} width={22} height={22} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Public Key"
          type={showPublicKey ? "text" : "password"}
          value={publicKeyInputValue()}
          onChange={(e) => {
            setPublicKey(e.target.value);
            setShowPublicKey(false);
            setRevealedPublicKey(null);
          }}
          placeholder={initial.publicKeyPreenchida ? "" : "Cole sua Public Key do Mercado Pago"}
          helperText={
            initial.publicKeyPreenchida && !publicKey
              ? "Chave já salva. Use o olho para visualizar ou digite outra para substituir."
              : undefined
          }
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: theme.main },
            "& .MuiInputLabel-root.Mui-focused": { color: theme.main },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPublicKey ? "Ocultar Public Key" : "Mostrar Public Key"}
                  onClick={togglePublicKeyVisibility}
                  edge="end"
                  disabled={revealPublicKeyMutation.isLoading || (!initial.publicKeyPreenchida && !publicKey)}
                >
                  <Icon name={showPublicKey ? "visibility_off" : "visibility"} width={22} height={22} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Paper
          elevation={connection === "success" ? 2 : 0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            background: connectionPanelBg(),
            border: `2px solid ${connectionBorderColor()}`,
            transition: "all 0.35s ease",
          }}
        >
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  connection === "success"
                    ? "#c8e6c9"
                    : connection === "error"
                      ? "#ffcdd2"
                      : `${theme.main}22`,
                transition: "background-color 0.35s ease",
              }}
            >
              {connection === "testing" ? (
                <CircularProgress size={28} sx={{ color: theme.main }} />
              ) : (
                <Icon
                  name={
                    connection === "success"
                      ? "check_circle"
                      : connection === "error"
                        ? "error"
                        : "mdi:lan-connect"
                  }
                  color={
                    connection === "success"
                      ? "#2e7d32"
                      : connection === "error"
                        ? "#c62828"
                        : theme.main
                  }
                  width={32}
                  height={32}
                />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700}>
                {connection === "testing" && "Testando conexão…"}
                {connection === "success" && "Conexão estabelecida"}
                {connection === "error" && "Falha na conexão"}
                {connection === "idle" && "Aguardando teste"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {connection === "idle" &&
                  `Informe as credenciais e teste antes de continuar no ambiente ${theme.label}.`}
                {connection === "testing" && `Validando credenciais em ${initial.runtime.apiBase ?? "api.mercadopago.com"}…`}
                {connectionDetail}
              </Typography>
            </Box>
          </Stack>

          {connection === "success" && syncedConta ? (
            <IntegracaoContaSyncPanel providerNome="Mercado Pago" contaFinanceira={syncedConta} />
          ) : null}

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1.1,
              bgcolor:
                connection === "success"
                  ? "#2e7d32"
                  : connection === "error"
                    ? "#c62828"
                    : theme.main,
              "&:hover": {
                bgcolor:
                  connection === "success"
                    ? "#1b5e20"
                    : connection === "error"
                      ? "#b71c1c"
                      : theme.dark,
              },
            }}
            onClick={() => testMutation.mutate()}
            disabled={
              testMutation.isLoading ||
              (!accessToken && !initial.accessTokenPreenchido) ||
              (!publicKey && !initial.publicKeyPreenchida)
            }
            startIcon={
              testMutation.isLoading ? undefined : (
                <Icon name={connection === "success" ? "refresh" : "mdi:connection"} width={20} height={20} />
              )
            }
          >
            {testMutation.isLoading
              ? "Testando…"
              : connection === "success"
                ? "Testar novamente"
                : connection === "error"
                  ? "Tentar de novo"
                  : "Testar conexão"}
          </Button>
        </Paper>

        {ambiente === "producao" && (
          <Alert severity="warning" sx={{ borderLeft: `4px solid ${producaoTheme.main}` }}>
            Produção usa cobranças reais. Confirme que esta é a conta correta antes de ativar sync.
          </Alert>
        )}
      </Stack>
    );
  }

  if (step === "toggles") {
    return (
      <Stack gap={1.5}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Escolha o que será enviado automaticamente ao Mercado Pago após cada alteração no sistema.
        </Typography>
        {[
          { checked: syncPessoas, set: setSyncPessoas, icon: "groups", label: "Sync Pessoas / Clientes", desc: "CRUD de pessoas → clientes Mercado Pago" },
          { checked: syncFaturas, set: setSyncFaturas, icon: "mdi:file-document-outline", label: "Sync Faturas", desc: "Cada fatura → pagamento no Mercado Pago" },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            onClick={() => item.set(!item.checked)}
            sx={{
              p: 1.5,
              borderRadius: 2,
              cursor: "pointer",
              border: `2px solid ${item.checked ? theme.main : "#e0e0e0"}`,
              bgcolor: item.checked ? `${theme.main}0d` : "#fff",
              transition: "all 0.2s ease",
              "&:hover": { borderColor: theme.main },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Icon name={item.icon} color={item.checked ? theme.main : "text.secondary"} width={24} height={24} />
                <Box>
                  <Typography fontWeight={600}>{item.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={item.checked}
                    onChange={(_, v) => item.set(v)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      "& .Mui-checked": { color: theme.main },
                      "& .Mui-checked + .MuiSwitch-track": { bgcolor: theme.main },
                    }}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>
    );
  }

  if (step === "webhook") {
    return (
      <Stack gap={2}>
        <Alert severity="info" icon={<Icon name="mdi:information-outline" width={22} height={22} />}>
          Configure o webhook manualmente no{" "}
          <strong>Painel de Desenvolvedores do Mercado Pago</strong> apontando para a URL abaixo. Depois informe o
          secret definido no painel.
        </Alert>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}>
          <FormControlLabel
            control={
              <Switch
                checked={webhookHabilitado}
                onChange={(e) => setWebhookHabilitado(e.target.checked)}
              />
            }
            label="Receber status de faturas via webhook"
          />
          {initial.runtime.webhookUrl && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: "break-all" }}>
              {initial.runtime.webhookUrl}
            </Typography>
          )}
        </Paper>
        <TextField
          label="Secret do webhook"
          type="password"
          value={webhookSecret}
          onChange={(e) => setWebhookSecret(e.target.value)}
          placeholder="Secret configurado no painel Mercado Pago"
          fullWidth
          size="small"
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: theme.main },
            "& .MuiInputLabel-root.Mui-focused": { color: theme.main },
          }}
        />
        <Button
          variant="outlined"
          onClick={() => webhookMutation.mutate()}
          disabled={!webhookHabilitado || !webhookSecret.trim() || webhookMutation.isLoading}
          startIcon={<Icon name="mdi:webhook" width={20} height={20} />}
          sx={{ borderColor: theme.main, color: theme.main }}
        >
          {webhookMutation.isSuccess ? "Webhook validado" : "Validar webhook"}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" gap={2} sx={{ py: 2 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          bgcolor: "#e8f5e9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="celebration" color="#2e7d32" width={40} height={40} />
      </Box>
      <Typography variant="h6" fontWeight={700} textAlign="center">
        Mercado Pago conectado
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Vá em <strong>Integrações → Verificar sincronização</strong> para enviar registros que ainda não foram
        copiados.
      </Typography>
      <Chip icon={theme.icon} color={theme.main} nome={`Ambiente: ${theme.label}`} />
    </Stack>
  );
}
