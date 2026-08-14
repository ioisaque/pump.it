import useAuth from "hooks/useAuth";
import { useLocation, useParams } from "react-router-dom";
import { academiaSlugFromPath } from "utils/link";

/** Prefixo de path multi-academia: `/:academiaSlug` ou `""` (plataforma). */
export default function useTenantBase() {
  const { academiaSlug: paramSlug } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const academiaSlug = paramSlug || academiaSlugFromPath(pathname) || user?.academia_slug;
  const base = academiaSlug ? `/${academiaSlug}` : "";
  return { academiaSlug, base };
}
