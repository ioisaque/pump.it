import { lazy } from "react";
import { Route } from "react-router-dom";

const CheckinDia = lazy(() => import("views/checkin/index"));
const CheckinResumo = lazy(() => import("views/checkin/resumo"));

export const checkinRoutes = (
  <>
    <Route path="checkin" element={<CheckinDia />} />
    <Route path="checkin/resumo" element={<CheckinResumo />} />
  </>
);
