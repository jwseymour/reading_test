/** Spatial-frequency / pixel conversion — design doc §8 */

export const RAD_TO_DEG = 180 / Math.PI; // ≈ 57.2958

export function screenWidthCmFromDiagonalInches(
  diagonalInches: number,
  aspectW = 16,
  aspectH = 9,
): number {
  const widthIn =
    diagonalInches * (aspectW / Math.sqrt(aspectW ** 2 + aspectH ** 2));
  return widthIn * 2.54;
}

export function pixelPitchCm(
  physicalScreenWidthCm: number,
  resolutionPxW: number,
): number {
  if (resolutionPxW <= 0) {
    throw new Error("resolutionPxW must be positive");
  }
  return physicalScreenWidthCm / resolutionPxW;
}

/** Angular size of one cycle in degrees (small-angle approx). */
export function angularSizeOfOneCycleDeg(
  cycleWidthCm: number,
  viewingDistanceCm: number,
): number {
  return (cycleWidthCm / viewingDistanceCm) * RAD_TO_DEG;
}

export function cpdFromCycleWidth(
  cycleWidthCm: number,
  viewingDistanceCm: number,
): number {
  return 1 / angularSizeOfOneCycleDeg(cycleWidthCm, viewingDistanceCm);
}

/** Physical cycle width needed to render target cpd. */
export function cycleWidthCmForCpd(
  targetCpd: number,
  viewingDistanceCm: number,
): number {
  return viewingDistanceCm / (targetCpd * RAD_TO_DEG);
}

export function cycleWidthPxForCpd(
  targetCpd: number,
  viewingDistanceCm: number,
  pixelPitchCmValue: number,
): number {
  const widthCm = cycleWidthCmForCpd(targetCpd, viewingDistanceCm);
  return widthCm / pixelPitchCmValue;
}

/** Warning threshold from §8 — below this, square-wave is unreliable. */
export const MIN_RELIABLE_CYCLE_WIDTH_PX = 6;

export function isHighFrequencyReliable(cycleWidthPx: number): boolean {
  return cycleWidthPx >= MIN_RELIABLE_CYCLE_WIDTH_PX;
}

export function effectiveViewingDistanceCm(opts: {
  measuredViewingDistanceCm?: number;
  assumedViewingDistanceCm: number;
}): number {
  return opts.measuredViewingDistanceCm ?? opts.assumedViewingDistanceCm;
}

export function physicalWidthCm(opts: {
  measuredScreenWidthCm?: number;
  screenDiagonalInches: number;
}): number {
  if (opts.measuredScreenWidthCm != null && opts.measuredScreenWidthCm > 0) {
    return opts.measuredScreenWidthCm;
  }
  return screenWidthCmFromDiagonalInches(opts.screenDiagonalInches);
}
