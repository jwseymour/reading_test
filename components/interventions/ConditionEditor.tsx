"use client";

import { useEffect, useState } from "react";
import { OverlayPreview } from "./OverlayPreview";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";
import {
  DEFAULT_FONT_SIZE_PX,
  INTERVENTION_FONTS,
} from "@/lib/content/fonts";
import type {
  InterventionCondition,
  SubjectiveOverlayRating,
} from "@/lib/types";

export function ConditionEditor({
  showPromote = false,
}: {
  showPromote?: boolean;
}) {
  const { ensureSession } = useSessionMeta();
  const [hue, setHue] = useState(200);
  const [saturation, setSaturation] = useState(40);
  const [lightness, setLightness] = useState(70);
  const [opacity, setOpacity] = useState(0.35);
  const [darkMode, setDarkMode] = useState(false);
  const [fontIdx, setFontIdx] = useState(0);
  const [fontSizePx, setFontSizePx] = useState(DEFAULT_FONT_SIZE_PX);
  const [lineSpacing, setLineSpacing] = useState(1.15);
  const [rulerOn, setRulerOn] = useState(false);
  const [rulerY, setRulerY] = useState<number | null>(null);
  const [rating, setRating] = useState<SubjectiveOverlayRating>("same");
  const [discomfort, setDiscomfort] = useState(0);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [conditions, setConditions] = useState<InterventionCondition[]>([]);

  useEffect(() => {
    dbApi.getAllConditions().then(setConditions);
  }, []);

  const overlay = { hue, saturation, lightness, opacity };

  return (
    <div className="space-y-6">
      <div
        onMouseMove={(e) => {
          if (!rulerOn) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setRulerY(e.clientY - rect.top);
        }}
        onTouchMove={(e) => {
          if (!rulerOn || !e.touches[0]) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setRulerY(e.touches[0].clientY - rect.top);
        }}
      >
        <OverlayPreview
          overlay={overlay}
          darkMode={darkMode}
          fontFamily={INTERVENTION_FONTS[fontIdx]!.family}
          fontSizePx={fontSizePx}
          lineSpacing={lineSpacing}
          rulerY={rulerOn ? rulerY : null}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label={`Hue ${hue}°`} min={0} max={360} value={hue} onChange={setHue} />
        <Slider
          label={`Saturation ${saturation}%`}
          min={0}
          max={100}
          value={saturation}
          onChange={setSaturation}
        />
        <Slider
          label={`Lightness ${lightness}%`}
          min={0}
          max={100}
          value={lightness}
          onChange={setLightness}
        />
        <Slider
          label={`Opacity ${opacity.toFixed(2)}`}
          min={0}
          max={1}
          step={0.01}
          value={opacity}
          onChange={setOpacity}
        />
        <Slider
          label={`Text size ${fontSizePx}px`}
          min={12}
          max={28}
          step={1}
          value={fontSizePx}
          onChange={setFontSizePx}
        />
        <Slider
          label={`Line spacing ${lineSpacing.toFixed(2)}×`}
          min={1}
          max={2.5}
          step={0.05}
          value={lineSpacing}
          onChange={setLineSpacing}
        />
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">Font</span>
          <select
            className="input"
            value={fontIdx}
            onChange={(e) => setFontIdx(Number(e.target.value))}
          >
            {INTERVENTION_FONTS.map((f, i) => (
              <option key={f.id} value={i}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          Dark mode / inverted contrast
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rulerOn}
            onChange={(e) => setRulerOn(e.target.checked)}
          />
          Reading ruler (follow pointer)
        </label>
      </div>

      <section className="space-y-3 border-t border-[var(--border)] pt-4">
        <h3 className="font-semibold">Sandbox · subjective log</h3>
        <p className="text-sm text-[var(--muted)]">
          Tweak parameters freely here. For a rigorous answer about what helps,
          use the Guided comparison test above.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["better", "same", "worse"] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`rounded border px-3 py-1 text-sm ${
                rating === r
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)]"
              }`}
              onClick={() => setRating(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <label className="block text-sm">
          Discomfort 0–10: {discomfort}
          <input
            type="range"
            min={0}
            max={10}
            value={discomfort}
            onChange={(e) => setDiscomfort(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <textarea
          className="input min-h-[3rem]"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            const session = await ensureSession();
            const type: InterventionCondition["type"] = rulerOn
              ? "readingRuler"
              : darkMode
                ? "darkMode"
                : fontSizePx !== DEFAULT_FONT_SIZE_PX
                  ? "fontSize"
                  : fontIdx !== 0
                    ? "fontChange"
                    : lineSpacing !== 1.15
                      ? "lineSpacing"
                      : "colorOverlay";
            const condition: InterventionCondition = {
              id: createId(),
              type,
              overlayHue: hue,
              overlaySaturation: saturation,
              overlayLightness: lightness,
              overlayOpacity: opacity,
              fontFamily: INTERVENTION_FONTS[fontIdx]!.family,
              fontSizePx,
              lineSpacingMultiplier: lineSpacing,
              invertContrast: darkMode,
              useReadingRuler: rulerOn,
              label: `${INTERVENTION_FONTS[fontIdx]!.label} ${fontSizePx}px · H${hue} A${opacity.toFixed(2)}${darkMode ? " dark" : ""}${rulerOn ? " ruler" : ""}`,
            };
            await dbApi.putCondition(condition);
            await dbApi.putSubjectiveOverlayTrial({
              id: createId(),
              sessionId: session.id,
              conditionId: condition.id,
              rating,
              discomfortRating: discomfort,
              notes: notes || undefined,
              timestamp: new Date().toISOString(),
            });
            setConditions(await dbApi.getAllConditions());
            setMessage("Logged subjective overlay trial.");
          }}
        >
          Save subjective trial
        </button>
        {showPromote && (
          <button
            type="button"
            className="btn btn-secondary ml-2"
            onClick={async () => {
              const condition: InterventionCondition = {
                id: createId(),
                type: "composite",
                overlayHue: hue,
                overlaySaturation: saturation,
                overlayLightness: lightness,
                overlayOpacity: opacity,
                fontFamily: INTERVENTION_FONTS[fontIdx]!.family,
                fontSizePx,
                lineSpacingMultiplier: lineSpacing,
                invertContrast: darkMode,
                useReadingRuler: rulerOn,
                promotedFromPlayground: true,
                label: `Playground · ${INTERVENTION_FONTS[fontIdx]!.label} ${fontSizePx}px`,
              };
              await dbApi.putCondition(condition);
              const settings = await dbApi.getSettings();
              const ids = [
                ...(settings.promotedConditionIds ?? []).filter(
                  (id) => id !== condition.id,
                ),
                condition.id,
              ].slice(-5);
              await dbApi.putSettings({
                ...settings,
                promotedConditionIds: ids,
              });
              setConditions(await dbApi.getAllConditions());
              setMessage(
                "Promoted into Find Stage 3 candidates (does not claim a win).",
              );
            }}
          >
            Promote setup into Find
          </button>
        )}
        {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
      </section>

      {conditions.length > 0 && (
        <section className="text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--ink)]">
            Saved conditions ({conditions.length})
          </p>
          <ul className="mt-1 list-disc pl-5">
            {conditions.slice(-8).map((c) => (
              <li key={c.id}>{c.label}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-[var(--muted)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
