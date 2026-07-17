import { CalibrationForm } from "@/components/calibration/CalibrationForm";

export default function AssessCalibrationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-[var(--muted)]">Assess · step</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Calibration
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Required before pattern glare. Prefer measured width and viewing
          distance.
        </p>
      </header>
      <CalibrationForm />
    </div>
  );
}
