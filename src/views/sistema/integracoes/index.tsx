import { Box, Grid, LinearProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listIntegracoes } from "api/integracoes";
import IntegracaoProviderCard from "components/integracoes/IntegracaoProviderCard";
import IntegracaoSyncDialog from "components/integracoes/IntegracaoSyncDialog";
import EntityHeader from "components/layout/EntityHeader";
import { PROVIDER_CARDS } from "constants/providers";
import { useState } from "react";
import { IntegracaoProviderSummary } from "domain/integracoes/types";

export default function IntegracoesHubPage() {
  const [syncProvider, setSyncProvider] = useState<IntegracaoProviderSummary | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["integracoes"],
    queryFn: () => listIntegracoes(),
  });

  const providers = data?.providers ?? [];

  function renderProviderCard(provider: IntegracaoProviderSummary) {
    const Card = PROVIDER_CARDS[provider.id] || IntegracaoProviderCard;
    return <Card provider={provider} onSync={() => setSyncProvider(provider)} />;
  }

  return (
    <>
      <EntityHeader
        left={<Typography variant="h5">Integrações</Typography>}
      />

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={2}>
          {providers.map((p) => (
            <Grid item xs={12} key={p.id}>
              {renderProviderCard(p)}
            </Grid>
          ))}
          {providers.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">Nenhuma integração disponível.</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {syncProvider && (
        <IntegracaoSyncDialog
          open={Boolean(syncProvider)}
          onClose={() => setSyncProvider(null)}
          provider={syncProvider.id}
          providerNome={syncProvider.nome}
          ambiente={syncProvider.ambiente}
        />
      )}
    </>
  );
}
