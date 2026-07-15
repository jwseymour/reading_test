import { CalibrationForm } from "@/components/calibration/CalibrationForm";

export default function CalibrationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Screen calibration
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Cycles-per-degree depends on visual angle. Measure screen width and
          viewing distance when you can — Module B is gated until a calibration
          exists.
        </p>
      </header>
      <CalibrationForm />
    </div>
  );
}
