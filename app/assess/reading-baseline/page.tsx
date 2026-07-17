import { ReadingTrialRunner } from "@/components/reading/ReadingTrial";

export default function AssessReadingBaselinePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-[var(--muted)]">Assess · step</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Reading baseline
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Paper-style continuous prose with no intervention. Prefer two built-in
          passages for a stable baseline; paste your own only for ecological
          practice.
        </p>
      </header>
      <ReadingTrialRunner
        lockedConditionId="condition-baseline-none"
        purpose="baseline"
        allowPaste
      />
    </div>
  );
}
