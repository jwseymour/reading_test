"use client";

import { useEffect, useState } from "react";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import type { ComparisonPhase, InterventionCondition } from "@/lib/types";

export function PhasePreregForm({
  onStarted,
}: {
  onStarted?: (phase: ComparisonPhase) => void;
}) {
  const [conditions, setConditions] = useState<InterventionCondition[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [prediction, setPrediction] = useState("");
  const [active, setActive] = useState<ComparisonPhase | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      setConditions(await dbApi.getAllConditions());
      const settings = await dbApi.getSettings();
      if (settings.activeComparisonPhaseId) {
        const p = await dbApi.getComparisonPhase(
          settings.activeComparisonPhaseId,
        );
        setActive(p ?? null);
      }
    })();
  }, []);

  return (
    <div className="space-y-3 rounded border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="font-semibold">Pre-registration-lite</h3>
      <p className="text-sm text-[var(--muted)]">
        Before a comparison phase, state which conditions you&apos;re comparing
        and your prediction. Running averages stay hidden until the phase is
        marked complete.
      </p>
      {active && !active.completedAt && (
        <p className="text-sm">
          Active phase since {new Date(active.startedAt).toLocaleString()} ·{" "}
          <button
            type="button"
            className="underline"
            onClick={async () => {
              const done = {
                ...active,
                completedAt: new Date().toISOString(),
              };
              await dbApi.putComparisonPhase(done);
              const settings = await dbApi.getSettings();
              await dbApi.putSettings({
                ...settings,
                activeComparisonPhaseId: undefined,
              });
              setActive(null);
              setMessage("Phase marked complete — averages unlocked in Analytics.");
            }}
          >
            Mark phase complete
          </button>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {conditions.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className={`rounded border px-2 py-1 text-xs ${
                on
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)]"
              }`}
              onClick={() =>
                setSelected((s) =>
                  on ? s.filter((id) => id !== c.id) : [...s, c.id],
                )
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <textarea
        className="input min-h-[4rem]"
        placeholder="Prediction (e.g. blue overlay will improve cwpm vs baseline)"
        value={prediction}
        onChange={(e) => setPrediction(e.target.value)}
      />
      <button
        type="button"
        className="btn btn-primary"
        disabled={selected.length < 2 || !prediction.trim()}
        onClick={async () => {
          const phases = await dbApi.getAllComparisonPhases();
          const phase: ComparisonPhase = {
            id: createId(),
            conditionIds: selected,
            prediction: prediction.trim(),
            startedAt: new Date().toISOString(),
            sessionOrderIndex: phases.length,
          };
          await dbApi.putComparisonPhase(phase);
          const settings = await dbApi.getSettings();
          await dbApi.putSettings({
            ...settings,
            activeComparisonPhaseId: phase.id,
          });
          setActive(phase);
          setMessage("Comparison phase started.");
          onStarted?.(phase);
        }}
      >
        Start comparison phase
      </button>
      {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
    </div>
  );
}
