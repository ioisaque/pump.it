import { lazy } from "react";
import { Route } from "react-router-dom";

const ConfiguracoesPage = lazy(() => import("views/configuracoes"));

export const configuracoesRoutes = <Route path="configuracoes" element={<ConfiguracoesPage />} />;
