import { Backdrop, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findAcademia } from "api/academias";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LINK, ROOT_SEGMENTS } from "utils/link";

function pathForBoundAcademia(ownSlug: string, pathname: string, search: string) {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  if (first === ownSlug) return null;
  if (first && !ROOT_SEGMENTS.has(first)) {
    const rest = parts.slice(1).join("/");
    return `/${ownSlug}${rest ? `/${rest}` : ""}${search}`;
  }
  if (!first || first === "plataforma") {
    return `/${ownSlug}${search}`;
  }
  return `/${ownSlug}/${parts.join("/")}${search}`;
}

export default function RequireAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const boundId = Number(user?.academia_id);
  const bound = Number.isFinite(boundId) && boundId > 0;

  const { data: academia, isLoading: loadingAcademia } = useQuery({
    queryKey: ["academia", "self", boundId],
    queryFn: () => findAcademia(boundId),
    enabled: isAuthenticated && bound && !user?.academia_slug,
    staleTime: Infinity,
  });

  if (isLoading || (bound && !user?.academia_slug && loadingAcademia)) {
    return (
      <Backdrop open sx={{ color: "primary.main", backgroundColor: "#f4f1e6", zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={LINK("/login")} state={{ from: location }} replace />;
  }

  const ownSlug = user?.academia_slug || academia?.academia.slug;
  if (bound && ownSlug) {
    const next = pathForBoundAcademia(ownSlug, location.pathname, location.search);
    if (next) return <Navigate to={next} replace />;
  }

  return <Outlet />;
}

/** Bloqueia cliente (aluno) — staff, admin e master passam. */
export function RequireStaff() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Backdrop open sx={{ color: "primary.main", backgroundColor: "#f4f1e6", zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if ((user?.nivel ?? 0) <= ALUNO_NIVEL_MAX) {
    return <Navigate to={LINK("/")} replace />;
  }

  return <Outlet />;
}
