"use client";

import { useEffect, useMemo, useState } from "react";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";
import { KING_DEVICK_INSPIRED } from "@/lib/content/disclaimers";

function buildRows(seed = Date.now()): number[][] {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: 8 }, () =>
    Array.from({ length: 5 }, () => Math.floor(rng() * 9) + 1),
  );
}

export function SaccadeTask() {
  const { ensureSession } = useSessionMeta();
  const [rows] = useState(() => buildRows());
  const [rowIndex, setRowIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [errors, setErrors] = useState(0);
  const [message, setMessage] = useState("");

  const progress = useMemo(
    () => `${Math.min(rowIndex, rows.length)} / ${rows.length}`,
    [rowIndex, rows.length],
  );

  useEffect(() => {
    if (!running) return;
    const onKey = async (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      e.preventDefault();
      if (rowIndex + 1 >= rows.length) {
        const end = Date.now();
        const start = startedAt ?? end;
        const session = await ensureSession();
        const duration = end - start;
        const accuracy = 1 - errors / (rows.length * 5);
        await dbApi.putConvergenceTrial({
          id: createId(),
          sessionId: session.id,
          method: "saccade-digital",
          saccadeDurationMs: duration,
          saccadeAccuracy: Math.max(0, accuracy),
          timestamp: new Date().toISOString(),
        });
        setRunning(false);
        setMessage(
          `Saved baseline · ${(duration / 1000).toFixed(1)}s · relative tracker only`,
        );
        setRowIndex(rows.length);
        return;
      }
      setRowIndex((i) => i + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, rowIndex, rows.length, startedAt, errors, ensureSession]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Digital rapid-naming / saccade task</h3>
      <p className="text-sm text-[var(--muted)]">{KING_DEVICK_INSPIRED}</p>
      <div className="space-y-2 rounded border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-2xl tracking-[0.4em]">
        {rows.map((row, i) => (
          <p
            key={i}
            className={
              i === rowIndex && running
                ? "text-[var(--ink)]"
                : "text-[var(--muted)] opacity-40"
            }
          >
            {row.join(" ")}
          </p>
        ))}
      </div>
      {!running ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setRowIndex(0);
            setErrors(0);
            setStartedAt(Date.now());
            setRunning(true);
            setMessage("");
          }}
        >
          Start (Space/Enter after each row)
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Row {progress}</span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setErrors((e) => e + 1)}
          >
            Log error (+1)
          </button>
        </div>
      )}
      {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
    </div>
  );
}
