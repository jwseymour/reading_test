import { ReadingTrialRunner } from "@/components/reading/ReadingTrial";

export default function ReadingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Module C · Reading performance
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Fixed WRRT-inspired passages, reader-initiated timing, per-line
          keypresses. Text different text sizes and fonts via conditions — or
          run the guided comparison on Interventions for a full protocol.
        </p>
      </header>
      <ReadingTrialRunner />
    </div>
  );
}
