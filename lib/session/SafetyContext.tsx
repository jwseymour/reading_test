"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NEUTRAL_GREY, SESSION_NUDGE_MS } from "./safety";

type SafetyContextValue = {
  stopped: boolean;
  stop: () => void;
  clearStop: () => void;
  neutralGrey: string;
  sessionStartedAt: number | null;
  markSessionActivity: () => void;
  showSessionNudge: boolean;
  dismissSessionNudge: () => void;
};

const SafetyContext = createContext<SafetyContextValue | null>(null);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [stopped, setStopped] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [nudgeDismissedAt, setNudgeDismissedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(0);

  const stop = useCallback(() => {
    setStopped(true);
  }, []);

  const clearStop = useCallback(() => {
    setStopped(false);
  }, []);

  const markSessionActivity = useCallback(() => {
    setSessionStartedAt((prev) => prev ?? Date.now());
    // Refresh nudge evaluation periodically via tick when activity happens
    setNowTick(Date.now());
  }, []);

  const dismissSessionNudge = useCallback(() => {
    setNudgeDismissedAt(Date.now());
  }, []);

  const showSessionNudge = useMemo(() => {
    if (sessionStartedAt == null) return false;
    const elapsed = (nowTick || Date.now()) - sessionStartedAt;
    if (elapsed < SESSION_NUDGE_MS) return false;
    if (nudgeDismissedAt != null && nudgeDismissedAt >= sessionStartedAt) {
      return false;
    }
    return true;
  }, [sessionStartedAt, nudgeDismissedAt, nowTick]);

  const value = useMemo(
    () => ({
      stopped,
      stop,
      clearStop,
      neutralGrey: NEUTRAL_GREY,
      sessionStartedAt,
      markSessionActivity,
      showSessionNudge,
      dismissSessionNudge,
    }),
    [
      stopped,
      stop,
      clearStop,
      sessionStartedAt,
      markSessionActivity,
      showSessionNudge,
      dismissSessionNudge,
    ],
  );

  return (
    <SafetyContext.Provider value={value}>{children}</SafetyContext.Provider>
  );
}

export function useSafety(): SafetyContextValue {
  const ctx = useContext(SafetyContext);
  if (!ctx) {
    throw new Error("useSafety must be used within SafetyProvider");
  }
  return ctx;
}
