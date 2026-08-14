import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type PushStatus = "unsupported" | "default" | "denied" | "subscribed" | "loading";

function detectPushSupport() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Lightweight push gate for pump.it.
 * Requests browser notification permission; does not invent a carteiro —
 * notify.it remains the carrier. Subscribe endpoints are absent on pump API,
 * so granted permission alone counts as activated for the PWA gate.
 */
export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>(() => {
    if (!detectPushSupport()) return "unsupported";
    if (Notification.permission === "granted") return "subscribed";
    return Notification.permission;
  });

  const enablePush = useCallback(async () => {
    if (!detectPushSupport()) {
      toast.error("Este navegador não suporta notificações push.");
      setStatus("unsupported");
      return;
    }

    setStatus("loading");

    try {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setStatus("denied");
        toast.error("Permissão de notificação negada.");
        return;
      }

      if ("serviceWorker" in navigator) {
        try {
          const swUrl = `${import.meta.env.BASE_URL}sw.js`;
          await navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL });
          await navigator.serviceWorker.ready;
        } catch {
          // SW optional — permission is enough for the gate
        }
      }

      setStatus("subscribed");
      toast.success("Notificações ativadas neste dispositivo.");
    } catch (error) {
      console.error("[push]", error);
      setStatus(Notification.permission === "granted" ? "subscribed" : Notification.permission);
      toast.error(error instanceof Error ? error.message : "Falha ao ativar notificações.");
    }
  }, []);

  return useMemo(() => ({ status, enablePush }), [status, enablePush]);
}
