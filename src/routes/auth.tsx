import { lazy } from "react";
import { Route } from "react-router-dom";

const SignIn = lazy(() => import("views/auth/signin"));

export const authRoutes = (
  <>
    <Route path="/login" element={<SignIn />} />
    <Route path="/:academiaSlug/login" element={<SignIn />} />
  </>
);
