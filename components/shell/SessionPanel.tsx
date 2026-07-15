"use client";

import { useState } from "react";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";
import { useSafety } from "@/lib/session/SafetyContext";
import type { AmbientLighting } from "@/lib/types";

export function SessionPanel() {
  const { session, loading, startSession, endSession } = useSessionMeta();
  const { markSessionActivity } = useSafety();
  const [open, setOpen] = useState(false);
  const [hoursSinceWaking, setHoursSinceWaking] = useState("");
  const [sleepHoursLastNight, setSleepHoursLastNight] = useState("");
  const [caffeineMgToday, setCaffeineMgToday] = useState("");
  const [screenTimeHoursToday, setScreenTimeHoursToday] = useState("");
  const [ambientLighting, setAmbientLighting] = useState<AmbientLighting | "">(
    "",
  );
  const [fatigueSelfRating, setFatigueSelfRating] = useState("");
  const [notes, setNotes] = useState("");

  if (loading) {
    return (
      <div className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
        Loading session…
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
        <span>
          Session active since{" "}
          <time dateTime={session.startedAt}>
            {new Date(session.startedAt).toLocaleString()}
          </time>
        </span>
        <button
          type="button"
          className="rounded bg-[var(--surface-2)] px-2 py-1 font-medium hover:bg-[var(--border)]"
          onClick={() => endSession()}
        >
          End session
        </button>
      </div>
    );
  }

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">
          No active session. Start one to tag trials with sleep/caffeine/fatigue
          context.
        </p>
        <button
          type="button"
          className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Hide form" : "Start session"}
        </button>
      </div>
      {open && (
        <form
          className="mt-3 grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await startSession({
              hoursSinceWaking: numOrUndef(hoursSinceWaking),
              sleepHoursLastNight: numOrUndef(sleepHoursLastNight),
              caffeineMgToday: numOrUndef(caffeineMgToday),
              screenTimeHoursToday: numOrUndef(screenTimeHoursToday),
              ambientLighting: ambientLighting || undefined,
              fatigueSelfRating: numOrUndef(fatigueSelfRating),
              notes: notes || undefined,
            });
            markSessionActivity();
            setOpen(false);
          }}
        >
          <Field label="Hours since waking">
            <input
              type="number"
              min={0}
              step={0.5}
              value={hoursSinceWaking}
              onChange={(e) => setHoursSinceWaking(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Sleep hours last night">
            <input
              type="number"
              min={0}
              step={0.5}
              value={sleepHoursLastNight}
              onChange={(e) => setSleepHoursLastNight(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Caffeine today (mg)">
            <input
              type="number"
              min={0}
              value={caffeineMgToday}
              onChange={(e) => setCaffeineMgToday(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Screen time today (hours)">
            <input
              type="number"
              min={0}
              step={0.5}
              value={screenTimeHoursToday}
              onChange={(e) => setScreenTimeHoursToday(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Ambient lighting">
            <select
              value={ambientLighting}
              onChange={(e) =>
                setAmbientLighting(e.target.value as AmbientLighting | "")
              }
              className="input"
            >
              <option value="">—</option>
              <option value="dim">Dim</option>
              <option value="normal">Normal</option>
              <option value="bright">Bright</option>
              <option value="daylight">Daylight</option>
            </select>
          </Field>
          <Field label="Fatigue (1–5)">
            <input
              type="number"
              min={1}
              max={5}
              value={fatigueSelfRating}
              onChange={(e) => setFatigueSelfRating(e.target.value)}
              className="input"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[4rem]"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              Start session
            </button>
            <button
              type="button"
              className="ml-2 text-sm text-[var(--muted)] underline"
              onClick={async () => {
                await startSession({});
                markSessionActivity();
              }}
            >
              Start without context
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function numOrUndef(v: string): number | undefined {
  if (v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
