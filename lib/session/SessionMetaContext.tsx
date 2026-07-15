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
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import type { AmbientLighting, SessionMeta } from "@/lib/types";

type SessionForm = {
  hoursSinceWaking?: number;
  sleepHoursLastNight?: number;
  caffeineMgToday?: number;
  screenTimeHoursToday?: number;
  ambientLighting?: AmbientLighting;
  fatigueSelfRating?: number;
  notes?: string;
};

type SessionContextValue = {
  session: SessionMeta | null;
  loading: boolean;
  startSession: (form: SessionForm) => Promise<SessionMeta>;
  endSession: () => Promise<void>;
  ensureSession: () => Promise<SessionMeta>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionMetaProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const settings = await dbApi.getSettings();
    if (settings.activeSessionId) {
      const s = await dbApi.getSession(settings.activeSessionId);
      setSession(s ?? null);
    } else {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    refresh()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refresh]);

  const startSession = useCallback(async (form: SessionForm) => {
    const meta: SessionMeta = {
      id: createId(),
      startedAt: new Date().toISOString(),
      ...form,
    };
    await dbApi.putSession(meta);
    const settings = await dbApi.getSettings();
    await dbApi.putSettings({
      ...settings,
      activeSessionId: meta.id,
      moduleBConsentSessionId: undefined,
    });
    setSession(meta);
    return meta;
  }, []);

  const endSession = useCallback(async () => {
    if (!session) return;
    const ended: SessionMeta = {
      ...session,
      endedAt: new Date().toISOString(),
    };
    await dbApi.putSession(ended);
    const settings = await dbApi.getSettings();
    await dbApi.putSettings({
      ...settings,
      activeSessionId: undefined,
      moduleBConsentSessionId: undefined,
    });
    setSession(null);
  }, [session]);

  const ensureSession = useCallback(async () => {
    if (session) return session;
    return startSession({});
  }, [session, startSession]);

  const value = useMemo(
    () => ({
      session,
      loading,
      startSession,
      endSession,
      ensureSession,
      refresh,
    }),
    [session, loading, startSession, endSession, ensureSession, refresh],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionMeta(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSessionMeta must be used within SessionMetaProvider");
  }
  return ctx;
}
