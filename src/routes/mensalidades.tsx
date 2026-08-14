import { lazy } from "react";
import { Route } from "react-router-dom";

const MensalidadesList = lazy(() => import("views/mensalidades/list"));

export const mensalidadesRoutes = <Route path="mensalidades" element={<MensalidadesList />} />;
