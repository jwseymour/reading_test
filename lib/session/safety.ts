/** Hard safety constraints — design doc §9 */

export const NEUTRAL_GREY = "#808080";

/** Default grating exposure (ms). */
export const GRATING_EXPOSURE_DEFAULT_MS = 10_000;

/** Hard maximum exposure — enforced in timer code. */
export const GRATING_EXPOSURE_MAX_MS = 15_000;

/** Mandatory rest between grating trials (ms). */
export const GRATING_REST_MIN_MS = 30_000;

/** Non-blocking session-length nudge threshold. */
export const SESSION_NUDGE_MS = 20 * 60 * 1000;

export function clampExposureMs(requestedMs: number): number {
  const n = Number.isFinite(requestedMs) ? requestedMs : GRATING_EXPOSURE_DEFAULT_MS;
  return Math.min(Math.max(0, n), GRATING_EXPOSURE_MAX_MS);
}

export function canAdvanceFromRest(elapsedRestMs: number): boolean {
  return elapsedRestMs >= GRATING_REST_MIN_MS;
}
