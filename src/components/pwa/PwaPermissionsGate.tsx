import { Alert, Backdrop, Box, Button, CircularProgress, Typography } from "@mui/material";
import Icon from "components/Icon";
import { usePushNotifications } from "hooks/usePushNotifications";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { PAGE_BACKGROUND } from "utils/app-chrome";
import { isPwaStandalone } from "utils/pwa-install";

function detectPushSupport() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function needsNotificationPermission() {
  return detectPushSupport() && Notification.permission !== "granted";
}

export default function PwaPermissionsGate({ children }: { children: ReactNode }) {
  const { enablePush } = usePushNotifications();
  const [pending, setPending] = useState<boolean | null>(null);
  const [notificationDenied, setNotificationDenied] = useState(false);

  const refresh = useCallback(() => {
    if (!isPwaStandalone()) {
      setPending(false);
      return;
    }
    setPending(needsNotificationPermission());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refresh]);

  useEffect(() => {
    if (!isPwaStandalone() || !pending) return;

    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = PAGE_BACKGROUND;
    document.body.style.backgroundColor = PAGE_BACKGROUND;

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, [pending]);

  if (!isPwaStandalone()) {
    return <>{children}</>;
  }

  if (pending === null) {
    return (
      <Backdrop
        open
        sx={{
          color: "primary.main",
          backgroundColor: PAGE_BACKGROUND,
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!pending) {
    return <>{children}</>;
  }

  async function handleActivate() {
    await enablePush();
    if (Notification.permission === "granted") {
      setNotificationDenied(false);
      refresh();
    } else {
      setNotificationDenied(true);
    }
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: PAGE_BACKGROUND,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Box sx={{ textAlign: "center", width: "100%", maxWidth: 350, px: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Icon name="notifications" width={120} height={120} color="warning.main" />
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Ative as notificações
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Receba avisos da academia neste dispositivo. O envio continua via notify.it.
        </Typography>
        {notificationDenied && (
          <Alert severity="warning" sx={{ mb: 2, textAlign: "left" }}>
            Permissão negada. Abra as configurações do dispositivo e permita notificações para este
            app.
          </Alert>
        )}
        <Button
          type="button"
          fullWidth
          variant="contained"
          color="success"
          onClick={() => void handleActivate()}
          sx={{ py: 1.5 }}
        >
          Ativar notificações
        </Button>
      </Box>
    </Box>
  );
}
