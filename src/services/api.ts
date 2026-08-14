import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { canPersistSession } from "utils/session-persist";

export const ACCESS_TOKEN_KEY = "@Pump:JWT";
export const REFRESH_TOKEN_KEY = "@Pump:Refresh";

export type HTTP_RESPONSE = {
  status: number;
  data?: unknown;
  message?: string;
};

export function apiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/`;
  }
  return import.meta.env.VITE_API_URL || "/api/";
}

/** Origin only (no trailing `/api`) — used for absolute foto URLs. */
export function apiOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const base = import.meta.env.VITE_API_URL || "";
  return base.replace(/\/api\/?$/, "") || "";
}

export const api = axios.create({
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

let inFlightAbort = new AbortController();

function renewInFlightAbort() {
  inFlightAbort.abort();
  inFlightAbort = new AbortController();
}

export function abortInFlightApiRequests() {
  renewInFlightAbort();
}

const ROOT_PATH_SEGMENTS = new Set([
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
  "api",
]);

function academiaSlugFromLocation(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  if (!seg || ROOT_PATH_SEGMENTS.has(seg)) return undefined;
  return seg;
}

api.interceptors.request.use((config) => {
  config.baseURL = apiBaseUrl();
  if (!config.signal) {
    config.signal = inFlightAbort.signal;
  }
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  const slug = academiaSlugFromLocation();
  const params = config.params as Record<string, unknown> | undefined;
  if (slug && !params?.academia_slug) {
    config.params = { ...params, academia_slug: slug };
  }
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

export async function tryRefreshAccessToken(): Promise<string | null> {
  if (!canPersistSession()) return null;
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { data } = await axios.post<{ access_token: string }>(
          `${apiBaseUrl()}auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" }, timeout: 20_000 },
        );
        const accessToken = data.access_token;
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        window.dispatchEvent(new Event("auth:token"));
        return accessToken;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry && canPersistSession()) {
      original._retry = true;
      const refreshed = await tryRefreshAccessToken();
      if (refreshed) {
        original.headers.Authorization = `Bearer ${refreshed}`;
        return api.request(original);
      }
    }
    return Promise.reject(error);
  },
);
