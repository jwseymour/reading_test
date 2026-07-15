"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SessionPanel } from "@/components/shell/SessionPanel";
import { dbApi } from "@/lib/db/client";
import type { ScreenCalibration } from "@/lib/types";

const MODULES = [
  {
    href: "/symptoms",
    title: "A · Symptoms",
    blurb: "CI-inspired and visual-stress checklists with trend-ready scores.",
  },
  {
    href: "/pattern-glare",
    title: "B · Pattern glare",
    blurb: "Static square-wave gratings with structured illusion ratings.",
  },
  {
    href: "/reading",
    title: "C · Reading",
    blurb: "WRRT-inspired passages with per-line timing and cwpm.",
  },
  {
    href: "/interventions",
    title: "D · Interventions",
    blurb: "Overlays, typography, and ruler aids under counterbalanced trials.",
  },
  {
    href: "/binocular",
    title: "E · Binocular",
    blurb: "NPC logging and a digital saccade baseline — screening only.",
  },
  {
    href: "/journal",
    title: "F · Journal",
    blurb: "Real-world trigger notes with optional local photos.",
  },
  {
    href: "/analytics",
    title: "G · Analytics",
    blurb: "Trends, comparisons, and a print-ready clinical summary.",
  },
] as const;

export default function HomePage() {
  const [calibration, setCalibration] = useState<ScreenCalibration | null>(
    null,
  );

  useEffect(() => {
    dbApi.getLatestCalibration().then((c) => setCalibration(c ?? null));
  }, []);

  const calLabel = !calibration
    ? "Missing — required before pattern glare"
    : calibration.confidence === "measured"
      ? `Measured · ${calibration.deviceLabel}`
      : calibration.confidence === "low-confidence"
        ? `Low confidence · ${calibration.deviceLabel}`
        : `Diagonal-assumed · ${calibration.deviceLabel}`;

  return (
    <div className="space-y-10">
      <header className="max-w-2xl space-y-4">
        <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-[var(--ink)] sm:text-6xl">
          PerceptLab
        </p>
        <p className="text-lg text-[var(--muted)]">
          Characterise pattern glare and near-work symptoms, then test what
          actually helps — with counterbalanced trials and exportable data for
          your optometrist.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/calibration" className="btn btn-primary">
            Calibrate screen
          </Link>
          <Link href="/journal" className="btn btn-secondary">
            Log a trigger
          </Link>
          <Link href="/disclaimer" className="btn btn-secondary">
            Read limits first
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Session
        </h2>
        <SessionPanel />
        <p className="text-sm text-[var(--muted)]">
          Calibration:{" "}
          <span className="font-medium text-[var(--ink)]">{calLabel}</span>
          {" · "}
          <Link href="/calibration" className="underline">
            Update
          </Link>
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Modules
        </h2>
        <ul className="divide-y divide-[var(--border)]">
          {MODULES.map((m) => (
            <li key={m.href} className="py-4 first:pt-0">
              <Link
                href={m.href}
                className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">
                  {m.title}
                </span>
                <span className="max-w-md text-sm text-[var(--muted)] sm:text-right">
                  {m.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
