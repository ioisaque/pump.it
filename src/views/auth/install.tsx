import { Box, Button, Container, Typography, useMediaQuery } from "@mui/material";
import Icon from "components/Icon";
import { SAFE_AREA_TOP } from "components/layout/FakeStatusBar";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { applyAppChrome, applyPageChrome } from "utils/app-chrome";
import { LINK } from "utils/link";
import { BRAND_STRIPE_GRADIENT } from "utils/brand-stripe";
import { DISMISS_KEY, isIosDevice, isIosSafari, shouldShowInstallGate } from "utils/pwa-install";
import logoDark from "assets/imgs/logos/logo-dark.svg";
import logoLight from "assets/imgs/logos/logo-light.svg";

const ACCENT = "#33CC66";

function IosMoreIcon({ size = 17 }: { size?: number }) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width={size}
      height={size}
      aria-hidden
      sx={{ display: "inline-block", verticalAlign: "middle", mx: 0.35, flexShrink: 0 }}
    >
      <circle fill="currentColor" cx="9" cy="25" r="4" />
      <circle fill="currentColor" cx="25" cy="25" r="4" />
      <circle fill="currentColor" cx="41" cy="25" r="4" />
    </Box>
  );
}

function IosShareIcon({ size = 17 }: { size?: number }) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width={size}
      height={size}
      aria-hidden
      sx={{ display: "inline-block", verticalAlign: "middle", mx: 0.35, flexShrink: 0 }}
    >
      <path fill="currentColor" d="M30.3 13.7 25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z" />
      <path fill="currentColor" d="M24 7h2v21h-2z" />
      <path
        fill="currentColor"
        d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z"
      />
    </Box>
  );
}

function IosInstallHint({ textMuted, boxBg }: { textMuted: string; boxBg: string }) {
  const safari = isIosSafari();
  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: 360,
          textAlign: "left",
          bgcolor: boxBg,
          borderRadius: 2,
          px: 2,
          py: 1.75,
          mb: 1.5,
        }}
      >
        {!safari ? (
          <Typography variant="body2" sx={{ color: textMuted, lineHeight: 1.6 }}>
            No iPhone/iPad, abra este site no <strong>Safari</strong> para instalar o app.
          </Typography>
        ) : (
          <Box component="ol" sx={{ m: 0, pl: 2.25, color: textMuted, "& li": { mb: 1, lineHeight: 1.5 } }}>
            <Typography component="li" variant="body2">
              Toque em <IosMoreIcon /> no canto inferior direito
            </Typography>
            <Typography component="li" variant="body2">
              Toque em <IosShareIcon /> <strong>Compartilhar</strong>
            </Typography>
            <Typography component="li" variant="body2">
              Role e toque em <strong>Adicionar à Tela de Início</strong>
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: "0 !important" }}>
              Confirme em <strong>Adicionar</strong>
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}

export default function InstallPage() {
  const navigate = useNavigate();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [deferred, setDeferred] = useState<NonNullable<Window["__pwaDeferredInstall"]> | null>(null);

  const bg = prefersDark ? "#000000" : "#FFFFFF";
  const text = prefersDark ? "#FFFFFF" : "#1a1a1a";
  const textMuted = prefersDark ? "rgba(255,255,255,0.72)" : "rgba(26,26,26,0.72)";
  const ignoreColor = prefersDark ? "rgba(255,255,255,0.65)" : "rgba(26,26,26,0.65)";
  const ignoreHover = prefersDark ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.06)";
  const logo = prefersDark ? logoLight : logoDark;
  const hintBoxBg = prefersDark ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.05)";
  const onIos = isIosDevice();
  const loginTo = LINK("/login");

  useLayoutEffect(() => {
    applyAppChrome(bg, "page", bg, prefersDark ? "light" : "dark");
    return () => {
      applyPageChrome();
    };
  }, [bg, prefersDark]);

  useEffect(() => {
    const adopt = (event: NonNullable<Window["__pwaDeferredInstall"]>) => {
      setDeferred(event);
    };

    if (window.__pwaDeferredInstall) {
      adopt(window.__pwaDeferredInstall);
    }

    const onDeferred = () => {
      if (window.__pwaDeferredInstall) adopt(window.__pwaDeferredInstall);
    };

    window.addEventListener("pwa:deferred-install", onDeferred);
    return () => window.removeEventListener("pwa:deferred-install", onDeferred);
  }, []);

  const goLogin = useCallback(() => {
    navigate(loginTo, { replace: true });
  }, [navigate, loginTo]);

  const dismissToLogin = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDeferred(null);
    window.__pwaDeferredInstall = undefined;
    goLogin();
  }, [goLogin]);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    window.__pwaDeferredInstall = undefined;
    if (choice.outcome === "accepted") {
      sessionStorage.setItem(DISMISS_KEY, "1");
      goLogin();
    }
  }, [deferred, goLogin]);

  if (!shouldShowInstallGate()) {
    return <Navigate to={loginTo} replace />;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: bg,
        color: text,
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        data-fake-status-bar
        data-cube="true"
        sx={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
          width: "100%",
          height: SAFE_AREA_TOP,
          backgroundImage: BRAND_STRIPE_GRADIENT,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          px: 2,
        }}
      >
        <Container
          component="main"
          maxWidth="sm"
          sx={{
            textAlign: "center",
            py: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="pump.it"
            sx={{ width: "100%", maxWidth: 280, display: "block", mb: 2, px: 3 }}
          />
          <Typography
            variant="body1"
            sx={{ color: textMuted, lineHeight: 1.6, mt: 0, mb: 3, textAlign: "center", maxWidth: 360 }}
          >
            Instale o app e fique conectado!
          </Typography>

          {onIos ? (
            <IosInstallHint textMuted={textMuted} boxBg={hintBoxBg} />
          ) : (
            <Button
              variant="contained"
              onClick={() => void install()}
              disabled={!deferred}
              startIcon={<Icon name="mdi:download-outline" width={22} />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.25,
                mb: 1.5,
                bgcolor: ACCENT,
                color: "#fff",
                boxShadow: "none",
                "&:hover": { bgcolor: "#34c47a", boxShadow: "none" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(61, 216, 137, 0.4)",
                  color: "#fff",
                },
              }}
            >
              Instalar app
            </Button>
          )}

          <Box>
            <Button
              onClick={dismissToLogin}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: ignoreColor,
                "&:hover": { bgcolor: ignoreHover },
              }}
            >
              Ignorar por agora
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
