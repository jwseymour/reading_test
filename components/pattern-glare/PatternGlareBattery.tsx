"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ConsentScreen } from "./ConsentScreen";
import { GratingTrialView } from "./GratingTrial";
import { RestScreen } from "./RestScreen";
import { dbApi } from "@/lib/db/client";
import { createId } from "@/lib/id";
import {
  buildFullGlarePlan,
  buildQuickGlarePlan,
  type GratingPlanItem,
} from "@/lib/scheduling/trialPlans";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";
import { cycleWidthPxForCpd, isHighFrequencyReliable } from "@/lib/calibration/math";
import { viewingDistanceFor } from "@/lib/calibration/defaults";
import type { ScreenCalibration } from "@/lib/types";

type Mode = "quick" | "full";
type Step = "consent" | "trial" | "rest" | "done" | "skipped";

export function PatternGlareBattery() {
  const { ensureSession } = useSessionMeta();
  const [calibration, setCalibration] = useState<ScreenCalibration | null>(
    null,
  );
  const [mode, setMode] = useState<Mode>("full");
  const [step, setStep] = useState<Step>("consent");
  const [plan, setPlan] = useState<GratingPlanItem[]>([]);
  const [index, setIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const cal = await dbApi.getLatestCalibration();
    setCalibration(cal ?? null);
    const session = await ensureSession();
    setSessionId(session.id);
    const settings = await dbApi.getSettings();
    if (cal && settings.moduleBConsentSessionId === session.id) {
      setStep("trial");
    } else if (cal) {
      setStep("consent");
    }
  }, [ensureSession]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (step === "trial" && plan.length === 0) {
      setPlan(mode === "quick" ? buildQuickGlarePlan() : buildFullGlarePlan());
      setIndex(0);
    }
  }, [step, mode, plan.length]);

  if (!calibration) {
    return (
      <div className="space-y-3 rounded border border-[var(--warn-border)] bg-[var(--warn-bg)] p-4 text-[var(--warn-ink)]">
        <p className="font-semibold">Calibration required</p>
        <p className="text-sm">
          Module B will not render gratings without a completed calibration for
          this device. Without it, &quot;3 cpd&quot; is a guess — not a
          measurement.
        </p>
        <Link href="/calibration" className="btn btn-primary inline-block">
          Go to calibration
        </Link>
      </div>
    );
  }

  if (step === "skipped") {
    return (
      <p className="text-[var(--muted)]">
        Module skipped for this session. You can return anytime.
      </p>
    );
  }

  if (step === "consent") {
    return (
      <ConsentScreen
        onSkip={() => setStep("skipped")}
        onConsent={async () => {
          if (!sessionId) return;
          const settings = await dbApi.getSettings();
          await dbApi.putSettings({
            ...settings,
            moduleBConsentSessionId: sessionId,
          });
          setPlan(
            mode === "quick" ? buildQuickGlarePlan() : buildFullGlarePlan(),
          );
          setIndex(0);
          setStep("trial");
        }}
      />
    );
  }

  if (step === "done") {
    return (
      <div className="space-y-3">
        <p className="font-semibold">Battery complete.</p>
        <p className="text-sm text-[var(--muted)]">
          {plan.length} trials saved. Review them on the Data page or Analytics.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setPlan([]);
            setStep("consent");
          }}
        >
          Run again
        </button>
      </div>
    );
  }

  if (step === "rest") {
    return (
      <RestScreen
        onDone={() => {
          if (index + 1 >= plan.length) setStep("done");
          else {
            setIndex((i) => i + 1);
            setStep("trial");
          }
        }}
      />
    );
  }

  const item = plan[index];
  if (!item) {
    return <p className="text-sm text-[var(--muted)]">Preparing trials…</p>;
  }

  const cyc12 = cycleWidthPxForCpd(
    12,
    viewingDistanceFor(calibration),
    calibration.pixelPitchCm,
  );
  const warn12 =
    item.spatialFrequencyCpd === 12 && !isHighFrequencyReliable(cyc12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          Mode
          <select
            className="input w-auto"
            value={mode}
            disabled={index > 0}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              setPlan([]);
            }}
          >
            <option value="full">Full (0.5/3/12 cpd, 18 trials)</option>
            <option value="quick">Quick (3 cpd, 6 trials)</option>
          </select>
        </label>
      </div>
      {warn12 && (
        <p className="text-sm text-[var(--danger)]">
          Warning: 12 cpd cycle width is ~{cyc12.toFixed(1)} px on this
          calibration — square-wave accuracy may be poor.
        </p>
      )}
      <GratingTrialView
        key={`${index}-${item.orientation}-${item.spatialFrequencyCpd}`}
        calibration={calibration}
        spatialFrequencyCpd={item.spatialFrequencyCpd}
        orientation={item.orientation}
        trialIndex={index}
        trialCount={plan.length}
        onComplete={async (result) => {
          if (!sessionId) return;
          await dbApi.putGratingTrial({
            id: createId(),
            sessionId,
            calibrationId: calibration.id,
            spatialFrequencyCpd: item.spatialFrequencyCpd,
            orientation: item.orientation,
            contrast: 1,
            exposureDurationMs: result.exposureDurationMs,
            illusions: result.illusions,
            discomfortRating: result.discomfortRating,
            timestamp: new Date().toISOString(),
          });
          setStep("rest");
        }}
      />
    </div>
  );
}
