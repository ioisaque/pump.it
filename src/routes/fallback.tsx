import { Navigate, Route } from "react-router-dom";

/** `pessoas/3` → `pessoas/3/edit` (e equivalentes). Evita Outlet vazio. */
export const tenantFallbackRoutes = (
  <>
    <Route path="pessoas/:id" element={<Navigate to="edit" replace />} />
    <Route path="fichas/:id" element={<Navigate to="edit" replace />} />
    <Route path="workout-plans/:id" element={<Navigate to="edit" replace />} />
    <Route path="plataforma/academias/:id" element={<Navigate to="edit" replace />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </>
);
