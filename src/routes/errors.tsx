import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

const E400 = lazy(() => import("views/error/400"));
const E401 = lazy(() => import("views/error/401"));
const E402 = lazy(() => import("views/error/402"));
const E403 = lazy(() => import("views/error/403"));
const E404 = lazy(() => import("views/error/404"));
const E500 = lazy(() => import("views/error/500"));
const E501 = lazy(() => import("views/error/501"));
const E503 = lazy(() => import("views/error/503"));

export const errorRoutes = (
  <>
    <Route path="/400" element={<E400 />} />
    <Route path="/401" element={<E401 />} />
    <Route path="/402" element={<E402 />} />
    <Route path="/403" element={<E403 />} />
    <Route path="/404" element={<E404 />} />
    <Route path="/500" element={<E500 />} />
    <Route path="/501" element={<E501 />} />
    <Route path="/503" element={<E503 />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </>
);
