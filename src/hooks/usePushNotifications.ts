import { getNotifyVapidPublicKey } from "api/integracoes";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type PushStatus = "unsupported" | "default" | "denied" | "subscribed" | "loading";

function detectPushSupport() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function ensurePushSubscription(registration: ServiceWorkerRegistration) {
  const { publicKey } = await getNotifyVapidPublicKey();
  if (!publicKey) return;
  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  const existing = await registration.pushManager.getSubscription();
  if (existing) return;
  await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
}

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

    try {
      let permission = Notification.permission;
      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        setStatus("denied");
        toast.error("Permissão de notificação negada.");
        return;
      }

      setStatus("loading");
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: import.meta.env.BASE_URL,
      });
      await navigator.serviceWorker.ready;
      try {
        await ensurePushSubscription(registration);
      } catch {
        /* VAPID/notify pode falhar; permissão do SO já foi concedida */
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
