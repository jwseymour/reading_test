"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressChecklist } from "@/components/shell/ProgressChecklist";
import { loadProgressSnapshot } from "@/lib/progress/loadProgress";
import type { ProgressSnapshot } from "@/lib/progress/status";
import type { BaselineProfile } from "@/lib/recommendations/fromBaseline";

export default function AssessPage() {
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [profile, setProfile] = useState<BaselineProfile | null>(null);

  useEffect(() => {
    loadProgressSnapshot().then(({ progress: p, profile: pr }) => {
      setProgress(p);
      setProfile(pr);
    });
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Assess
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Measure the problem before trying to fix it. Work through the steps
          below; Find what helps uses these signals to suggest which
          intervention families to test first.
        </p>
      </header>

      {progress && (
        <>
          <p className="text-sm text-[var(--muted)]">
            {progress.completedRequired}/{progress.totalRequired} required ·{" "}
            {progress.assessReadyForFind
              ? "Enough signal to start Find"
              : "Keep going — calibration, symptoms, glare, and a reading baseline unlock Find"}
          </p>
          <ProgressChecklist
            steps={progress.steps}
            nextHref={progress.nextStep?.href}
          />
        </>
      )}

      {profile && (
        <section className="space-y-3 rounded border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="font-semibold">Baseline profile</h2>
          <p className="text-sm">
            Visual-stress lean: <strong>{profile.visualStressLean}</strong> · CI
            lean: <strong>{profile.ciLean}</strong> · Reading friction:{" "}
            <strong>{profile.readingFriction}</strong>
          </p>
          {profile.signals.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-[var(--muted)]">
              {profile.signals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
          <h3 className="text-sm font-medium">Suggested families for Find</h3>
          <ul className="space-y-2 text-sm">
            {profile.recommendations.map((r) => (
              <li key={r.family}>
                <strong>{r.family}</strong> — {r.reason}
              </li>
            ))}
          </ul>
          {progress?.assessReadyForFind && (
            <Link href="/find" className="btn btn-primary inline-block">
              Go to Find what helps
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
