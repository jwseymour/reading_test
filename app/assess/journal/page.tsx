import { JournalForm } from "@/components/journal/JournalForm";

export default function AssessJournalPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-[var(--muted)]">Assess · optional</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Trigger journal
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Log real-world events. Photos stay on this device.
        </p>
      </header>
      <JournalForm />
    </div>
  );
}