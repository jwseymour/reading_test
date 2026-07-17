"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SessionPanel } from "@/components/shell/SessionPanel";
import { ProgressChecklist } from "@/components/shell/ProgressChecklist";
import { loadProgressSnapshot } from "@/lib/progress/loadProgress";
import type { ProgressSnapshot } from "@/lib/progress/status";
import type { BaselineProfile } from "@/lib/recommendations/fromBaseline";

export default function HomePage() {
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [profile, setProfile] = useState<BaselineProfile | null>(null);

  useEffect(() => {
    loadProgressSnapshot().then(({ progress: p, profile: pr }) => {
      setProgress(p);
      setProfile(pr);
    });
  }, []);

  const next = progress?.nextStep;

  return (
    <div className="space-y-10">
      <header className="max-w-2xl space-y-4">
        <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-[var(--ink)] sm:text-6xl">
          PerceptLab
        </p>
        <p className="text-lg text-[var(--muted)]">
          First characterise the problem, then search for what helps — with a
          clear path, not a pile of disconnected modules.
        </p>
        <div className="flex flex-wrap gap-3">
          {next ? (
            <Link href={next.href} className="btn btn-primary">
              Next: {next.title}
            </Link>
          ) : progress?.assessReadyForFind ? (
            <Link href="/find" className="btn btn-primary">
              Continue: Find what helps
            </Link>
          ) : (
            <Link href="/assess" className="btn btn-primary">
              Start Assess
            </Link>
          )}
          <Link href="/assess" className="btn btn-secondary">
            Assess overview
          </Link>
          <Link href="/playground" className="btn btn-secondary">
            Playground
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Session
        </h2>
        <SessionPanel />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Assess progress
          </h2>
          {progress && (
            <p className="text-sm text-[var(--muted)]">
              {progress.completedRequired}/{progress.totalRequired} required
              steps complete
              {progress.assessReadyForFind ? " · ready for Find" : ""}
            </p>
          )}
        </div>
        {progress ? (
          <ProgressChecklist
            steps={progress.steps}
            nextHref={next?.href}
          />
        ) : (
          <p className="text-sm text-[var(--muted)]">Loading progress…</p>
        )}
      </section>

      {profile && profile.signals.length > 0 && (
        <section className="space-y-2 border-t border-[var(--border)] pt-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Baseline signals so far
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Visual-stress lean: <strong>{profile.visualStressLean}</strong> ·
            CI lean: <strong>{profile.ciLean}</strong> · Reading friction:{" "}
            <strong>{profile.readingFriction}</strong>
          </p>
          <ul className="list-disc pl-5 text-sm text-[var(--muted)]">
            {profile.recommendations.slice(0, 3).map((r) => (
              <li key={r.family}>
                <span className="font-medium text-[var(--ink)]">{r.family}</span>
                {" — "}
                {r.reason}
              </li>
            ))}
          </ul>
          {progress?.assessReadyForFind && (
            <Link href="/find" className="btn btn-primary mt-2 inline-block">
              Use these in Find what helps
            </Link>
          )}
        </section>
      )}

      <section className="grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-3">
        <AreaCard
          href="/find"
          title="Find what helps"
          blurb="Adaptive search: pick families from your baseline, A/B winners, combine, confirm."
        />
        <AreaCard
          href="/playground"
          title="Playground"
          blurb="Freely tweak overlays, fonts, and size. Exploration only — not confirmation."
        />
        <AreaCard
          href="/insights"
          title="Insights"
          blurb="Trends, comparisons, clinical summary, and export."
        />
      </section>
    </div>
  );
}

function AreaCard({
  href,
  title,
  blurb,
}: {
  href: string;
  title: string;
  blurb: string;
}) {
  return (
    <Link
      href={href}
      className="block space-y-1 border-t border-[var(--border)] pt-3 transition-colors hover:border-[var(--accent)]"
    >
      <span className="font-semibold text-[var(--ink)]">{title}</span>
      <p className="text-sm text-[var(--muted)]">{blurb}</p>
    </Link>
  );
}
