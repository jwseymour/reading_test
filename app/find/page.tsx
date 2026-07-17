import { FindStagedWizard } from "@/components/find/FindStagedWizard";

export default function FindPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Find what helps
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Adaptive search guided by your Assess results: choose families, A/B
          within each, combine winners, confirm against baseline. Not a
          combinatorial grind of every slider.
        </p>
      </header>
      <FindStagedWizard />
    </div>
  );
}
