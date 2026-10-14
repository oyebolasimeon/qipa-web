"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, ApiRequestError, setActiveToken } from "./api";
import type { AuthSession, OrganizationKind } from "./types";

const TOKEN_KEY = "qipa_token";
const SESSION_KEY = "qipa_session";

function parseCachedSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed.user || !parsed.organization || !parsed.membership) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    organizationKind: OrganizationKind;
    operatorType?: "LANDLORD" | "MAINTENANCE_COMPANY";
  }) => Promise<void>;
  signOut: () => void;
  deleteAccount: () => Promise<void>;
  establishSession: (next: AuthSession) => void;
  refreshSession: () => Promise<void>;
  applySessionProfile: (profile: {
    user: AuthSession["user"];
    organization: AuthSession["organization"];
    membership: AuthSession["membership"];
  }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = (next: AuthSession | null) => {
    setActiveToken(next?.token);
    if (next?.token) {
      localStorage.setItem(TOKEN_KEY, next.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const cached = parseCachedSession(localStorage.getItem(SESSION_KEY));
    const restoreToken = token ?? cached?.token;
    if (cached?.token) {
      setActiveToken(cached.token);
      setSession(cached);
    }
    if (!restoreToken) {
      persistAuth(null);
      setSession(null);
      return;
    }
    try {
      const me = await apiRequest<{
        user: AuthSession["user"];
        organization: AuthSession["organization"];
        membership: AuthSession["membership"];
      }>("/api/auth/me", { token: restoreToken });
      const next = { token: restoreToken, ...me };
      setSession(next);
      persistAuth(next);
    } catch (err) {
      const status = err instanceof ApiRequestError ? err.status : 0;
      if (status === 401 || status === 403) {
        persistAuth(null);
        setSession(null);
      }
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<AuthSession>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    persistAuth(result);
    setSession(result);
  }, []);

  const signUp = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      organizationName: string;
      organizationKind: OrganizationKind;
      operatorType?: "LANDLORD" | "MAINTENANCE_COMPANY";
    }) => {
      const result = await apiRequest<AuthSession>("/api/auth/register", {
        method: "POST",
        body: input,
      });
      persistAuth(result);
      setSession(result);
    },
    [],
  );

  const establishSession = useCallback((next: AuthSession) => {
    persistAuth(next);
    setSession(next);
  }, []);

  const signOut = useCallback(() => {
    persistAuth(null);
    setSession(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    const token = session?.token ?? localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Sign in again before deleting this account");
    await apiRequest("/api/auth/me", { method: "DELETE", token });
    persistAuth(null);
    setSession(null);
  }, [session?.token]);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      establishSession,
      refreshSession,
    }),
    [session, isLoading, signIn, signUp, signOut, deleteAccount, establishSession, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
