import axios from "axios";
import jwtDecode from "jwt-decode";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
    abortInFlightApiRequests,
    ACCESS_TOKEN_KEY,
    api,
    HTTP_RESPONSE,
    REFRESH_TOKEN_KEY,
    tryRefreshAccessToken,
} from "services/api";
import { canPersistSession } from "utils/session-persist";

export type User = {
  id: number;
  nivel: number;
  email: string;
  session_id: string;
  academia_id?: number;
  academia_slug?: string;
  iat?: number;
  exp?: number;
};

export type LoginData = {
  email: string;
  senha: string;
  academia_slug?: string;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  accountBlocked: boolean;
  isLoading: boolean;
  sessionLocked: boolean;
  logIn: (data: LoginData) => Promise<HTTP_RESPONSE>;
  renewSession: (senha: string) => Promise<HTTP_RESPONSE>;
  logOut: () => Promise<void>;
  logOutLocal: () => void;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function clearFullSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  delete api.defaults.headers.Authorization;
}

function clearAccessSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  delete api.defaults.headers.Authorization;
}

function applySessionToken(accessToken: string): User {
  const decoded = jwtDecode<User>(accessToken);
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  api.defaults.headers.Authorization = `Bearer ${accessToken}`;
  window.dispatchEvent(new Event("auth:token"));
  return decoded;
}

function decodeStoredUser(): User | null {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;
  try {
    const decoded = jwtDecode<User>(accessToken);
    return decoded.email ? decoded : null;
  } catch {
    return null;
  }
}

function loginErrorResponse(error: unknown): HTTP_RESPONSE {
  if (!axios.isAxiosError(error) || !error.response) {
    return {
      status: 500,
      message: "Não foi possível conectar à API.",
    };
  }

  const httpStatus = error.response.status ?? 500;
  const data = error.response.data as { message?: string | string[] } | string | undefined;
  const apiMessage =
    data && typeof data === "object" && "message" in data
      ? Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message
      : undefined;

  return {
    status: httpStatus,
    message: apiMessage ?? "Erro ao entrar",
  };
}

function isAccessTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<User>(token);
    return (decoded.exp ?? 0) * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionLocked, setSessionLocked] = useState(false);

  const logOutLocal = useCallback(() => {
    abortInFlightApiRequests();
    setSessionLocked(false);
    setUser(null);
    clearAccessSession();
  }, []);

  const logOut = useCallback(async () => {
    abortInFlightApiRequests();
    try {
      await api.post("auth/logout");
    } catch {
      // local logout even if API fails
    }
    setSessionLocked(false);
    setUser(null);
    clearFullSession();
    window.dispatchEvent(new Event("auth:logout"));
  }, []);

  const applyLoginTokens = useCallback((accessToken: string, refreshToken?: string) => {
    applySessionToken(accessToken);
    if (canPersistSession() && refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    setUser(jwtDecode<User>(accessToken));
    setSessionLocked(false);
  }, []);

  const logIn = useCallback(
    async ({ email, senha, academia_slug }: LoginData): Promise<HTTP_RESPONSE> => {
      abortInFlightApiRequests();
      try {
        const persist = canPersistSession();
        const response = await api.post("auth/login", {
          email,
          senha,
          ...(academia_slug ? { academia_slug } : {}),
          persist,
        });
        const { access_token, refresh_token } = response.data as {
          access_token: string;
          refresh_token?: string;
        };
        applyLoginTokens(access_token, refresh_token);
        return { status: 200, message: "Sucesso!", data: response.data };
      } catch (error: unknown) {
        clearFullSession();
        setSessionLocked(false);
        setUser(null);
        abortInFlightApiRequests();
        return loginErrorResponse(error);
      }
    },
    [applyLoginTokens],
  );

  const renewSession = useCallback(
    async (senha: string): Promise<HTTP_RESPONSE> => {
      const email = user?.email;
      if (!email) {
        return { status: 401, message: "Sessão expirada." };
      }
      try {
        const persist = canPersistSession();
        const response = await api.post("auth/login", {
          email,
          senha,
          ...(user.academia_slug ? { academia_slug: user.academia_slug } : {}),
          persist,
        });
        const { access_token, refresh_token } = response.data as {
          access_token: string;
          refresh_token?: string;
        };
        applyLoginTokens(access_token, refresh_token);
        return { status: 200, message: "Sucesso!", data: response.data };
      } catch (error: unknown) {
        return loginErrorResponse(error);
      }
    },
    [applyLoginTokens, user],
  );

  useEffect(() => {
    function onExpired() {
      abortInFlightApiRequests();
      setUser((current) => current ?? decodeStoredUser());
      setSessionLocked(true);
    }
    window.addEventListener("auth:session-expired", onExpired);
    return () => window.removeEventListener("auth:session-expired", onExpired);
  }, []);

  useEffect(() => {
    let cancelled = false;

    function finishLoading() {
      if (!cancelled) setIsLoading(false);
    }

    async function restoreSession() {
      try {
        let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const tokenMissingOrExpired = !accessToken || isAccessTokenExpired(accessToken);

        if (tokenMissingOrExpired && canPersistSession()) {
          const refreshed = await tryRefreshAccessToken();
          if (refreshed) accessToken = refreshed;
        }

        if (accessToken && !isAccessTokenExpired(accessToken)) {
          api.defaults.headers.Authorization = `Bearer ${accessToken}`;
          setUser(jwtDecode<User>(accessToken));
          setSessionLocked(false);
          return;
        }

        const stored = decodeStoredUser();
        if (stored) {
          setUser(stored);
          setSessionLocked(true);
          return;
        }

        if (tokenMissingOrExpired && canPersistSession() && localStorage.getItem(REFRESH_TOKEN_KEY)) {
          clearFullSession();
        } else {
          clearAccessSession();
        }
        setSessionLocked(false);
        setUser(null);
      } catch {
        clearFullSession();
        setSessionLocked(false);
        setUser(null);
      } finally {
        finishLoading();
      }
    }

    const safetyTimer = window.setTimeout(finishLoading, 6_000);
    void restoreSession().finally(() => window.clearTimeout(safetyTimer));

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimer);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      accountBlocked: false,
      isLoading,
      sessionLocked,
      logIn,
      renewSession,
      logOut,
      logOutLocal,
    }),
    [user, isLoading, sessionLocked, logIn, renewSession, logOut, logOutLocal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
