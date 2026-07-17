"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Dashboard } from "@/components/analytics/Dashboard";
import { ExportControls } from "@/components/data/ExportControls";
import { RawTables } from "@/components/data/RawTables";
import { loadProgressSnapshot } from "@/lib/progress/loadProgress";
import type { BaselineProfile } from "@/lib/recommendations/fromBaseline";
import { dbApi } from "@/lib/db/client";
import type { ComparisonPhase } from "@/lib/types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "comparisons", label: "Comparisons" },
  { id: "summary", label: "Clinical summary" },
  { id: "data", label: "Raw data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function InsightsInner() {
  const params = useSearchParams();
  const tabParam = params.get("tab") as TabId | null;
  const [tab, setTab] = useState<TabId>(tabParam ?? "overview");
  const [profile, setProfile] = useState<BaselineProfile | null>(null);
  const [phases, setPhases] = useState<ComparisonPhase[]>([]);
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) setTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    loadProgressSnapshot().then(({ profile: p }) => setProfile(p));
    dbApi.getAllComparisonPhases().then(setPhases);
  }, []);

  const completed = phases.filter((p) => p.completedAt);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Insights
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Trends, Find-phase comparisons, clinical summary, and local export.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${
              tab === t.id
                ? "bg-[var(--accent-soft)] font-medium"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section className="space-y-4">
          {profile ? (
            <div className="space-y-2 rounded border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
              <h2 className="font-semibold">Assess profile</h2>
              <p>
                Visual-stress lean: <strong>{profile.visualStressLean}</strong> ·
                CI lean: <strong>{profile.ciLean}</strong> · Reading friction:{" "}
                <strong>{profile.readingFriction}</strong>
              </p>
              <ul className="list-disc pl-5 text-[var(--muted)]">
                {profile.signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <h3 className="font-medium">Families suggested from Assess</h3>
              <ul className="space-y-1">
                {profile.recommendations.map((r) => (
                  <li key={r.family}>
                    <strong>{r.family}</strong> — {r.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Loading profile…</p>
          )}
          <div className="space-y-2">
            <h2 className="font-semibold">Completed Find phases</h2>
            {completed.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                None yet.{" "}
                <Link href="/find" className="underline">
                  Run Find what helps
                </Link>
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {completed.map((p) => (
                  <li
                    key={p.id}
                    className="rounded border border-[var(--border)] px-3 py-2"
                  >
                    {new Date(p.completedAt!).toLocaleString()}
                    {p.confirmedProfileId
                      ? ` · profile ${p.confirmedProfileId.slice(0, 12)}…`
                      : ""}
                    <br />
                    <span className="text-[var(--muted)]">
                      Prediction: {p.prediction}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === "comparisons" && <Dashboard />}

      {tab === "summary" && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">
            Print-friendly one-pager for an optometrist visit.
          </p>
          <Link href="/insights/print" className="btn btn-primary inline-block">
            Open print / PDF summary
          </Link>
        </div>
      )}

      {tab === "data" && (
        <div className="space-y-8">
          <ExportControls onChanged={() => setTableKey((k) => k + 1)} />
          <RawTables key={tableKey} />
        </div>
      )}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
      <InsightsInner />
    </Suspense>
  );
}
