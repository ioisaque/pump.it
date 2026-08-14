import mercadopagoLogo from "assets/providers/mercadopago-logo.svg";
import IntegracaoConfigForm from "components/integracoes/IntegracaoConfigForm";
import MercadoPagoSetupWizardDialog from "components/integracoes/MercadoPagoSetupWizardDialog";
import { MercadoPagoConfigPublic } from "domain/integracoes/types";

export default function MercadoPagoIntegracaoPage() {
  return (
    <IntegracaoConfigForm
      provider="mercadopago"
      logo={mercadopagoLogo}
      renderWizard={({ open, onClose, initial }) => (
        <MercadoPagoSetupWizardDialog
          open={open}
          onClose={onClose}
          initial={initial as MercadoPagoConfigPublic}
        />
      )}
    />
  );
}
