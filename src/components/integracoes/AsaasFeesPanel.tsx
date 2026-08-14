import IntegracaoFeesPanel from "components/integracoes/IntegracaoFeesPanel";

type AsaasFeesPanelProps = {
  configurado: boolean;
};

export default function AsaasFeesPanel({ configurado }: AsaasFeesPanelProps) {
  return <IntegracaoFeesPanel provider="asaas" configurado={configurado} />;
}
