import { Box, Card, CardContent, Divider, IconButton, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import Chip from "components/Chip";
import Icon from "components/Icon";
import IntegracaoContaSyncPanel from "components/integracoes/IntegracaoContaSyncPanel";
import { IntegracaoProviderSummary } from "domain/integracoes/types";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { LINK } from "utils/link";

export type IntegracaoProviderCardProps = {
  provider: IntegracaoProviderSummary;
  brand?: ReactNode;
  aside?: ReactNode;
  onSync?: () => void;
};

export default function IntegracaoProviderCard({ provider, brand, aside, onSync }: IntegracaoProviderCardProps) {
  const { resumo } = provider;
  const pct = resumo.total > 0 ? (resumo.sincronizados / resumo.total) * 100 : 100;
  const editTo = LINK(`/sistema/integracoes/${provider.id}`);

  return (
    <Card sx={{ height: "100%", overflow: "hidden", position: "relative" }}>
      <Stack direction={{ xs: "column", md: "row" }} sx={{ height: "100%", position: "relative", zIndex: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0, position: "relative", alignSelf: "stretch" }}>
          <Box
            component={RouterLink}
            to={editTo}
            sx={{
              display: "block",
              height: "100%",
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <CardContent sx={{ height: "100%", boxSizing: "border-box", pr: onSync ? 6 : undefined }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                  {brand ?? (
                    <>
                      <Icon name="mdi:bank-outline" width={28} height={28} color="primary.main" />
                      <Typography variant="h6">{provider.nome}</Typography>
                    </>
                  )}
                </Stack>
                <Chip
                  icon="mdi:cloud-outline"
                  color={provider.ambiente === "sandbox" ? "info.main" : "warning.main"}
                  nome={provider.ambiente === "sandbox" ? "Sandbox" : "Produção"}
                />
              </Stack>

              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <Icon
                  name={provider.configurado ? "check_circle" : "error"}
                  color={provider.configurado ? "success.main" : "warning.main"}
                  width={18}
                  height={18}
                />
                <Typography variant="body2" color="text.secondary">
                  {provider.configurado ? "Configurado" : "Não configurado"}
                </Typography>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                Sincronizados: {resumo.sincronizados}/{resumo.total}
              </Typography>
              <LinearProgress variant="determinate" value={pct} sx={{ mt: 0.5, height: 6, borderRadius: 1 }} />

              <Stack direction="row" gap={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                <Chip icon="groups" color="primary.main" nome={`Pessoas ${resumo.pessoas.sincronizados}/${resumo.pessoas.total}`} />
                <Chip
                  icon="mdi:file-document-outline"
                  color="primary.main"
                  nome={`Faturas ${resumo.faturas.sincronizados}/${resumo.faturas.total}`}
                />
                <Chip
                  icon="mdi:file-sign"
                  color="primary.main"
                  nome={`Contr. ${resumo.contratos.sincronizados}/${resumo.contratos.total}`}
                />
                <IntegracaoContaSyncPanel
                  providerNome={provider.nome}
                  contaFinanceira={provider.contaFinanceira}
                  compact
                />
              </Stack>

              {provider.ultimoErro && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                  {provider.ultimoErro}
                </Typography>
              )}
            </CardContent>
          </Box>

          {onSync ? (
            <Tooltip title="Verificar sincronização">
              <IconButton
                size="small"
                aria-label="Verificar sincronização"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSync();
                }}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <Icon name="sync" width={20} height={20} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>

        {aside && (
          <>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
            <Divider sx={{ display: { xs: "block", md: "none" } }} />
            <Box sx={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>{aside}</Box>
          </>
        )}
      </Stack>
    </Card>
  );
}
