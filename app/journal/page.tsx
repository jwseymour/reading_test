import { JournalForm } from "@/components/journal/JournalForm";

export default function JournalPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Module F · Trigger journal
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Low-friction capture of real-world events. Photos never leave this
          device unless you export a separate bundle later.
        </p>
      </header>
      <JournalForm />
    </div>
  );
}
