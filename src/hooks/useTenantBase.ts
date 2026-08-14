import { useParams } from "react-router-dom";

/** Prefixo de path multi-academia: `/:academiaSlug` ou `""` (plataforma). */
export default function useTenantBase() {
  const { academiaSlug } = useParams();
  const base = academiaSlug ? `/${academiaSlug}` : "";
  return { academiaSlug, base };
}
