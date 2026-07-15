"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCalibration } from "@/lib/calibration/defaults";
import {
  cycleWidthPxForCpd,
  isHighFrequencyReliable,
  physicalWidthCm,
} from "@/lib/calibration/math";
import { viewingDistanceFor as vd } from "@/lib/calibration/defaults";
import { dbApi } from "@/lib/db/client";
import type { ScreenCalibration } from "@/lib/types";

export function CalibrationForm() {
  const [deviceLabel, setDeviceLabel] = useState("laptop screen");
  const [diagonal, setDiagonal] = useState("15.6");
  const [widthCm, setWidthCm] = useState("");
  const [resW, setResW] = useState("1920");
  const [resH, setResH] = useState("1080");
  const [assumedDist, setAssumedDist] = useState("50");
  const [measuredDist, setMeasuredDist] = useState("");
  const [acceptLow, setAcceptLow] = useState(false);
  const [saved, setSaved] = useState<ScreenCalibration | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setResW(String(window.screen.width));
      setResH(String(window.screen.height));
    }
    dbApi.getLatestCalibration().then((c) => {
      if (c) setSaved(c);
    });
  }, []);

  const preview = useMemo(() => {
    const diag = Number(diagonal) || 15.6;
    const rw = Number(resW) || 1920;
    const rh = Number(resH) || 1080;
    const measuredW = widthCm === "" ? undefined : Number(widthCm);
    const assumed = Number(assumedDist) || 50;
    const measuredD =
      measuredDist === "" ? undefined : Number(measuredDist);
    try {
      const cal = buildCalibration({
        deviceLabel,
        screenDiagonalInches: diag,
        resolutionPxW: rw,
        resolutionPxH: rh,
        measuredScreenWidthCm:
          measuredW && measuredW > 0 ? measuredW : undefined,
        assumedViewingDistanceCm: assumed,
        measuredViewingDistanceCm:
          measuredD && measuredD > 0 ? measuredD : undefined,
        acceptedLowConfidence: acceptLow && !measuredW,
      });
      const dist = vd(cal);
      const cpd3 = cycleWidthPxForCpd(3, dist, cal.pixelPitchCm);
      const cpd12 = cycleWidthPxForCpd(12, dist, cal.pixelPitchCm);
      return { cal, cpd3, cpd12, ok12: isHighFrequencyReliable(cpd12) };
    } catch {
      return null;
    }
  }, [
    deviceLabel,
    diagonal,
    widthCm,
    resW,
    resH,
    assumedDist,
    measuredDist,
    acceptLow,
  ]);

  return (
    <div className="space-y-6">
      {saved && (
        <p className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
          Current: <strong>{saved.deviceLabel}</strong> · confidence{" "}
          <strong>{saved.confidence}</strong> · calibrated{" "}
          {new Date(saved.calibratedAt).toLocaleString()}
        </p>
      )}

      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!preview) return;
          if (
            preview.cal.confidence === "low-confidence" &&
            !acceptLow
          ) {
            setMessage(
              "Check “accept low-confidence defaults” or measure screen width.",
            );
            return;
          }
          if (
            !preview.cal.measuredScreenWidthCm &&
            !acceptLow &&
            preview.cal.confidence !== "measured"
          ) {
            // diagonal-assumed is OK without checkbox
          }
          await dbApi.putCalibration(preview.cal);
          setSaved(preview.cal);
          setMessage("Calibration saved for this device.");
        }}
      >
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-[var(--muted)]">Device label</span>
          <input
            className="input"
            value={deviceLabel}
            onChange={(e) => setDeviceLabel(e.target.value)}
            required
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">
            Diagonal (inches)
          </span>
          <input
            className="input"
            type="number"
            step="0.1"
            min="1"
            value={diagonal}
            onChange={(e) => setDiagonal(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">
            Measured width (cm) — best
          </span>
          <input
            className="input"
            type="number"
            step="0.1"
            min="1"
            value={widthCm}
            onChange={(e) => setWidthCm(e.target.value)}
            placeholder="Ruler measurement"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">
            Resolution width (px)
          </span>
          <input
            className="input"
            type="number"
            value={resW}
            onChange={(e) => setResW(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">
            Resolution height (px)
          </span>
          <input
            className="input"
            type="number"
            value={resH}
            onChange={(e) => setResH(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">
            Assumed viewing distance (cm)
          </span>
          <input
            className="input"
            type="number"
            value={assumedDist}
            onChange={(e) => setAssumedDist(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">
            Measured viewing distance (cm)
          </span>
          <input
            className="input"
            type="number"
            value={measuredDist}
            onChange={(e) => setMeasuredDist(e.target.value)}
            placeholder="Tape measure"
          />
        </label>

        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={acceptLow}
            onChange={(e) => setAcceptLow(e.target.checked)}
            className="mt-1"
          />
          <span>
            Accept low-confidence defaults (diagonal + assumed distance only).
            Module B will flag trials accordingly.
          </span>
        </label>

        {preview && (
          <div className="sm:col-span-2 rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm space-y-1">
            <p>
              Confidence: <strong>{preview.cal.confidence}</strong>
            </p>
            <p>
              Pixel pitch: {preview.cal.pixelPitchCm.toFixed(5)} cm · viewing{" "}
              {vd(preview.cal).toFixed(1)} cm
            </p>
            <p>
              3 cpd cycle ≈ {preview.cpd3.toFixed(1)} px · 12 cpd ≈{" "}
              {preview.cpd12.toFixed(1)} px
              {!preview.ok12 && (
                <span className="text-[var(--danger)]">
                  {" "}
                  — 12 cpd may not render accurately on this device
                </span>
              )}
            </p>
            <p className="text-[var(--muted)]">
              Physical width used:{" "}
              {physicalWidthCm({
                measuredScreenWidthCm: preview.cal.measuredScreenWidthCm,
                screenDiagonalInches: preview.cal.screenDiagonalInches,
              }).toFixed(2)}{" "}
              cm
            </p>
          </div>
        )}

        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-primary">
            Save calibration
          </button>
          {message && (
            <p className="mt-2 text-sm text-[var(--accent)]">{message}</p>
          )}
        </div>
      </form>
    </div>
  );
}
