"use client";

import { useEffect, useRef, useState } from "react";
import { viewingDistanceFor } from "@/lib/calibration/defaults";
import { cycleWidthPxForCpd } from "@/lib/calibration/math";
import {
  drawSquareWaveGrating,
  fillNeutralGrey,
} from "@/lib/stimuli/grating";
import {
  GRATING_EXPOSURE_DEFAULT_MS,
  clampExposureMs,
} from "@/lib/session/safety";
import { useSafety } from "@/lib/session/SafetyContext";
import type {
  GratingIllusions,
  GratingOrientation,
  ScreenCalibration,
  SpatialFrequencyCpd,
} from "@/lib/types";
import { IllusionChecklist } from "./IllusionChecklist";

const EMPTY_ILLUSIONS: GratingIllusions = {
  motion: false,
  colorFringing: false,
  shapeDistortion: false,
  flicker: false,
  blur: false,
};

type Phase = "ready" | "exposing" | "rate";

export function GratingTrialView({
  calibration,
  spatialFrequencyCpd,
  orientation,
  trialIndex,
  trialCount,
  onComplete,
}: {
  calibration: ScreenCalibration;
  spatialFrequencyCpd: SpatialFrequencyCpd;
  orientation: GratingOrientation;
  trialIndex: number;
  trialCount: number;
  onComplete: (result: {
    illusions: GratingIllusions;
    discomfortRating: number;
    exposureDurationMs: number;
  }) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stopped, clearStop, markSessionActivity, neutralGrey } = useSafety();
  const [phase, setPhase] = useState<Phase>("ready");
  const [remainingMs, setRemainingMs] = useState(GRATING_EXPOSURE_DEFAULT_MS);
  const [illusions, setIllusions] = useState(EMPTY_ILLUSIONS);
  const [discomfort, setDiscomfort] = useState(0);
  const exposureMs = clampExposureMs(GRATING_EXPOSURE_DEFAULT_MS);

  const cyclePx = cycleWidthPxForCpd(
    spatialFrequencyCpd,
    viewingDistanceFor(calibration),
    calibration.pixelPitchCm,
  );

  useEffect(() => {
    markSessionActivity();
  }, [markSessionActivity, trialIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (stopped || phase !== "exposing") {
      fillNeutralGrey(ctx, cssW, cssH, neutralGrey);
      return;
    }

    drawSquareWaveGrating({
      ctx,
      width: cssW,
      height: cssH,
      cycleWidthPx: cyclePx,
      orientation,
      contrast: 1,
    });
  }, [phase, stopped, cyclePx, orientation, neutralGrey, trialIndex]);

  useEffect(() => {
    if (phase !== "exposing" || stopped) return;
    const start = Date.now();
    setRemainingMs(exposureMs);
    const id = window.setInterval(() => {
      const left = exposureMs - (Date.now() - start);
      setRemainingMs(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(id);
        setPhase("rate");
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [phase, stopped, exposureMs]);

  useEffect(() => {
    if (stopped && phase === "exposing") {
      setPhase("rate");
    }
  }, [stopped, phase]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Trial {trialIndex + 1} / {trialCount} · {spatialFrequencyCpd} cpd ·{" "}
        {orientation} · calibration {calibration.confidence}
      </p>

      <canvas
        ref={canvasRef}
        className="h-[min(60vh,480px)] w-full rounded border border-[var(--border)]"
        style={{ background: neutralGrey }}
      />

      {phase === "ready" && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            clearStop();
            setIllusions(EMPTY_ILLUSIONS);
            setDiscomfort(0);
            setPhase("exposing");
          }}
        >
          Show grating ({exposureMs / 1000}s)
        </button>
      )}

      {phase === "exposing" && (
        <p className="font-mono text-sm">
          {stopped
            ? "Stopped — blanked"
            : `Exposure… ${Math.ceil(remainingMs / 1000)}s`}
        </p>
      )}

      {phase === "rate" && (
        <IllusionChecklist
          illusions={illusions}
          onChange={setIllusions}
          discomfort={discomfort}
          onDiscomfort={setDiscomfort}
          onSubmit={() =>
            onComplete({
              illusions,
              discomfortRating: discomfort,
              exposureDurationMs: exposureMs,
            })
          }
        />
      )}
    </div>
  );
}
