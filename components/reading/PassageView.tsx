"use client";

import type { InterventionCondition, ReadingPassage } from "@/lib/types";
import { overlayCssColour } from "@/lib/stimuli/overlays";
import { DEFAULT_FONT_SIZE_PX } from "@/lib/content/fonts";

export function PassageView({
  passage,
  currentLine,
  condition,
  rulerY,
  darkMode,
}: {
  passage: ReadingPassage;
  currentLine: number;
  condition?: InterventionCondition | null;
  rulerY?: number | null;
  darkMode?: boolean;
}) {
  const fontFamily =
    condition?.fontFamily ?? "Georgia, 'Times New Roman', serif";
  const lineSpacing = condition?.lineSpacingMultiplier ?? 1.15;
  const fontSizePx = condition?.fontSizePx ?? DEFAULT_FONT_SIZE_PX;
  const overlay =
    condition?.type === "colorOverlay" || condition?.overlayHue != null
      ? {
          hue: condition.overlayHue ?? 0,
          saturation: condition.overlaySaturation ?? 0,
          lightness: condition.overlayLightness ?? 80,
          opacity: condition.overlayOpacity ?? 0,
        }
      : null;

  const inverted = darkMode || condition?.type === "darkMode";
  const showRuler =
    rulerY != null || condition?.type === "readingRuler";

  return (
    <div
      className="relative overflow-hidden rounded border border-[var(--border)]"
      style={{
        background: inverted ? "#111" : "#fff",
        color: inverted ? "#eee" : "#111",
      }}
    >
      <div
        className="relative z-0 space-y-0 p-4 tracking-tight"
        style={{
          fontFamily,
          lineHeight: lineSpacing,
          fontSize: `${fontSizePx}px`,
        }}
      >
        {passage.lines.map((line, i) => (
          <p
            key={i}
            className={`${
              i === currentLine
                ? "outline outline-1 outline-dashed outline-sky-600/40"
                : ""
            } ${i < currentLine ? "opacity-40" : ""}`}
          >
            {line.join(" ")}
          </p>
        ))}
      </div>
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
