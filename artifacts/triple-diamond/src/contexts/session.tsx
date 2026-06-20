import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { authService, type AuthUser } from "@/services/auth.service";
import { decodeJwt, isTokenExpired } from "@/lib/jwt";

interface SessionContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshSession: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();
  const refreshTimerRef = useRef<number | null>(null);

  const refreshSession = useCallback(() => {
    setUser(authService.getUser());
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    const token = authService.getToken();
    if (!token) return;
    const decoded = decodeJwt(token);
    if (!decoded?.exp) return;

    const expiresInMs = decoded.exp * 1000 - Date.now();
    const delay = Math.max(0, expiresInMs - REFRESH_BUFFER_MS);

    refreshTimerRef.current = window.setTimeout(async () => {
      const newToken = await authService.refresh().catch(() => null);
      if (newToken) {
        scheduleRefresh();
      }
    }, delay);
  }, []);

  useEffect(() => {
    const token = authService.getToken();
    if (token && isTokenExpired(token)) {
      authService.logout();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      scheduleRefresh();
    }
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [user, scheduleRefresh]);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "auth_token") {
        refreshSession();
      }
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth:unauthorized", onUnauthorized);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshSession]);

  const value = useMemo<SessionContextValue>(
    () => ({ user, loading, refreshSession, logout }),
    [user, loading, refreshSession, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
