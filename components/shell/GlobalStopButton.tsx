"use client";

import { useSafety } from "@/lib/session/SafetyContext";

export function GlobalStopButton() {
  const { stop, stopped, clearStop } = useSafety();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
      {stopped && (
        <div className="max-w-xs rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm shadow-md">
          <p className="text-[var(--ink)]">
            Stimulus blanked to neutral grey.
          </p>
          <button
            type="button"
            onClick={clearStop}
            className="mt-2 text-sm font-medium text-[var(--accent)] underline"
          >
            Resume / clear stop
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={stop}
        className="rounded bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
        aria-label="Stop stimulus immediately"
      >
        STOP
      </button>
    </div>
  );
}
