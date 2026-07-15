"use client";

import { useCallback, useEffect, useState } from "react";
import { dbApi } from "@/lib/db/client";
import type { ExportBundle } from "@/lib/types";

export function RawTables() {
  const [bundle, setBundle] = useState<ExportBundle | null>(null);

  const reload = useCallback(async () => {
    setBundle(await dbApi.exportBundle());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (!bundle) {
    return <p className="text-sm text-[var(--muted)]">Loading…</p>;
  }

  const sections: { title: string; rows: unknown[] }[] = [
    { title: "Calibrations", rows: bundle.calibrations },
    { title: "Sessions", rows: bundle.sessions },
    { title: "Symptom surveys", rows: bundle.symptomSurveys },
    { title: "Grating trials", rows: bundle.gratingTrials },
    { title: "Conditions", rows: bundle.conditions },
    { title: "Subjective overlay trials", rows: bundle.subjectiveOverlayTrials },
    { title: "Passages", rows: bundle.passages },
    { title: "Reading trials", rows: bundle.readingTrials },
    { title: "Convergence trials", rows: bundle.convergenceTrials },
    { title: "Journal entries", rows: bundle.journalEntries },
    { title: "Comparison phases", rows: bundle.comparisonPhases },
  ];

  return (
    <div className="space-y-8" data-reload-hook="">
      <button type="button" className="btn btn-secondary" onClick={reload}>
        Refresh tables
      </button>
      {sections.map((s) => (
        <section key={s.title}>
          <h3 className="mb-2 font-semibold">
            {s.title}{" "}
            <span className="font-normal text-[var(--muted)]">
              ({s.rows.length})
            </span>
          </h3>
          {s.rows.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No records</p>
          ) : (
            <div className="max-h-64 overflow-auto rounded border border-[var(--border)]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[var(--surface-2)]">
                  <tr>
                    {Object.keys(s.rows[0] as object)
                      .slice(0, 8)
                      .map((k) => (
                        <th key={k} className="px-2 py-1 font-medium">
                          {k}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {s.rows.map((row, i) => {
                    const obj = row as Record<string, unknown>;
                    const keys = Object.keys(obj).slice(0, 8);
                    return (
                      <tr
                        key={i}
                        className="border-t border-[var(--border)] odd:bg-[var(--surface)]"
                      >
                        {keys.map((k) => (
                          <td key={k} className="max-w-[12rem] truncate px-2 py-1">
                            {formatCell(obj[k])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
