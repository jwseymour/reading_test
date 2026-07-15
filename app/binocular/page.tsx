import { DisclaimerBanner } from "@/components/shell/DisclaimerBanner";
import { NpcForm } from "@/components/binocular/NpcForm";
import { SaccadeTask } from "@/components/binocular/SaccadeTask";
import { BINOCULAR_BANNER } from "@/lib/content/disclaimers";

export default function BinocularPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Module E · Binocular screening
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Cheap proxies only. Bring results to an optometrist — do not treat
          them as conclusive.
        </p>
      </header>
      <DisclaimerBanner message={BINOCULAR_BANNER} />
      <NpcForm />
      <SaccadeTask />
      <p className="text-sm text-[var(--muted)]">
        Camera-assisted NPC with on-screen fiducials is deferred — self-report
        logging is the supported path.
      </p>
    </div>
  );
}
