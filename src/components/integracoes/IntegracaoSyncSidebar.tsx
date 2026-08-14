import { Box, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import Icon from "components/Icon";
import { AmbienteTheme, IntegracaoSyncItemConfig } from "domain/integracoes/constants";

type IntegracaoFormState = {
  syncPessoas: boolean;
  syncFaturas: boolean;
  transferenciasAutomaticas?: boolean;
  webhookHabilitado: boolean;
};

type IntegracaoSyncSidebarProps = {
  providerNome: string;
  theme: AmbienteTheme;
  form: IntegracaoFormState;
  syncItems: IntegracaoSyncItemConfig[];
  switchSx: SxProps<Theme>;
  saving: boolean;
  webhookDisponivel: boolean;
  onToggleSync: (key: string, value: boolean) => void;
  onToggleWebhook: (value: boolean) => void;
};

export default function IntegracaoSyncSidebar({
  providerNome,
  theme,
  form,
  syncItems,
  switchSx,
  saving,
  webhookDisponivel,
  onToggleSync,
  onToggleWebhook,
}: IntegracaoSyncSidebarProps) {
  return (
    <Box
      sx={{
        pl: { lg: 1 },
        borderLeft: { lg: "1px solid" },
        borderColor: { lg: "divider" },
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={600}
        sx={{ mb: 1.5, minHeight: 40, display: "flex", alignItems: "center" }}
      >
        Sincronização (saída)
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        Envio automático ao {providerNome} após alterações no sistema.
      </Typography>
      <Stack gap={1}>
        {syncItems.map((item) => (
          <Paper
            key={item.key}
            elevation={0}
            onClick={() => {
              if (saving) return;
              const checked = form[item.key as keyof IntegracaoFormState];
              if (typeof checked !== "boolean") return;
              onToggleSync(item.key, !checked);
            }}
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              cursor: saving ? "wait" : "pointer",
              border: `2px solid ${form[item.key as keyof IntegracaoFormState] ? theme.main : "divider"}`,
              bgcolor: form[item.key as keyof IntegracaoFormState] ? `${theme.main}0a` : "background.paper",
              opacity: saving ? 0.7 : 1,
              transition: "border-color 0.2s ease, background-color 0.2s ease",
              "&:hover": { borderColor: theme.main },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                <Icon
                  name={item.icon}
                  color={form[item.key as keyof IntegracaoFormState] ? theme.main : "text.secondary"}
                  width={20}
                  height={20}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {item.desc}
                  </Typography>
                </Box>
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form[item.key as keyof IntegracaoFormState])}
                    disabled={saving}
                    onChange={(_, v) => onToggleSync(item.key, v)}
                    onClick={(e) => e.stopPropagation()}
                    sx={switchSx}
                  />
                }
                label=""
                sx={{ m: 0, flexShrink: 0 }}
              />
            </Stack>
          </Paper>
        ))}

        <Paper
          elevation={0}
          onClick={() => {
            if (saving || !webhookDisponivel) return;
            onToggleWebhook(!form.webhookHabilitado);
          }}
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            cursor: !webhookDisponivel || saving ? "default" : "pointer",
            border: `2px solid ${form.webhookHabilitado ? theme.main : "divider"}`,
            bgcolor: form.webhookHabilitado ? `${theme.main}0a` : "background.paper",
            opacity: saving || !webhookDisponivel ? 0.7 : 1,
            transition: "border-color 0.2s ease, background-color 0.2s ease",
            "&:hover": webhookDisponivel ? { borderColor: theme.main } : {},
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
              <Icon
                name="mdi:webhook"
                color={form.webhookHabilitado ? theme.main : "text.secondary"}
                width={20}
                height={20}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  Webhook (entrada)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Receber status de faturas via webhook
                </Typography>
              </Box>
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={form.webhookHabilitado}
                  disabled={!webhookDisponivel || saving}
                  onChange={(_, v) => onToggleWebhook(v)}
                  onClick={(e) => e.stopPropagation()}
                  sx={switchSx}
                />
              }
              label=""
              sx={{ m: 0, flexShrink: 0 }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
