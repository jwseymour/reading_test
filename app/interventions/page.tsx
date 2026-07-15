import { ConditionEditor } from "@/components/interventions/ConditionEditor";
import { GuidedComparisonTest } from "@/components/interventions/GuidedComparisonTest";

export default function InterventionsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Module D · Interventions
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Use the guided comparison test to find what helps most under
          counterbalanced reading trials. The sandbox below is for exploring
          overlays, fonts (including OpenDyslexic), text size, and spacing by
          feel.
        </p>
      </header>
      <GuidedComparisonTest />
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Parameter sandbox
        </h2>
        <ConditionEditor />
      </section>
    </div>
  );
}
