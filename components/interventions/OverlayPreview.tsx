"use client";

import { useSafety } from "@/lib/session/SafetyContext";
import {
  SAMPLE_DENSE_TEXT,
  overlayCssColour,
  type OverlayHsl,
} from "@/lib/stimuli/overlays";

export function OverlayPreview({
  overlay,
  darkMode = false,
  fontFamily = "Georgia, serif",
  fontSizePx = 15,
  lineSpacing = 1.15,
  rulerY,
}: {
  overlay: OverlayHsl;
  darkMode?: boolean;
  fontFamily?: string;
  fontSizePx?: number;
  lineSpacing?: number;
  rulerY?: number | null;
}) {
  const { stopped, neutralGrey } = useSafety();

  if (stopped) {
    return (
      <div
        className="relative min-h-[280px] rounded border border-[var(--border)]"
        style={{ background: neutralGrey }}
      />
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded border border-[var(--border)]"
      style={{
        background: darkMode ? "#111" : "#fff",
        color: darkMode ? "#eee" : "#111",
      }}
    >
      <pre
        className="relative z-0 whitespace-pre-wrap p-4 tracking-tight"
        style={{
          fontFamily,
          fontSize: `${fontSizePx}px`,
          lineHeight: lineSpacing,
          letterSpacing: "-0.01em",
        }}
      >
        {SAMPLE_DENSE_TEXT}
      </pre>
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: overlayCssColour(overlay) }}
        aria-hidden
      />
      {rulerY != null && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20"
          style={{
            top: Math.max(0, rulerY - 18),
            height: 36,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            background: "transparent",
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
