import { lazy } from "react";
import { Route } from "react-router-dom";

const AnamneseWizard = lazy(() => import("views/anamneses/wizard"));

export const anamnesesRoutes = <Route path="anamnese" element={<AnamneseWizard />} />;
