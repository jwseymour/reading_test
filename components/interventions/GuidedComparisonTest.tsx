"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReadingTrialRunner } from "@/components/reading/ReadingTrial";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { orderForSession } from "@/lib/scheduling/latinSquare";
import { FIXED_PASSAGES } from "@/lib/reading/passages";
import {
  RECOMMENDED_CONDITION_IDS,
  STANDARD_CONDITIONS,
  TRIALS_PER_CONDITION_TARGET,
} from "@/lib/interventions/standardBattery";
import type {
  ComparisonPhase,
  InterventionCondition,
  ReadingTrial,
} from "@/lib/types";

type Step = "configure" | "run" | "session-done" | "complete";

export function GuidedComparisonTest() {
  const [selected, setSelected] = useState<string[]>([
    ...RECOMMENDED_CONDITION_IDS,
  ]);
  const [prediction, setPrediction] = useState("");
  const [phase, setPhase] = useState<ComparisonPhase | null>(null);
  const [step, setStep] = useState<Step>("configure");
  const [sessionOrder, setSessionOrder] = useState<string[]>([]);
  const [orderIndex, setOrderIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [trialKey, setTrialKey] = useState(0);
  const [message, setMessage] = useState("");

  const refreshCounts = useCallback(async () => {
    const trials = await dbApi.getAllReadingTrials();
    const next: Record<string, number> = {};
    for (const t of trials) {
      next[t.conditionId] = (next[t.conditionId] ?? 0) + 1;
    }
    setCounts(next);
    return next;
  }, []);

  useEffect(() => {
    (async () => {
      for (const c of STANDARD_CONDITIONS) {
        await dbApi.putCondition(c);
      }
      const settings = await dbApi.getSettings();
      if (settings.activeComparisonPhaseId) {
        const p = await dbApi.getComparisonPhase(
          settings.activeComparisonPhaseId,
        );
        if (p && !p.completedAt) {
          setPhase(p);
          setSelected(p.conditionIds);
          setPrediction(p.prediction);
          const order = orderForSession(p.conditionIds, p.sessionOrderIndex);
          setSessionOrder(order);
          setOrderIndex(0);
          setStep("run");
        }
      }
      await refreshCounts();
    })();
  }, [refreshCounts]);

  const currentConditionId = sessionOrder[orderIndex];
  const currentCondition = STANDARD_CONDITIONS.find(
    (c) => c.id === currentConditionId,
  );

  const progressSummary = useMemo(() => {
    return selected.map((id) => {
      const c = STANDARD_CONDITIONS.find((x) => x.id === id);
      const n = counts[id] ?? 0;
      return {
        id,
        label: c?.label ?? id,
        n,
        ready: n >= TRIALS_PER_CONDITION_TARGET,
      };
    });
  }, [selected, counts]);

  const allReady = progressSummary.every((p) => p.ready);

  const startPhase = async () => {
    if (selected.length < 2) {
      setMessage("Select at least two conditions.");
      return;
    }
    if (!prediction.trim()) {
      setMessage("Write a short prediction before starting (pre-registration).");
      return;
    }
    for (const c of STANDARD_CONDITIONS) {
      await dbApi.putCondition(c);
    }
    const phases = await dbApi.getAllComparisonPhases();
    const newPhase: ComparisonPhase = {
      id: createId(),
      conditionIds: selected,
      prediction: prediction.trim(),
      startedAt: new Date().toISOString(),
      sessionOrderIndex: phases.length,
    };
    await dbApi.putComparisonPhase(newPhase);
    const settings = await dbApi.getSettings();
    await dbApi.putSettings({
      ...settings,
      activeComparisonPhaseId: newPhase.id,
    });
    setPhase(newPhase);
    const order = orderForSession(selected, newPhase.sessionOrderIndex);
    setSessionOrder(order);
    setOrderIndex(0);
    setTrialKey((k) => k + 1);
    setStep("run");
    setMessage("");
    await refreshCounts();
  };

  const completePhase = async () => {
    if (!phase) return;
    const done = { ...phase, completedAt: new Date().toISOString() };
    await dbApi.putComparisonPhase(done);
    const settings = await dbApi.getSettings();
    await dbApi.putSettings({
      ...settings,
      activeComparisonPhaseId: undefined,
    });
    setPhase(done);
    setStep("complete");
  };

  const onTrialSaved = async (_trial: ReadingTrial) => {
    const nextCounts = await refreshCounts();
    const nextIndex = orderIndex + 1;
    if (nextIndex >= sessionOrder.length) {
      const stillShort = selected.some(
        (id) => (nextCounts[id] ?? 0) < TRIALS_PER_CONDITION_TARGET,
      );
      setStep(stillShort ? "session-done" : "complete");
      if (!stillShort && phase && !phase.completedAt) {
        await completePhase();
      }
      return;
    }
    setOrderIndex(nextIndex);
    // Rotate passage to reduce memorisation
    setTrialKey((k) => k + 1);
  };

  const continueNextSession = async () => {
    if (!phase) return;
    const nextPhase: ComparisonPhase = {
      ...phase,
      sessionOrderIndex: phase.sessionOrderIndex + 1,
    };
    // Keep same phase id but bump session order for Latin square rotation
    await dbApi.putComparisonPhase(nextPhase);
    setPhase(nextPhase);
    const order = orderForSession(
      nextPhase.conditionIds,
      nextPhase.sessionOrderIndex,
    );
    setSessionOrder(order);
    setOrderIndex(0);
    setTrialKey((k) => k + 1);
    setStep("run");
  };

  return (
    <section className="space-y-4 rounded border border-[var(--accent)]/30 bg-[var(--surface)] p-5">
      <header className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Guided comparison test
        </h2>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          A counterbalanced reading protocol to find which interventions help
          you most. Each selected condition is tested with the Module C reading
          battery (cwpm + discomfort), scheduled via a Latin square so order /
          fatigue does not favour any one option. Target:{" "}
          <strong>{TRIALS_PER_CONDITION_TARGET} trials per condition</strong>{" "}
          before conclusions. Running averages stay hidden until the phase is
          complete.
        </p>
      </header>

      {step === "configure" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelected([...RECOMMENDED_CONDITION_IDS])}
            >
              Use recommended pack
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setSelected(STANDARD_CONDITIONS.map((c) => c.id))
              }
            >
              Select all
            </button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {STANDARD_CONDITIONS.map((c) => {
              const on = selected.includes(c.id);
              return (
                <li key={c.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-2 rounded border px-3 py-2 text-sm ${
                      on
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={on}
                      onChange={() =>
                        setSelected((prev) =>
                          on
                            ? prev.filter((id) => id !== c.id)
                            : [...prev, c.id],
                        )
                      }
                    />
                    <span>
                      <span className="font-medium text-[var(--ink)]">
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--muted)]">
                        {describeCondition(c)}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">
              Prediction (required) — what do you expect will help most?
            </span>
            <textarea
              className="input min-h-[4rem]"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="e.g. Larger text and teal overlay will improve cwpm vs baseline; OpenDyslexic may reduce discomfort."
            />
          </label>
          <p className="text-xs text-[var(--muted)]">
            This session will run one Latin-square row: one reading trial per
            selected condition ({selected.length} trials). Repeat sessions until
            each condition reaches n=
            {TRIALS_PER_CONDITION_TARGET}. Passages rotate across the fixed set.
          </p>
          <button type="button" className="btn btn-primary" onClick={startPhase}>
            Start guided phase
          </button>
          {message && <p className="text-sm text-[var(--danger)]">{message}</p>}
        </div>
      )}

      {(step === "run" || step === "session-done" || step === "complete") && (
        <div className="space-y-3">
          <div className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm">
            <p className="font-medium">Progress (counts only — no averages yet)</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {progressSummary.map((p) => (
                <li
                  key={p.id}
                  className={`rounded px-2 py-0.5 text-xs ${
                    p.ready
                      ? "bg-[var(--accent-soft)] text-[var(--ink)]"
                      : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {p.label}: {p.n}/{TRIALS_PER_CONDITION_TARGET}
                </li>
              ))}
            </ul>
            {phase && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Prediction locked: {phase.prediction}
              </p>
            )}
          </div>
        </div>
      )}

      {step === "run" && currentCondition && (
        <div className="space-y-3">
          <p className="text-sm">
            <strong>
              Trial {orderIndex + 1}/{sessionOrder.length}
            </strong>{" "}
            this session · condition:{" "}
            <strong>{currentCondition.label}</strong>
            {" · "}
            passage{" "}
            {
              FIXED_PASSAGES[
                (orderIndex + (phase?.sessionOrderIndex ?? 0)) %
                  FIXED_PASSAGES.length
              ]!.id
            }
          </p>
          <ReadingTrialRunner
            key={`${trialKey}-${currentCondition.id}-${orderIndex}`}
            lockedConditionId={currentCondition.id}
            lockedPassageId={
              FIXED_PASSAGES[
                (orderIndex + (phase?.sessionOrderIndex ?? 0)) %
                  FIXED_PASSAGES.length
              ]!.id
            }
            hideSetup
            onTrialSaved={onTrialSaved}
          />
        </div>
      )}

      {step === "session-done" && (
        <div className="space-y-3">
          <p className="text-sm">
            Session row complete.{" "}
            {allReady
              ? "All conditions have enough data."
              : `Keep going until every condition reaches n=${TRIALS_PER_CONDITION_TARGET}. The next session rotates condition order (Latin square).`}
          </p>
          <div className="flex flex-wrap gap-2">
            {!allReady && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={continueNextSession}
              >
                Start next counterbalanced session
              </button>
            )}
            {allReady && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={completePhase}
              >
                Complete phase & unlock analytics
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep("configure")}
            >
              Back to configure
            </button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--accent)]">
            Phase complete — effect sizes and condition averages are unlocked in
            Analytics.
          </p>
          <Link href="/analytics" className="btn btn-primary inline-block">
            View comparison results
          </Link>
          <button
            type="button"
            className="btn btn-secondary ml-2"
            onClick={() => {
              setPhase(null);
              setStep("configure");
            }}
          >
            Start a new phase
          </button>
        </div>
      )}
    </section>
  );
}

function describeCondition(c: InterventionCondition): string {
  const bits: string[] = [];
  if (c.fontSizePx) bits.push(`${c.fontSizePx}px`);
  if (c.lineSpacingMultiplier && c.lineSpacingMultiplier !== 1.15) {
    bits.push(`${c.lineSpacingMultiplier}× spacing`);
  }
  if (c.type === "colorOverlay") bits.push("colour overlay");
  if (c.type === "darkMode") bits.push("inverted contrast");
  if (c.type === "readingRuler") bits.push("line mask");
  if (c.type === "fontChange") bits.push("font change");
  if (c.type === "fontSize") bits.push("size change");
  if (c.type === "none") bits.push("control");
  return bits.join(" · ");
}
