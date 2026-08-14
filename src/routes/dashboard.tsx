import { lazy } from "react";
import { Route } from "react-router-dom";

const MainDashboard = lazy(() => import("views/dash"));

export const dashboardRoutes = <Route index element={<MainDashboard />} />;
