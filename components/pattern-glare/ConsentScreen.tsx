"use client";

import { PATTERN_GLARE_INSPIRED } from "@/lib/content/disclaimers";

export function ConsentScreen({
  onConsent,
  onSkip,
}: {
  onConsent: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="max-w-xl space-y-4 rounded border border-[var(--warn-border)] bg-[var(--warn-bg)] p-6 text-[var(--warn-ink)]">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
        Before pattern glare trials
      </h2>
      <p className="text-sm">
        You are about to view high-contrast black-and-white striped patterns for
        up to 10 seconds at a time. These can cause visual discomfort,
        illusions of motion, or headache in susceptible people — that is what
        the test measures.
      </p>
      <p className="text-sm">{PATTERN_GLARE_INSPIRED}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>No flicker or strobe is used — patterns are static.</li>
        <li>Exposure is capped; rest periods are mandatory between trials.</li>
        <li>
          The red <strong>STOP</strong> button blanks the screen immediately,
          no confirmation.
        </li>
        <li>You may skip this module today with no justification.</li>
      </ul>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" className="btn btn-primary" onClick={onConsent}>
          I understand — continue
        </button>
        <button type="button" className="btn btn-secondary" onClick={onSkip}>
          Skip this module today
        </button>
      </div>
    </div>
  );
}
