"use client";

import type { InterventionCondition, ReadingPassage } from "@/lib/types";
import { overlayCssColour } from "@/lib/stimuli/overlays";
import { DEFAULT_FONT_SIZE_PX } from "@/lib/content/fonts";
import { passagePlainText } from "@/lib/reading/paperPassages";

export function PassageView({
  passage,
  condition,
  rulerY,
  darkMode,
}: {
  passage: ReadingPassage;
  condition?: InterventionCondition | null;
  rulerY?: number | null;
  darkMode?: boolean;
}) {
  const fontFamily =
    condition?.fontFamily ?? "Georgia, 'Times New Roman', serif";
  const lineSpacing = condition?.lineSpacingMultiplier ?? 1.45;
  const fontSizePx = condition?.fontSizePx ?? DEFAULT_FONT_SIZE_PX;
  const overlay =
    condition?.type === "colorOverlay" ||
    condition?.type === "composite" ||
    (condition?.overlayOpacity != null && condition.overlayOpacity > 0)
      ? {
          hue: condition.overlayHue ?? 0,
          saturation: condition.overlaySaturation ?? 0,
          lightness: condition.overlayLightness ?? 80,
          opacity: condition.overlayOpacity ?? 0,
        }
      : null;

  const inverted =
    darkMode || condition?.type === "darkMode" || !!condition?.invertContrast;
  const showRuler =
    condition?.type === "readingRuler" || !!condition?.useReadingRuler;
  const paragraphs =
    passage.paragraphs ??
    (passage.lines
      ? [passage.lines.map((l) => l.join(" ")).join(" ")]
      : [passagePlainText(passage)]);

  return (
    <div
      className="relative overflow-hidden rounded border border-[var(--border)]"
      style={{
        background: inverted ? "#111" : "#faf8f4",
        color: inverted ? "#eee" : "#1a1a1a",
      }}
    >
      <article
        className="relative z-0 max-w-none space-y-4 p-6 sm:p-8"
        style={{
          fontFamily,
          lineHeight: lineSpacing,
          fontSize: `${fontSizePx}px`,
        }}
      >
        {passage.title && (
          <h2
            className="mb-2 font-semibold"
            style={{ fontSize: `${fontSizePx * 1.15}px` }}
          >
            {passage.title}
          </h2>
        )}
        {paragraphs.map((para, i) => (
          <p key={i} className="text-pretty">
            {para}
          </p>
        ))}
      </article>
      {overlay && overlay.opacity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: overlayCssColour(overlay) }}
          aria-hidden
        />
      )}
      {showRuler && rulerY != null && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20"
          style={{
            top: Math.max(0, rulerY - Math.max(14, fontSizePx * 0.9)),
            height: Math.max(28, fontSizePx * 1.6),
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
