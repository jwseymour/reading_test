"use client";

import { useEffect, useState } from "react";
import { useSafety } from "@/lib/session/SafetyContext";
import { SESSION_NUDGE_MS } from "@/lib/session/safety";

export function SessionLengthNudge() {
  const { sessionStartedAt, showSessionNudge, dismissSessionNudge, markSessionActivity } =
    useSafety();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStartedAt) {
      setVisible(false);
      return;
    }
    const check = () => {
      markSessionActivity();
      setVisible(
        Date.now() - sessionStartedAt >= SESSION_NUDGE_MS && showSessionNudge,
      );
    };
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [sessionStartedAt, showSessionNudge, markSessionActivity]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-[90] max-w-sm rounded border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm shadow-md"
    >
      <p className="text-[var(--ink)]">
        You&apos;ve been testing for about 20 minutes. Consider a break —
        fatigue confounds both symptoms and measurement.
      </p>
      <button
        type="button"
        className="mt-2 font-medium text-[var(--accent)] underline"
        onClick={() => {
          dismissSessionNudge();
          setVisible(false);
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
