import IntegracaoFeesPanel from "components/integracoes/IntegracaoFeesPanel";

type MercadoPagoFeesPanelProps = {
  configurado: boolean;
};

export default function MercadoPagoFeesPanel({ configurado }: MercadoPagoFeesPanelProps) {
  return <IntegracaoFeesPanel provider="mercadopago" configurado={configurado} />;
}
