"use client";

import { useEffect, useMemo, useState } from "react";
import { dbApi } from "@/lib/db/client";
import {
  MIN_TRIALS_PER_CONDITION,
  compareAllPairs,
  type ConditionSeries,
} from "@/lib/stats/comparisons";
import { NOT_DIAGNOSTIC } from "@/lib/content/disclaimers";
import type {
  GratingTrial,
  InterventionCondition,
  ReadingTrial,
  SymptomSurveyResponse,
} from "@/lib/types";

export function ClinicalSummary() {
  const [symptoms, setSymptoms] = useState<SymptomSurveyResponse[]>([]);
  const [gratings, setGratings] = useState<GratingTrial[]>([]);
  const [readings, setReadings] = useState<ReadingTrial[]>([]);
  const [conditions, setConditions] = useState<InterventionCondition[]>([]);

  useEffect(() => {
    (async () => {
      setSymptoms(await dbApi.getAllSymptomSurveys());
      setGratings(await dbApi.getAllGratingTrials());
      setReadings(await dbApi.getAllReadingTrials());
      setConditions(await dbApi.getAllConditions());
    })();
  }, []);

  const latestCi = [...symptoms]
    .filter((s) => s.instrument === "ci-inspired-15")
    .sort((a, b) => b.administeredAt.localeCompare(a.administeredAt))[0];
  const latestVs = [...symptoms]
    .filter((s) => s.instrument === "visual-stress-checklist")
    .sort((a, b) => b.administeredAt.localeCompare(a.administeredAt))[0];

  const pairs = useMemo(() => {
    const byCond = new Map<string, ReadingTrial[]>();
    for (const t of readings) {
      const list = byCond.get(t.conditionId) ?? [];
      list.push(t);
      byCond.set(t.conditionId, list);
    }
    const series: ConditionSeries[] = [...byCond.entries()].map(
      ([id, trials]) => ({
        conditionId: id,
        label: conditions.find((c) => c.id === id)?.label ?? id.slice(0, 8),
        values: trials.map((t) => t.correctWordsPerMinute),
        sessionIds: trials.map((t) => t.sessionId),
      }),
    );
    return compareAllPairs(series).filter((p) => !p.insufficient);
  }, [readings, conditions]);

  const best = [...pairs].sort(
    (a, b) => Math.abs(b.cohensDz) - Math.abs(a.cohensDz),
  )[0];

  const glareSummary = [0.5, 3, 12].map((f) => {
    const trials = gratings.filter((g) => g.spatialFrequencyCpd === f);
    const discomfort =
      trials.reduce((a, t) => a + t.discomfortRating, 0) /
      (trials.length || 1);
    return { f, n: trials.length, discomfort };
  });

  return (
    <article className="mx-auto max-w-2xl space-y-6 bg-white p-8 text-black print:p-0">
      <header className="space-y-1 border-b border-neutral-300 pb-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          PerceptLab clinical visit summary
        </h1>
        <p className="text-sm text-neutral-600">
          Generated {new Date().toLocaleString()} · single-user self-report
          toolkit
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold">Symptom snapshot</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>
            Latest CI-inspired total:{" "}
            {latestCi ? `${latestCi.totalScore}/60` : "—"} (not the validated
            CISS)
          </li>
          <li>
            Latest visual-stress checklist total:{" "}
            {latestVs ? latestVs.totalScore : "—"}
          </li>
          <li>Symptom survey records: {symptoms.length}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pattern glare (inspired)</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {glareSummary.map((g) => (
            <li key={g.f}>
              {g.f} cpd · n={g.n} · mean discomfort{" "}
              {g.n ? g.discomfort.toFixed(1) : "—"}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Intervention comparison</h2>
        {best ? (
          <p className="mt-2 text-sm">
            Best-sampled contrast: <strong>{best.aLabel}</strong> vs{" "}
            <strong>{best.bLabel}</strong> · n={best.n} · Cohen&apos;s dz=
            {Number.isFinite(best.cohensDz) ? best.cohensDz.toFixed(2) : "—"} ·
            mean Δ cwpm={best.meanDiff.toFixed(1)} · Wilcoxon p=
            {best.wilcoxon.pValue.toFixed(3)}
          </p>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">
            No condition pair yet reaches n≥{MIN_TRIALS_PER_CONDITION} trials
            each.
          </p>
        )}
        <p className="mt-1 text-sm">
          Reading trials logged: {readings.length} · unique sessions:{" "}
          {new Set(readings.map((r) => r.sessionId)).size}
        </p>
      </section>

      <footer className="border-t border-neutral-300 pt-4 text-xs text-neutral-700">
        <p>{NOT_DIAGNOSTIC}</p>
        <p className="mt-2">
          Instruments are inspired by clinical designs (CISS, Pattern Glare
          Test, WRRT) but are not those instruments and are not clinically
          validated. Intended to organise a specialist conversation.
        </p>
      </footer>

      <div className="no-print pt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.print()}
        >
          Print / Save as PDF
        </button>
      </div>
    </article>
  );
}
