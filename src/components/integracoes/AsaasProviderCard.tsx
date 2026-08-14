import { Box } from "@mui/material";
import asaasLogo from "assets/providers/asaas-logo.svg";
import AsaasFeesPanel from "components/integracoes/AsaasFeesPanel";
import IntegracaoProviderCard from "components/integracoes/IntegracaoProviderCard";
import { IntegracaoProviderSummary } from "domain/integracoes/types";

type AsaasProviderCardProps = {
  provider: IntegracaoProviderSummary;
  onSync?: () => void;
};

export default function AsaasProviderCard({ provider, onSync }: AsaasProviderCardProps) {
  return (
    <IntegracaoProviderCard
      provider={provider}
      onSync={onSync}
      brand={<Box component="img" src={asaasLogo} alt="Asaas" sx={{ height: 22, display: "block" }} />}
      aside={<AsaasFeesPanel configurado={provider.configurado} />}
    />
  );
}
