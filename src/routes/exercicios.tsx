import { RequireStaff } from "components/auth/RequireAuth";
import { lazy } from "react";
import { Route } from "react-router-dom";

const ExerciciosList = lazy(() => import("views/exercicios/list"));
const ExercicioAdd = lazy(() => import("views/exercicios/add"));
const ExercicioEdit = lazy(() => import("views/exercicios/edit"));

export const exerciciosRoutes = (
  <>
    <Route path="exercicios" element={<ExerciciosList />} />
    <Route element={<RequireStaff />}>
      <Route path="exercicios/add" element={<ExercicioAdd />} />
      <Route path="exercicios/:id" element={<ExercicioEdit />} />
    </Route>
  </>
);
