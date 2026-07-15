import type { LikertItem } from "./ciItems";

export type VisualStressDimension = "frequency" | "severity";

export const VISUAL_STRESS_ITEMS: LikertItem[] = [
  {
    id: "vs-motion",
    prompt: "Illusions of movement (shimmering, streaming, or shifting patterns)",
  },
  {
    id: "vs-color",
    prompt: "Colour fringing (colours appearing where a pattern is black and white)",
  },
  {
    id: "vs-shape",
    prompt: "Shape distortion (curves or bending where lines are straight)",
  },
  {
    id: "vs-flicker",
    prompt: "Flicker (apparent flashing or pulsing in a static pattern)",
  },
  {
    id: "vs-blur",
    prompt: "Blur or loss of clarity on patterned or dense text surfaces",
  },
  {
    id: "vs-discomfort",
    prompt: "Physical discomfort (headache, eyestrain, nausea) from patterns or dense text",
  },
];

/** Keys stored as `${itemId}-frequency` / `${itemId}-severity` */
export function visualStressScoreKey(
  itemId: string,
  dimension: VisualStressDimension,
): string {
  return `${itemId}-${dimension}`;
}
