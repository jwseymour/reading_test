import { PatternGlareBattery } from "@/components/pattern-glare/PatternGlareBattery";

export default function AssessPatternGlarePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-[var(--muted)]">Assess · step</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Pattern glare
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Characterise susceptibility to static striped patterns. Full battery
          preferred for a stronger baseline signal.
        </p>
      </header>
      <PatternGlareBattery />
    </div>
  );
}
