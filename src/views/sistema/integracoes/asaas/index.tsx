import asaasLogo from "assets/providers/asaas-logo.svg";
import AsaasSetupWizardDialog from "components/integracoes/AsaasSetupWizardDialog";
import IntegracaoConfigForm from "components/integracoes/IntegracaoConfigForm";
import { AsaasConfigPublic } from "domain/integracoes/types";

export default function AsaasIntegracaoPage() {
  return (
    <IntegracaoConfigForm
      provider="asaas"
      logo={asaasLogo}
      renderWizard={({ open, onClose, initial }) => (
        <AsaasSetupWizardDialog open={open} onClose={onClose} initial={initial as AsaasConfigPublic} />
      )}
    />
  );
}
