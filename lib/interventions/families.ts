import type { InterventionCondition, InterventionFamily } from "@/lib/types";
import { INTERVENTION_FONTS, DEFAULT_FONT_SIZE_PX } from "@/lib/content/fonts";

const serif = INTERVENTION_FONTS[0]!.family;
const openDyslexic = INTERVENTION_FONTS[3]!.family;

/** Two arms per family for Stage 2 A/B */
export const FAMILY_ARMS: Record<
  InterventionFamily,
  [InterventionCondition, InterventionCondition]
> = {
  fontSize: [
    {
      id: "condition-std-size-16",
      type: "fontSize",
      fontFamily: serif,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      lineSpacingMultiplier: 1.45,
      label: "Size 16px",
    },
    {
      id: "condition-std-size-20",
      type: "fontSize",
      fontFamily: serif,
      fontSizePx: 20,
      lineSpacingMultiplier: 1.45,
      label: "Size 20px",
    },
  ],
  font: [
    {
      id: "condition-std-font-serif",
      type: "fontChange",
      fontFamily: serif,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      lineSpacingMultiplier: 1.45,
      label: "Serif",
    },
    {
      id: "condition-std-font-opendyslexic",
      type: "fontChange",
      fontFamily: openDyslexic,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      lineSpacingMultiplier: 1.5,
      label: "OpenDyslexic",
    },
  ],
  colorOverlay: [
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
  ],
  lineSpacing: [
    {
      id: "condition-std-spacing-145",
      type: "lineSpacing",
      fontFamily: serif,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      lineSpacingMultiplier: 1.45,
      label: "Spacing 1.45×",
    },
    {
      id: "condition-std-spacing-20",
      type: "lineSpacing",
      fontFamily: serif,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      lineSpacingMultiplier: 2.0,
      label: "Spacing 2.0×",
    },
  ],
  darkMode: [
    {
      id: "condition-baseline-none",
      type: "none",
      fontFamily: serif,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      lineSpacingMultiplier: 1.45,
      label: "Light (baseline)",
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
  ],
  readingRuler: [
    {
      id: "condition-baseline-none",
      type: "none",
      fontFamily: serif,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      lineSpacingMultiplier: 1.45,
      label: "No ruler",
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
  ],
};

export const FAMILY_LABELS: Record<InterventionFamily, string> = {
  fontSize: "Text size",
  font: "Font",
  colorOverlay: "Colour overlay",
  lineSpacing: "Line spacing",
  darkMode: "Dark / inverted contrast",
  readingRuler: "Reading ruler",
};

export function mergeComposite(
  winners: InterventionCondition[],
  id: string,
): InterventionCondition {
  const base: InterventionCondition = {
    id,
    type: "composite",
    label: "Personal profile",
    fontFamily: serif,
    fontSizePx: DEFAULT_FONT_SIZE_PX,
    lineSpacingMultiplier: 1.45,
  };

  for (const w of winners) {
    // Skip pure baseline arms
    if (w.id === "condition-baseline-none" || w.type === "none") continue;
    if (w.fontSizePx) base.fontSizePx = w.fontSizePx;
    if (w.fontFamily && w.type === "fontChange") base.fontFamily = w.fontFamily;
    if (w.lineSpacingMultiplier && w.type === "lineSpacing") {
      base.lineSpacingMultiplier = w.lineSpacingMultiplier;
    }
    if (w.overlayOpacity != null && w.overlayOpacity > 0) {
      base.overlayHue = w.overlayHue;
      base.overlaySaturation = w.overlaySaturation;
      base.overlayLightness = w.overlayLightness;
      base.overlayOpacity = w.overlayOpacity;
    }
    if (w.type === "darkMode" || w.invertContrast) base.invertContrast = true;
    if (w.type === "readingRuler" || w.useReadingRuler) {
      base.useReadingRuler = true;
    }
  }

  const labels = winners
    .filter((w) => w.id !== "condition-baseline-none" && w.type !== "none")
    .map((w) => w.label);
  base.label =
    labels.length > 0 ? `Profile · ${labels.join(" + ")}` : "Profile · baseline";
  return base;
}

export function allFamilyConditions(): InterventionCondition[] {
  const out: InterventionCondition[] = [];
  const seen = new Set<string>();
  for (const arms of Object.values(FAMILY_ARMS)) {
    for (const c of arms) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        out.push(c);
      }
    }
  }
  return out;
}
