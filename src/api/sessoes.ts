import { api } from "services/api";

export function pingSessao(payload?: { device?: string }) {
  return api.post("sessoes/ping", payload ?? { device: navigator.userAgent });
}
