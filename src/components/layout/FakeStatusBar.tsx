import { Box } from "@mui/material";
import useAuth from "hooks/useAuth";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
    BLOCKED_BACKGROUND,
    readAppChromeColor,
    setThemeColor,
    STATUS_BAR_AUTH,
    STATUS_BAR_GUEST,
} from "utils/app-chrome";
import { BRAND_STRIPE_GRADIENT } from "utils/brand-stripe";

type ChromeMode = "page" | "blocked";

export const SAFE_AREA_TOP = "env(safe-area-inset-top, 0px)";

type FakeStatusBarProps = {
  /** `true` = faixas do cubo; `false` = cor sólida. */
  cube?: boolean;
  /** Cor sólida quando `cube={false}` (ex.: `#FFFFFF` no guest). */
  color?: string;
  /** Se presente/`true`, não renderiza (login/install pintam a barra). */
  hidden?: boolean;
};

/**
 * Faixa na safe-area (iOS black-translucent) + sync de `theme-color` (Android).
 * Logado: some o overlay; tint Safari 26+ vem do UserBar (`STATUS_BAR_AUTH`).
 */
export default function FakeStatusBar({ cube = false, color, hidden }: FakeStatusBarProps) {
  const { isAuthenticated, accountBlocked } = useAuth();
  const [mode, setMode] = useState<ChromeMode>(() =>
    typeof document !== "undefined" && readAppChromeColor() === BLOCKED_BACKGROUND
      ? "blocked"
      : "page",
  );

  useEffect(() => {
    const onChrome = (event: Event) => {
      const detail = (event as CustomEvent<{ color?: string; mode?: ChromeMode }>).detail;
      if (detail?.mode === "blocked" || detail?.color === BLOCKED_BACKGROUND) {
        setMode("blocked");
        return;
      }
      setMode("page");
    };
    window.addEventListener("app:chrome-color", onChrome);
    return () => window.removeEventListener("app:chrome-color", onChrome);
  }, []);

  // Android theme-color + iOS ícones (branco no vermelho / auto no guest).
  useEffect(() => {
    if (hidden) return;
    if (accountBlocked || mode === "blocked") {
      setThemeColor(BLOCKED_BACKGROUND, "light");
      return;
    }
    if (isAuthenticated) {
      setThemeColor(STATUS_BAR_AUTH, "light");
      return;
    }
    setThemeColor(color ?? STATUS_BAR_GUEST, "dark");
  }, [hidden, isAuthenticated, accountBlocked, mode, color]);

  if (hidden) {
    return null;
  }

  if (isAuthenticated && !accountBlocked) {
    return null;
  }

  const solid =
    accountBlocked || mode === "blocked"
      ? BLOCKED_BACKGROUND
      : (color ?? STATUS_BAR_GUEST);

  return (
    <Box
      component="div"
      role="presentation"
      aria-hidden
      data-fake-status-bar
      data-cube={cube ? "true" : "false"}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100vw",
        maxWidth: "100%",
        // Safari 26 amostra fixed ≥3px; em aba safe-area costuma ser 0.
        height: `max(${SAFE_AREA_TOP}, 3px)`,
        margin: 0,
        padding: 0,
        zIndex: 10000,
        pointerEvents: "none",
        boxSizing: "border-box",
        backgroundColor: cube ? undefined : solid,
        backgroundImage: cube ? BRAND_STRIPE_GRADIENT : "none",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
      }}
    />
  );
}

/** Empurra o conteúdo abaixo da safe-area (só quando FakeStatusBar está ativa). */
export function AppSafeArea({ children }: { children: ReactNode }) {
  const { isAuthenticated, accountBlocked } = useAuth();
  const { pathname } = useLocation();
  const isAuthChrome = pathname === "/login" || pathname === "/install" || pathname.endsWith("/login") || pathname.endsWith("/install");
  const padTop = !isAuthChrome && (!isAuthenticated || Boolean(accountBlocked));

  return (
    <Box
      data-app-safe-area
      sx={{
        width: "100%",
        minHeight: "100dvh",
        boxSizing: "border-box",
        paddingTop: padTop ? SAFE_AREA_TOP : 0,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      {children}
    </Box>
  );
}
