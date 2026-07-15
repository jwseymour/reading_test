import { PatternGlareBattery } from "@/components/pattern-glare/PatternGlareBattery";

export default function PatternGlarePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Module B · Pattern glare
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Static square-wave gratings with fixed exposure, mandatory rest, and
          a global stop control. Inspired by clinical pattern-glare protocols —
          not the proprietary test.
        </p>
      </header>
      <PatternGlareBattery />
    </div>
  );
}
