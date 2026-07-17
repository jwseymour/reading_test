"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReadingTrialRunner } from "@/components/reading/ReadingTrial";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { loadProgressSnapshot } from "@/lib/progress/loadProgress";
import type { BaselineProfile } from "@/lib/recommendations/fromBaseline";
import {
  FAMILY_ARMS,
  FAMILY_LABELS,
  allFamilyConditions,
  mergeComposite,
} from "@/lib/interventions/families";
import { PAPER_PASSAGES } from "@/lib/reading/paperPassages";
import type {
  ComparisonPhase,
  InterventionCondition,
  InterventionFamily,
  ReadingTrial,
} from "@/lib/types";

const TRIALS_PER_ARM = 2;
const CONFIRM_TRIALS = 3;

export function FindStagedWizard() {
  const [profile, setProfile] = useState<BaselineProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<ComparisonPhase | null>(null);
  const [selectedFamilies, setSelectedFamilies] = useState<InterventionFamily[]>(
    [],
  );
  const [prediction, setPrediction] = useState("");
  const [familyQueue, setFamilyQueue] = useState<InterventionFamily[]>([]);
  const [activeFamily, setActiveFamily] = useState<InterventionFamily | null>(
    null,
  );
  const [armOrder, setArmOrder] = useState<string[]>([]);
  const [armIndex, setArmIndex] = useState(0);
  const [armTrialCounts, setArmTrialCounts] = useState<Record<string, number>>(
    {},
  );
  const [familyWinners, setFamilyWinners] = useState<
    Partial<Record<InterventionFamily, string>>
  >({});
  const [composite, setComposite] = useState<InterventionCondition | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<string[]>([]);
  const [confirmIndex, setConfirmIndex] = useState(0);
  const [confirmCounts, setConfirmCounts] = useState<Record<string, number>>({});
  const [trialKey, setTrialKey] = useState(0);
  const [message, setMessage] = useState("");
  const [promoted, setPromoted] = useState<InterventionCondition[]>([]);

  const bootstrap = useCallback(async () => {
    for (const c of allFamilyConditions()) {
      await dbApi.putCondition(c);
    }
    const { progress, profile: pr } = await loadProgressSnapshot();
    setProfile(pr);
    setReady(progress.assessReadyForFind);
    setSelectedFamilies(
      pr.recommendations.slice(0, 3).map((r) => r.family),
    );
    const settings = await dbApi.getSettings();
    const promotedIds = settings.promotedConditionIds ?? [];
    const conds = await dbApi.getAllConditions();
    setPromoted(conds.filter((c) => promotedIds.includes(c.id)));

    if (settings.activeComparisonPhaseId) {
      const p = await dbApi.getComparisonPhase(settings.activeComparisonPhaseId);
      if (p && !p.completedAt && p.stage && p.stage !== "complete") {
        setPhase(p);
        setSelectedFamilies(p.selectedFamilies ?? []);
        setPrediction(p.prediction);
        setFamilyWinners(p.familyWinners ?? {});
        if (p.stage === "within-family" && p.activeFamily) {
          resumeFamily(p.activeFamily, p);
        }
        if (p.compositeConditionIds?.[0]) {
          const comp = await dbApi.getCondition(p.compositeConditionIds[0]);
          setComposite(comp ?? null);
        }
      }
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  function resumeFamily(family: InterventionFamily, p: ComparisonPhase) {
    setActiveFamily(family);
    const remaining = (p.selectedFamilies ?? []).filter(
      (f) => !p.familyWinners?.[f],
    );
    setFamilyQueue(remaining.filter((f) => f !== family));
    const arms = FAMILY_ARMS[family];
    setArmOrder([arms[0].id, arms[1].id].sort(() => Math.random() - 0.5));
    setArmIndex(0);
  }

  const startPhase = async () => {
    if (selectedFamilies.length < 1) {
      setMessage("Select at least one family.");
      return;
    }
    if (!prediction.trim()) {
      setMessage("Write a short prediction first.");
      return;
    }
    const p: ComparisonPhase = {
      id: createId(),
      conditionIds: [],
      prediction: prediction.trim(),
      startedAt: new Date().toISOString(),
      sessionOrderIndex: 0,
      stage: "within-family",
      selectedFamilies,
      recommendedFamilies: profile?.recommendations.map((r) => r.family),
      sourceSignals: profile?.signals,
      familyWinners: {},
      activeFamily: selectedFamilies[0],
    };
    await dbApi.putComparisonPhase(p);
    const settings = await dbApi.getSettings();
    await dbApi.putSettings({ ...settings, activeComparisonPhaseId: p.id });
    setPhase(p);
    setFamilyWinners({});
    const [first, ...rest] = selectedFamilies;
    setActiveFamily(first!);
    setFamilyQueue(rest);
    const arms = FAMILY_ARMS[first!];
    setArmOrder(
      Math.random() < 0.5
        ? [arms[0].id, arms[1].id]
        : [arms[1].id, arms[0].id],
    );
    setArmIndex(0);
    setArmTrialCounts({});
    setTrialKey((k) => k + 1);
    setMessage("");
  };

  const pickWinnerForFamily = async (family: InterventionFamily) => {
    const arms = FAMILY_ARMS[family];
    const trials = await dbApi.getAllReadingTrials();
    const score = (id: string) => {
      const ts = trials.filter(
        (t) => t.conditionId === id && t.purpose === "find",
      );
      if (!ts.length) return -Infinity;
      // Higher cwpm and lower discomfort wins
      const cwpm = ts.reduce((a, t) => a + t.correctWordsPerMinute, 0) / ts.length;
      const disc =
        ts.reduce((a, t) => a + t.selfReportedDiscomfort, 0) / ts.length;
      return cwpm - disc * 8;
    };
    const winnerId =
      score(arms[0].id) >= score(arms[1].id) ? arms[0].id : arms[1].id;
    // Prefer non-baseline when close and user has symptoms — keep score-based
    const winners = { ...familyWinners, [family]: winnerId };
    setFamilyWinners(winners);

    if (!phase) return winners;
    const updated: ComparisonPhase = {
      ...phase,
      familyWinners: winners,
    };

    if (familyQueue.length === 0) {
      // Build composite
      const winnerConds = selectedFamilies
        .map((f) => {
          const id = winners[f];
          return FAMILY_ARMS[f].find((a) => a.id === id);
        })
        .filter(Boolean) as InterventionCondition[];
      const promo = promoted[0];
      if (promo) winnerConds.push(promo);
      const comp = mergeComposite(winnerConds, `condition-profile-${phase.id}`);
      await dbApi.putCondition(comp);
      setComposite(comp);
      updated.stage = "confirm";
      updated.compositeConditionIds = [comp.id];
      updated.activeFamily = undefined;
      await dbApi.putComparisonPhase(updated);
      setPhase(updated);
      const order =
        Math.random() < 0.5
          ? ["condition-baseline-none", comp.id]
          : [comp.id, "condition-baseline-none"];
      // Expand to CONFIRM_TRIALS each, interleaved
      const seq: string[] = [];
      for (let i = 0; i < CONFIRM_TRIALS; i++) {
        seq.push(order[0]!, order[1]!);
      }
      setConfirmOrder(seq);
      setConfirmIndex(0);
      setConfirmCounts({});
      setActiveFamily(null);
      setTrialKey((k) => k + 1);
    } else {
      const [next, ...rest] = familyQueue;
      setFamilyQueue(rest);
      setActiveFamily(next!);
      updated.activeFamily = next;
      updated.stage = "within-family";
      await dbApi.putComparisonPhase(updated);
      setPhase(updated);
      const armsNext = FAMILY_ARMS[next!];
      setArmOrder(
        Math.random() < 0.5
          ? [armsNext[0].id, armsNext[1].id]
          : [armsNext[1].id, armsNext[0].id],
      );
      setArmIndex(0);
      setArmTrialCounts({});
      setTrialKey((k) => k + 1);
    }
    return winners;
  };

  const onFamilyTrialSaved = async (_t: ReadingTrial) => {
    if (!activeFamily) return;
    const armId = armOrder[armIndex];
    if (!armId) return;
    const nextCounts = {
      ...armTrialCounts,
      [armId]: (armTrialCounts[armId] ?? 0) + 1,
    };
    setArmTrialCounts(nextCounts);

    const arms = FAMILY_ARMS[activeFamily];
    const a0 = nextCounts[arms[0].id] ?? 0;
    const a1 = nextCounts[arms[1].id] ?? 0;
    if (a0 >= TRIALS_PER_ARM && a1 >= TRIALS_PER_ARM) {
      await pickWinnerForFamily(activeFamily);
      return;
    }
    // Next arm in alternating order
    const nextIdx = (armIndex + 1) % armOrder.length;
    // Prefer the arm that still needs trials
    let idx = nextIdx;
    for (let i = 0; i < armOrder.length; i++) {
      const candidate = armOrder[(armIndex + 1 + i) % armOrder.length]!;
      if ((nextCounts[candidate] ?? 0) < TRIALS_PER_ARM) {
        idx = armOrder.indexOf(candidate);
        break;
      }
    }
    setArmIndex(idx);
    setTrialKey((k) => k + 1);
  };

  const onConfirmTrialSaved = async (_t: ReadingTrial) => {
    const id = confirmOrder[confirmIndex];
    if (!id) return;
    const next = {
      ...confirmCounts,
      [id]: (confirmCounts[id] ?? 0) + 1,
    };
    setConfirmCounts(next);
    const nextIndex = confirmIndex + 1;
    if (nextIndex >= confirmOrder.length) {
      if (phase) {
        const done: ComparisonPhase = {
          ...phase,
          stage: "complete",
          completedAt: new Date().toISOString(),
          confirmedProfileId: composite?.id,
        };
        await dbApi.putComparisonPhase(done);
        const settings = await dbApi.getSettings();
        await dbApi.putSettings({
          ...settings,
          activeComparisonPhaseId: undefined,
        });
        setPhase(done);
      }
      return;
    }
    setConfirmIndex(nextIndex);
    setTrialKey((k) => k + 1);
  };

  const stage = phase?.stage ?? "families";
  const currentArmId =
    stage === "within-family" ? armOrder[armIndex] : confirmOrder[confirmIndex];
  const passageId =
    PAPER_PASSAGES[
      (trialKey + (phase?.sessionOrderIndex ?? 0)) % PAPER_PASSAGES.length
    ]!.id;

  const familyProgress = useMemo(() => {
    if (!activeFamily) return null;
    const arms = FAMILY_ARMS[activeFamily];
    return arms.map((a) => ({
      label: a.label,
      n: armTrialCounts[a.id] ?? 0,
    }));
  }, [activeFamily, armTrialCounts]);

  if (!ready) {
    return (
      <div className="space-y-3 rounded border border-[var(--warn-border)] bg-[var(--warn-bg)] p-4 text-[var(--warn-ink)]">
        <p className="font-semibold">Finish Assess first</p>
        <p className="text-sm">
          Find uses your baseline signals (calibration, symptoms, pattern glare,
          and a reading baseline) to recommend which intervention families to
          test — instead of grinding every parameter.
        </p>
        <Link href="/assess" className="btn btn-primary inline-block">
          Go to Assess
        </Link>
      </div>
    );
  }

  if (phase?.stage === "complete") {
    return (
      <div className="space-y-4">
        <p className="font-semibold text-[var(--accent)]">
          Search complete
          {composite ? ` — ${composite.label}` : ""}.
        </p>
        <p className="text-sm text-[var(--muted)]">
          Averages and effect sizes are unlocked in Insights. Prediction was:{" "}
          {phase.prediction}
        </p>
        <Link href="/insights" className="btn btn-primary inline-block">
          View Insights
        </Link>
        <button
          type="button"
          className="btn btn-secondary ml-2"
          onClick={() => {
            setPhase(null);
            setComposite(null);
            setFamilyWinners({});
          }}
        >
          Start another search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {profile && (
        <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 text-sm space-y-2">
          <h2 className="font-semibold">From your Assess profile</h2>
          <p>
            Visual-stress: <strong>{profile.visualStressLean}</strong> · CI:{" "}
            <strong>{profile.ciLean}</strong> · Reading friction:{" "}
            <strong>{profile.readingFriction}</strong>
          </p>
          <ul className="list-disc pl-5 text-[var(--muted)]">
            {profile.recommendations.map((r) => (
              <li key={r.family}>
                <strong>{FAMILY_LABELS[r.family]}</strong> — {r.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(!phase || stage === "families") && (
        <section className="space-y-4">
          <h2 className="font-semibold">Stage 1 · Choose families</h2>
          <p className="text-sm text-[var(--muted)]">
            Pick 2–3 families suggested by your baseline. You will A/B within
            each family (not every combination), then combine winners.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(FAMILY_LABELS) as InterventionFamily[]).map((f) => {
              const on = selectedFamilies.includes(f);
              const suggested = profile?.recommendations.some(
                (r) => r.family === f,
              );
              return (
                <li key={f}>
                  <label
                    className={`flex cursor-pointer gap-2 rounded border px-3 py-2 text-sm ${
                      on
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setSelectedFamilies((prev) =>
                          on ? prev.filter((x) => x !== f) : [...prev, f],
                        )
                      }
                    />
                    <span>
                      {FAMILY_LABELS[f]}
                      {suggested && (
                        <span className="ml-1 text-xs text-[var(--accent)]">
                          suggested
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {promoted.length > 0 && (
            <p className="text-sm text-[var(--muted)]">
              Playground promote will be folded into Stage 3:{" "}
              {promoted.map((c) => c.label).join(", ")}
            </p>
          )}
          <label className="block text-sm">
            Prediction
            <textarea
              className="input mt-1 min-h-[4rem]"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="What do you expect will help most?"
            />
          </label>
          <button type="button" className="btn btn-primary" onClick={startPhase}>
            Start Stage 2 · within-family A/B
          </button>
          {message && <p className="text-sm text-[var(--danger)]">{message}</p>}
        </section>
      )}

      {stage === "within-family" && activeFamily && currentArmId && (
        <section className="space-y-3">
          <h2 className="font-semibold">
            Stage 2 · {FAMILY_LABELS[activeFamily]}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {TRIALS_PER_ARM} trials per arm, counterbalanced. Averages hidden
            until the family winner is locked.
          </p>
          <ul className="flex flex-wrap gap-2 text-xs">
            {familyProgress?.map((p) => (
              <li
                key={p.label}
                className="rounded bg-[var(--surface-2)] px-2 py-1"
              >
                {p.label}: {p.n}/{TRIALS_PER_ARM}
              </li>
            ))}
          </ul>
          <p className="text-sm">
            Now testing:{" "}
            <strong>
              {FAMILY_ARMS[activeFamily].find((a) => a.id === currentArmId)
                ?.label ?? currentArmId}
            </strong>
          </p>
          <ReadingTrialRunner
            key={`${trialKey}-${currentArmId}`}
            lockedConditionId={currentArmId}
            lockedPassageId={passageId}
            hideSetup
            purpose="find"
            allowPaste={false}
            onTrialSaved={onFamilyTrialSaved}
          />
        </section>
      )}

      {stage === "confirm" && composite && currentArmId && (
        <section className="space-y-3">
          <h2 className="font-semibold">Stage 4 · Confirm vs baseline</h2>
          <p className="text-sm text-[var(--muted)]">
            Composite: <strong>{composite.label}</strong>.{" "}
            {CONFIRM_TRIALS} trials each vs baseline.
          </p>
          <ul className="flex flex-wrap gap-2 text-xs">
            <li className="rounded bg-[var(--surface-2)] px-2 py-1">
              Baseline: {confirmCounts["condition-baseline-none"] ?? 0}/
              {CONFIRM_TRIALS}
            </li>
            <li className="rounded bg-[var(--surface-2)] px-2 py-1">
              Profile: {confirmCounts[composite.id] ?? 0}/{CONFIRM_TRIALS}
            </li>
          </ul>
          <p className="text-sm">
            Now:{" "}
            <strong>
              {currentArmId === composite.id ? composite.label : "Baseline"}
            </strong>
          </p>
          <ReadingTrialRunner
            key={`${trialKey}-confirm-${currentArmId}`}
            lockedConditionId={currentArmId}
            lockedPassageId={passageId}
            hideSetup
            purpose="find"
            allowPaste={false}
            onTrialSaved={onConfirmTrialSaved}
          />
        </section>
      )}

      {Object.keys(familyWinners).length > 0 && stage !== "complete" && (
        <p className="text-xs text-[var(--muted)]">
          Locked winners:{" "}
          {Object.entries(familyWinners)
            .map(([f, id]) => {
              const arm = FAMILY_ARMS[f as InterventionFamily]?.find(
                (a) => a.id === id,
              );
              return `${FAMILY_LABELS[f as InterventionFamily]}→${arm?.label ?? id}`;
            })
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
