import { RequireStaff } from "components/auth/RequireAuth";
import { lazy } from "react";
import { Route } from "react-router-dom";

const FichasList = lazy(() => import("views/fichas/list"));
const FichaAdd = lazy(() => import("views/fichas/add"));
const FichaEdit = lazy(() => import("views/fichas/edit"));
const FichaTreino = lazy(() => import("views/fichas/treino"));

export const fichasRoutes = (
  <>
    <Route path="fichas" element={<FichasList />} />
    <Route path="fichas/:id/treino" element={<FichaTreino />} />
    <Route element={<RequireStaff />}>
      <Route path="fichas/add" element={<FichaAdd />} />
      <Route path="fichas/:id/edit" element={<FichaEdit />} />
    </Route>
  </>
);
