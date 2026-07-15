import { SymptomForm } from "@/components/symptoms/SymptomForm";

export default function SymptomsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Module A · Symptom intake
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Baseline, repeatable symptom quantification (~5 minutes). Answers
          auto-save per question into local IndexedDB.
        </p>
      </header>
      <SymptomForm />
    </div>
  );
}
