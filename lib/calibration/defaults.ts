import type { CalibrationConfidence, ScreenCalibration } from "@/lib/types";
import { createId } from "@/lib/id";
import {
  effectiveViewingDistanceCm,
  physicalWidthCm,
  pixelPitchCm,
} from "./math";

export const DEFAULT_VIEWING_DISTANCE_CM = 50;

export function deriveConfidence(opts: {
  measuredScreenWidthCm?: number;
  measuredViewingDistanceCm?: number;
  acceptedLowConfidence?: boolean;
}): CalibrationConfidence {
  if (opts.measuredScreenWidthCm && opts.measuredViewingDistanceCm) {
    return "measured";
  }
  if (opts.acceptedLowConfidence && !opts.measuredScreenWidthCm) {
    return "low-confidence";
  }
  return "diagonal-assumed";
}

export function buildCalibration(input: {
  deviceLabel: string;
  screenDiagonalInches: number;
  resolutionPxW: number;
  resolutionPxH: number;
  measuredScreenWidthCm?: number;
  assumedViewingDistanceCm?: number;
  measuredViewingDistanceCm?: number;
  acceptedLowConfidence?: boolean;
}): ScreenCalibration {
  const assumedViewingDistanceCm =
    input.assumedViewingDistanceCm ?? DEFAULT_VIEWING_DISTANCE_CM;
  const widthCm = physicalWidthCm({
    measuredScreenWidthCm: input.measuredScreenWidthCm,
    screenDiagonalInches: input.screenDiagonalInches,
  });
  const pitch = pixelPitchCm(widthCm, input.resolutionPxW);

  return {
    id: createId(),
    deviceLabel: input.deviceLabel,
    screenDiagonalInches: input.screenDiagonalInches,
    resolutionPxW: input.resolutionPxW,
    resolutionPxH: input.resolutionPxH,
    measuredScreenWidthCm: input.measuredScreenWidthCm,
    pixelPitchCm: pitch,
    assumedViewingDistanceCm,
    measuredViewingDistanceCm: input.measuredViewingDistanceCm,
    calibratedAt: new Date().toISOString(),
    confidence: deriveConfidence({
      measuredScreenWidthCm: input.measuredScreenWidthCm,
      measuredViewingDistanceCm: input.measuredViewingDistanceCm,
      acceptedLowConfidence: input.acceptedLowConfidence,
    }),
  };
}

export function viewingDistanceFor(cal: ScreenCalibration): number {
  return effectiveViewingDistanceCm(cal);
}
