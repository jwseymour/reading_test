import type { InterventionCondition } from "@/lib/types";
import { DEFAULT_FONT_SIZE_PX, INTERVENTION_FONTS } from "@/lib/content/fonts";

const serif = INTERVENTION_FONTS[0]!.family;
const atkinson = INTERVENTION_FONTS[2]!.family;
const openDyslexic = INTERVENTION_FONTS[3]!.family;

/** Stable IDs so multi-session Latin-square phases stay comparable. */
export const STANDARD_CONDITIONS: InterventionCondition[] = [
  {
    id: "condition-baseline-none",
    type: "none",
    fontFamily: serif,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.45,
    label: "Baseline · 16px serif",
  },
  {
    id: "condition-std-size-13",
    type: "fontSize",
    fontFamily: serif,
    fontSizePx: 13,
    lineSpacingMultiplier: 1.45,
    label: "Small text · 13px",
  },
  {
    id: "condition-std-size-20",
    type: "fontSize",
    fontFamily: serif,
    fontSizePx: 20,
    lineSpacingMultiplier: 1.45,
    label: "Large text · 20px",
  },
  {
    id: "condition-std-size-24",
    type: "fontSize",
    fontFamily: serif,
    fontSizePx: 24,
    lineSpacingMultiplier: 1.5,
    label: "X-large text · 24px",
  },
  {
    id: "condition-std-font-opendyslexic",
    type: "fontChange",
    fontFamily: openDyslexic,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.5,
    label: "OpenDyslexic · 16px",
  },
  {
    id: "condition-std-font-atkinson",
    type: "fontChange",
    fontFamily: atkinson,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.45,
    label: "Atkinson Hyperlegible · 16px",
  },
  {
    id: "condition-std-spacing-20",
    type: "lineSpacing",
    fontFamily: serif,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 2.0,
    label: "Wide spacing · 2.0×",
  },
  {
    id: "condition-std-overlay-teal",
    type: "colorOverlay",
    fontFamily: serif,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.45,
    overlayHue: 175,
    overlaySaturation: 45,
    overlayLightness: 72,
    overlayOpacity: 0.32,
    label: "Teal overlay",
  },
  {
    id: "condition-std-overlay-amber",
    type: "colorOverlay",
    fontFamily: serif,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.45,
    overlayHue: 42,
    overlaySaturation: 55,
    overlayLightness: 70,
    overlayOpacity: 0.3,
    label: "Amber overlay",
  },
  {
    id: "condition-std-dark",
    type: "darkMode",
    fontFamily: serif,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.45,
    invertContrast: true,
    label: "Dark mode",
  },
  {
    id: "condition-std-ruler",
    type: "readingRuler",
    fontFamily: serif,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.45,
    useReadingRuler: true,
    label: "Reading ruler",
  },
];

/** Recommended first comparison: size + font + overlay + spacing vs baseline. */
export const RECOMMENDED_CONDITION_IDS = [
  "condition-baseline-none",
  "condition-std-size-13",
  "condition-std-size-20",
  "condition-std-font-opendyslexic",
  "condition-std-overlay-teal",
  "condition-std-spacing-20",
] as const;

export const TRIALS_PER_CONDITION_TARGET = 5;
