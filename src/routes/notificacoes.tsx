import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

const NotificacoesPage = lazy(() => import("views/notificacoes"));

export const notificacoesRoutes = (
  <>
    <Route path="notify" element={<Navigate to="../notificacoes" replace />} />
    <Route path="notificacoes" element={<NotificacoesPage />} />
  </>
);
