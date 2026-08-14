import { lazy } from "react";
import { Route } from "react-router-dom";

const SistemaHub = lazy(() => import("views/sistema"));
const SistemaTelas = lazy(() => import("views/sistema/telas"));
const IntegracoesHub = lazy(() => import("views/sistema/integracoes"));
const AsaasIntegracao = lazy(() => import("views/sistema/integracoes/asaas"));
const MercadoPagoIntegracao = lazy(() => import("views/sistema/integracoes/mercadopago"));
const NotifyIntegracao = lazy(() => import("views/sistema/integracoes/notify"));

export const sistemaRoutes = (
  <Route path="sistema">
    <Route index element={<SistemaHub />} />
    <Route path="telas" element={<SistemaTelas />} />
    <Route path="integracoes">
      <Route index element={<IntegracoesHub />} />
      <Route path="asaas" element={<AsaasIntegracao />} />
      <Route path="mercadopago" element={<MercadoPagoIntegracao />} />
      <Route path="notify" element={<NotifyIntegracao />} />
    </Route>
  </Route>
);
