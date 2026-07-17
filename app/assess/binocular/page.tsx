import { DisclaimerBanner } from "@/components/shell/DisclaimerBanner";
import { NpcForm } from "@/components/binocular/NpcForm";
import { SaccadeTask } from "@/components/binocular/SaccadeTask";
import { BINOCULAR_BANNER } from "@/lib/content/disclaimers";

export default function AssessBinocularPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--muted)]">Assess · step (optional)</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Binocular screening
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Screening aids only — bring results to an optometrist.
        </p>
      </header>
      <DisclaimerBanner message={BINOCULAR_BANNER} />
      <NpcForm />
      <SaccadeTask />
    </div>
  );
}
