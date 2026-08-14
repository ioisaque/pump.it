import { Box } from "@mui/material";
import mercadopagoLogo from "assets/providers/mercadopago-logo.svg";
import IntegracaoProviderCard from "components/integracoes/IntegracaoProviderCard";
import MercadoPagoFeesPanel from "components/integracoes/MercadoPagoFeesPanel";
import { IntegracaoProviderSummary } from "domain/integracoes/types";

type MercadoPagoProviderCardProps = {
  provider: IntegracaoProviderSummary;
  onSync?: () => void;
};

export default function MercadoPagoProviderCard({ provider, onSync }: MercadoPagoProviderCardProps) {
  return (
    <IntegracaoProviderCard
      provider={provider}
      onSync={onSync}
      brand={<Box component="img" src={mercadopagoLogo} alt="Mercado Pago" sx={{ height: 50, display: "block" }} />}
      aside={<MercadoPagoFeesPanel configurado={provider.configurado} />}
    />
  );
}
