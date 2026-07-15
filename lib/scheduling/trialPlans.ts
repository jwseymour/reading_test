import type { GratingOrientation, SpatialFrequencyCpd } from "../types";

export type GratingPlanItem = {
  spatialFrequencyCpd: SpatialFrequencyCpd;
  orientation: GratingOrientation;
};

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Quick battery: 3 cpd × 2 orientations × 3 reps = 6 */
export function buildQuickGlarePlan(rng?: () => number): GratingPlanItem[] {
  const base: GratingPlanItem[] = [];
  for (const orientation of ["horizontal", "vertical"] as const) {
    for (let r = 0; r < 3; r++) {
      base.push({ spatialFrequencyCpd: 3, orientation });
    }
  }
  return shuffle(base, rng);
}

/** Full battery: 3 frequencies × 2 orientations × 3 reps = 18 */
export function buildFullGlarePlan(rng?: () => number): GratingPlanItem[] {
  const freqs: SpatialFrequencyCpd[] = [0.5, 3, 12];
  const base: GratingPlanItem[] = [];
  for (const spatialFrequencyCpd of freqs) {
    for (const orientation of ["horizontal", "vertical"] as const) {
      for (let r = 0; r < 3; r++) {
        base.push({ spatialFrequencyCpd, orientation });
      }
    }
  }
  return shuffle(base, rng);
}
