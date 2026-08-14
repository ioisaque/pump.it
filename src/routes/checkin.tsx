import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { LINK } from "utils/link";

const WorkoutAdd = lazy(() => import("views/checkin/index"));
const WorkoutCarousel = lazy(() => import("views/fichas/treino"));
const WorkoutEnd = lazy(() => import("views/checkin/resumo"));
const WorkoutsList = lazy(() => import("views/checkin/list"));

function RedirectWorkoutAdd() {
  return <Navigate to={LINK("/workout/add")} replace />;
}

export const checkinRoutes = (
  <>
    <Route path="workouts" element={<WorkoutsList />} />
    <Route path="workout/add" element={<WorkoutAdd />} />
    <Route path="workout/:id/end" element={<WorkoutEnd />} />
    <Route path="workout" element={<RedirectWorkoutAdd />} />
    <Route path="workout/:id" element={<WorkoutCarousel />} />
    <Route path="checkin/resumo" element={<RedirectWorkoutAdd />} />
    <Route path="checkin" element={<RedirectWorkoutAdd />} />
  </>
);
