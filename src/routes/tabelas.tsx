import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

const TabelasDashboard = lazy(() => import("views/tabelas"));

export const tabelasRoutes = (
  <Route path="tabelas">
    <Route index element={<TabelasDashboard />} />
    <Route path="niveis" element={<Navigate to=".." replace />} />
    <Route path="etiquetas" element={<Navigate to=".." replace />} />
    <Route path="origens" element={<Navigate to=".." replace />} />
    <Route path="status" element={<Navigate to=".." replace />} />
  </Route>
);
