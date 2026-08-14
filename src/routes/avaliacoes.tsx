import { RequireStaff } from "components/auth/RequireAuth";
import { lazy } from "react";
import { Route } from "react-router-dom";

const AvaliacoesList = lazy(() => import("views/avaliacoes/list"));
const AvaliacaoAdd = lazy(() => import("views/avaliacoes/add"));
const AvaliacaoEdit = lazy(() => import("views/avaliacoes/edit"));
const AvaliacaoShow = lazy(() => import("views/avaliacoes/show"));

export const avaliacoesRoutes = (
  <Route path="avaliacoes">
    <Route index element={<AvaliacoesList />} />
    <Route element={<RequireStaff />}>
      <Route path="add" element={<AvaliacaoAdd />} />
      <Route path=":id/edit" element={<AvaliacaoEdit />} />
    </Route>
    <Route path=":id" element={<AvaliacaoShow />} />
  </Route>
);
