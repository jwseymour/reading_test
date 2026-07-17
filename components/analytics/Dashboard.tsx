"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Scatter } from "react-chartjs-2";
import { dbApi } from "@/lib/db/client";
import {
  MIN_TRIALS_PER_CONDITION,
  compareAllPairs,
  type ConditionSeries,
} from "@/lib/stats/comparisons";
import { EXPLORATORY_CORRELATION, NOT_DIAGNOSTIC } from "@/lib/content/disclaimers";
import type {
  ComparisonPhase,
  GratingTrial,
  InterventionCondition,
  JournalEntry,
  ReadingTrial,
  SymptomSurveyResponse,
} from "@/lib/types";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function mean(xs: number[]): number {
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(
    xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1),
  );
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function Dashboard() {
  const [symptoms, setSymptoms] = useState<SymptomSurveyResponse[]>([]);
  const [gratings, setGratings] = useState<GratingTrial[]>([]);
  const [readings, setReadings] = useState<ReadingTrial[]>([]);
  const [conditions, setConditions] = useState<InterventionCondition[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [phases, setPhases] = useState<ComparisonPhase[]>([]);
  const [hideAverages, setHideAverages] = useState(false);

  useEffect(() => {
    (async () => {
      setSymptoms(await dbApi.getAllSymptomSurveys());
      setGratings(await dbApi.getAllGratingTrials());
      setReadings(await dbApi.getAllReadingTrials());
      setConditions(await dbApi.getAllConditions());
      setJournal(await dbApi.getAllJournalEntries());
      setPhases(await dbApi.getAllComparisonPhases());
      const settings = await dbApi.getSettings();
      if (settings.activeComparisonPhaseId) {
        const p = await dbApi.getComparisonPhase(
          settings.activeComparisonPhaseId,
        );
        setHideAverages(!!p && !p.completedAt);
      }
    })();
  }, []);

  const symptomTrend = useMemo(() => {
    const ci = symptoms
      .filter((s) => s.instrument === "ci-inspired-15")
      .sort((a, b) => a.administeredAt.localeCompare(b.administeredAt));
    const vs = symptoms
      .filter((s) => s.instrument === "visual-stress-checklist")
      .sort((a, b) => a.administeredAt.localeCompare(b.administeredAt));
    const labels = [
      ...new Set([
        ...ci.map((s) => dayKey(s.administeredAt)),
        ...vs.map((s) => dayKey(s.administeredAt)),
      ]),
    ].sort();
    return {
      labels,
      datasets: [
        {
          label: "CI-inspired total",
          data: labels.map((d) => {
            const hits = ci.filter((s) => dayKey(s.administeredAt) === d);
            return hits.length ? mean(hits.map((h) => h.totalScore)) : null;
          }),
          borderColor: "#1f6b5a",
          backgroundColor: "#1f6b5a",
          spanGaps: true,
        },
        {
          label: "Visual-stress total",
          data: labels.map((d) => {
            const hits = vs.filter((s) => dayKey(s.administeredAt) === d);
            return hits.length ? mean(hits.map((h) => h.totalScore)) : null;
          }),
          borderColor: "#8a5a2b",
          backgroundColor: "#8a5a2b",
          spanGaps: true,
        },
      ],
    };
  }, [symptoms]);

  const glareByCpd = useMemo(() => {
    const freqs = [0.5, 3, 12] as const;
    const illusionCounts = freqs.map((f) => {
      const trials = gratings.filter((g) => g.spatialFrequencyCpd === f);
      if (!trials.length) return { mean: 0, sd: 0, n: 0 };
      const counts = trials.map(
        (t) =>
          Object.values(t.illusions).filter(Boolean).length,
      );
      return { mean: mean(counts), sd: stdev(counts), n: trials.length };
    });
    const discomfort = freqs.map((f) => {
      const trials = gratings.filter((g) => g.spatialFrequencyCpd === f);
      if (!trials.length) return { mean: 0, sd: 0, n: 0 };
      const vals = trials.map((t) => t.discomfortRating);
      return { mean: mean(vals), sd: stdev(vals), n: trials.length };
    });
    return {
      labels: freqs.map((f) => `${f} cpd`),
      illusionCounts,
      discomfort,
    };
  }, [gratings]);

  const readingSeries: ConditionSeries[] = useMemo(() => {
    const byCond = new Map<string, ReadingTrial[]>();
    for (const t of readings) {
      const list = byCond.get(t.conditionId) ?? [];
      list.push(t);
      byCond.set(t.conditionId, list);
    }
    return [...byCond.entries()].map(([id, trials]) => ({
      conditionId: id,
      label: conditions.find((c) => c.id === id)?.label ?? id.slice(0, 8),
      values: trials.map((t) => t.correctWordsPerMinute),
      sessionIds: trials.map((t) => t.sessionId),
    }));
  }, [readings, conditions]);

  const pairs = useMemo(
    () => compareAllPairs(readingSeries),
    [readingSeries],
  );

  const scatter = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (const j of journal) {
      const day = dayKey(j.occurredAt);
      const sameDay = gratings.filter((g) => dayKey(g.timestamp) === day);
      if (!sameDay.length) continue;
      points.push({
        x: mean(sameDay.map((g) => g.discomfortRating)),
        y: j.severity,
      });
    }
    return points;
  }, [journal, gratings]);

  const bestPair = pairs
    .filter((p) => !p.insufficient)
    .sort((a, b) => Math.abs(b.cohensDz) - Math.abs(a.cohensDz))[0];

  return (
    <div className="space-y-10">
      <p className="text-sm text-[var(--muted)]">{NOT_DIAGNOSTIC}</p>
      {hideAverages && (
        <p className="rounded border border-[var(--warn-border)] bg-[var(--warn-bg)] px-3 py-2 text-sm text-[var(--warn-ink)]">
          Comparison phase in progress — per-condition averages hidden to reduce
          expectation bias. Mark the phase complete on Interventions to unlock.
        </p>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">Symptom trends</h2>
        {symptomTrend.labels.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No symptom data yet.</p>
        ) : (
          <Line
            data={symptomTrend as never}
            options={{
              responsive: true,
              scales: { y: { beginAtZero: true } },
            }}
          />
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Pattern glare by spatial frequency</h2>
        <Bar
          data={{
            labels: glareByCpd.labels,
            datasets: [
              {
                label: "Mean illusion count",
                data: glareByCpd.illusionCounts.map((x) => x.mean),
                backgroundColor: "#1f6b5a88",
              },
              {
                label: "Mean discomfort",
                data: glareByCpd.discomfort.map((x) => x.mean),
                backgroundColor: "#8a5a2b88",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  afterBody: (items) => {
                    const i = items[0]?.dataIndex ?? 0;
                    const ill = glareByCpd.illusionCounts[i];
                    const dis = glareByCpd.discomfort[i];
                    return [
                      `Illusion SD=${ill?.sd.toFixed(2)} n=${ill?.n}`,
                      `Discomfort SD=${dis?.sd.toFixed(2)} n=${dis?.n}`,
                    ];
                  },
                },
              },
            },
          }}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Reading cwpm by condition</h2>
        {hideAverages ? (
          <p className="text-sm text-[var(--muted)]">
            Hidden during active comparison phase.
          </p>
        ) : (
          <Bar
            data={{
              labels: readingSeries.map((s) =>
                s.values.length < MIN_TRIALS_PER_CONDITION
                  ? `${s.label} (n=${s.values.length}/${MIN_TRIALS_PER_CONDITION})`
                  : `${s.label} (n=${s.values.length})`,
              ),
              datasets: [
                {
                  label: "Mean cwpm",
                  data: readingSeries.map((s) =>
                    s.values.length < MIN_TRIALS_PER_CONDITION
                      ? null
                      : mean(s.values),
                  ),
                  backgroundColor: readingSeries.map((s) =>
                    s.values.length < MIN_TRIALS_PER_CONDITION
                      ? "#ccc"
                      : "#1f6b5a",
                  ),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        )}
        <ul className="space-y-2 text-sm">
          {pairs.map((p) => (
            <li
              key={`${p.aId}-${p.bId}`}
              className={
                p.insufficient ? "text-[var(--muted)] opacity-60" : ""
              }
            >
              <strong>
                {p.aLabel} vs {p.bLabel}
              </strong>
              {p.insufficient ? (
                <> — insufficient data (need n≥{MIN_TRIALS_PER_CONDITION} each)</>
              ) : (
                <>
                  {" "}
                  · n={p.n} · Δ̄={p.meanDiff.toFixed(1)} cwpm · dz=
                  {Number.isFinite(p.cohensDz) ? p.cohensDz.toFixed(2) : "—"} ·
                  Wilcoxon p={p.wilcoxon.pValue.toFixed(3)} · t-test p=
                  {p.pairedT.pValue.toFixed(3)}
                  {p.testsDisagree ? " · tests disagree" : ""}
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Exploratory: journal vs same-day glare</h2>
        <p className="text-xs text-[var(--muted)]">{EXPLORATORY_CORRELATION}</p>
        {scatter.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Need same-day journal + Module B data.
          </p>
        ) : (
          <Scatter
            data={{
              datasets: [
                {
                  label: "Severity vs glare discomfort",
                  data: scatter,
                  backgroundColor: "#1f6b5a",
                },
              ],
            }}
            options={{
              scales: {
                x: { title: { display: true, text: "Module B discomfort" } },
                y: { title: { display: true, text: "Journal severity" } },
              },
            }}
          />
        )}
      </section>

      <section className="space-y-2 border-t border-[var(--border)] pt-6">
        <h2 className="font-semibold">Clinical visit summary</h2>
        <p className="text-sm text-[var(--muted)]">
          Sessions: {new Set(readings.map((r) => r.sessionId)).size || "—"} ·
          Symptom intakes: {symptoms.length} · Glare trials: {gratings.length} ·
          Reading trials: {readings.length} · Phases: {phases.length}
        </p>
        {bestPair && (
          <p className="text-sm">
            Largest effect (among n≥5 pairs): {bestPair.aLabel} vs{" "}
            {bestPair.bLabel}, dz=
            {Number.isFinite(bestPair.cohensDz)
              ? bestPair.cohensDz.toFixed(2)
              : "—"}{" "}
            (n={bestPair.n})
          </p>
        )}
        <Link href="/insights/print" className="btn btn-primary inline-block">
          Open print / PDF summary
        </Link>
      </section>
    </div>
  );
}
