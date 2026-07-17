import { SymptomForm } from "@/components/symptoms/SymptomForm";

export default function AssessSymptomsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-[var(--muted)]">Assess · step</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Symptoms
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Baseline checklists for trend tracking — not clinical diagnosis.
        </p>
      </header>
      <SymptomForm />
    </div>
  );
}
