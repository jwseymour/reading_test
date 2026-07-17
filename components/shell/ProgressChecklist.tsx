"use client";

import Link from "next/link";
import type { AssessStep, StepStatus } from "@/lib/progress/status";

const STATUS_LABEL: Record<StepStatus, string> = {
  missing: "Not started",
  partial: "In progress",
  done: "Done",
  optional: "Optional",
};

export function ProgressChecklist({
  steps,
  nextHref,
}: {
  steps: AssessStep[];
  nextHref?: string | null;
}) {
  return (
    <ul className="divide-y divide-[var(--border)]">
      {steps.map((step) => (
        <li
          key={step.id}
          className="flex flex-wrap items-center justify-between gap-3 py-3"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-[var(--ink)]">{step.title}</span>
              <StatusChip status={step.status} />
              {!step.required && (
                <span className="text-xs text-[var(--muted)]">optional</span>
              )}
            </div>
            <p className="text-sm text-[var(--muted)]">{step.detail}</p>
          </div>
          <Link
            href={step.href}
            className={`btn shrink-0 text-sm ${
              nextHref === step.href ? "btn-primary" : "btn-secondary"
            }`}
          >
            {step.status === "done" ? "Review" : "Open"}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function StatusChip({ status }: { status: StepStatus }) {
  const tone =
    status === "done"
      ? "bg-[var(--accent-soft)] text-[var(--ink)]"
      : status === "partial"
        ? "bg-[var(--warn-bg)] text-[var(--warn-ink)]"
        : status === "optional"
          ? "bg-[var(--surface-2)] text-[var(--muted)]"
          : "bg-[var(--surface-2)] text-[var(--muted)]";
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
