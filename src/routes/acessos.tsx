import { lazy } from "react";
import { Route } from "react-router-dom";

const AcessosList = lazy(() => import("views/acessos/list"));

export const acessosRoutes = <Route path="acessos" element={<AcessosList />} />;
