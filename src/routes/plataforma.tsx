import { lazy } from "react";
import { Route } from "react-router-dom";

const AcademiasPage = lazy(() => import("views/plataforma/academias"));
const AcademiaAddPage = lazy(() => import("views/plataforma/academia-add"));
const AcademiaEditPage = lazy(() => import("views/plataforma/academia-edit"));

export const plataformaRoutes = (
  <Route path="plataforma">
    <Route path="academias" element={<AcademiasPage />} />
    <Route path="academias/add" element={<AcademiaAddPage />} />
    <Route path="academias/:id/edit" element={<AcademiaEditPage />} />
  </Route>
);
