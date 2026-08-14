import { Backdrop, CircularProgress } from "@mui/material";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import useTenantBase from "hooks/useTenantBase";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/** Segmentos de rota na raiz (sem academiaSlug). */
const ROOT_SEGMENTS = new Set([
  "login",
  "install",
  "plataforma",
  "pessoas",
  "exercicios",
  "fichas",
  "avaliacoes",
  "acessos",
  "checkin",
  "mensalidades",
  "tabelas",
  "notificacoes",
  "configuracoes",
  "sistema",
]);

function loginPathFromLocation(pathname: string) {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg && !ROOT_SEGMENTS.has(seg)) {
    return `/${seg}/login`;
  }
  return "/login";
}

export default function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Backdrop open sx={{ color: "primary.main", backgroundColor: "#f4f1e6", zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPathFromLocation(location.pathname)} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/** Bloqueia cliente (aluno) — staff, admin e master passam. */
export function RequireStaff() {
  const { user, isLoading } = useAuth();
  const { base } = useTenantBase();

  if (isLoading) {
    return (
      <Backdrop open sx={{ color: "primary.main", backgroundColor: "#f4f1e6", zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if ((user?.nivel ?? 0) <= ALUNO_NIVEL_MAX) {
    return <Navigate to={base || "/"} replace />;
  }

  return <Outlet />;
}
