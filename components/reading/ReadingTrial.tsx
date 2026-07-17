"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PassageView } from "./PassageView";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";
import { useSafety } from "@/lib/session/SafetyContext";
import {
  PAPER_PASSAGES,
  createCustomPassage,
  wordsInPassage,
} from "@/lib/reading/paperPassages";
import { STANDARD_CONDITIONS } from "@/lib/interventions/standardBattery";
import type {
  InterventionCondition,
  ReadingPassage,
  ReadingTrial as ReadingTrialRecord,
} from "@/lib/types";

type Phase = "setup" | "ready" | "running" | "post" | "done";

const BASELINE: InterventionCondition = {
  id: "condition-baseline-none",
  type: "none",
  fontSizePx: 16,
  lineSpacingMultiplier: 1.45,
  label: "Baseline · 16px serif",
};

const COMPREHENSION = [
  {
    q: "Was this passage mainly about visual/perceptual topics, near-work methods, or something else?",
    options: ["Visual / perceptual / reading comfort", "Unrelated topic", "Not sure"],
    correct: 0,
  },
];

export function ReadingTrialRunner({
  lockedConditionId,
  lockedPassageId,
  onTrialSaved,
  hideSetup = false,
  purpose = "manual",
  allowPaste = true,
}: {
  lockedConditionId?: string;
  lockedPassageId?: string;
  onTrialSaved?: (trial: ReadingTrialRecord) => void;
  hideSetup?: boolean;
  purpose?: ReadingTrialRecord["purpose"];
  allowPaste?: boolean;
}) {
  const { ensureSession } = useSessionMeta();
  const { markSessionActivity, stopped, clearStop } = useSafety();
  const [phase, setPhase] = useState<Phase>(hideSetup ? "ready" : "setup");
  const [conditions, setConditions] = useState<InterventionCondition[]>([]);
  const [conditionId, setConditionId] = useState(
    lockedConditionId ?? BASELINE.id,
  );
  const [passages, setPassages] = useState<ReadingPassage[]>(PAPER_PASSAGES);
  const [passageId, setPassageId] = useState(
    lockedPassageId ?? PAPER_PASSAGES[0]!.id,
  );
  const [pasteText, setPasteText] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [discomfort, setDiscomfort] = useState(0);
  const [lineLosses, setLineLosses] = useState(0);
  const [compAnswer, setCompAnswer] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [rulerY, setRulerY] = useState<number | null>(null);

  const phaseRef = useRef(phase);
  const finishingRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (lockedConditionId) setConditionId(lockedConditionId);
  }, [lockedConditionId]);

  useEffect(() => {
    if (lockedPassageId) setPassageId(lockedPassageId);
  }, [lockedPassageId]);

  useEffect(() => {
    (async () => {
      await dbApi.putCondition(BASELINE);
      for (const p of PAPER_PASSAGES) {
        await dbApi.putPassage(p);
      }
      const stored = await dbApi.getAllPassages();
      const papers = stored.filter(
        (p) => p.source === "builtin-paper" || p.source === "custom-paste",
      );
      setPassages(papers.length ? papers : PAPER_PASSAGES);
      setConditions(await dbApi.getAllConditions());
    })();
  }, []);

  const passage = useMemo(
    () => passages.find((p) => p.id === passageId) ?? passages[0],
    [passages, passageId],
  );

  const condition = useMemo(() => {
    const fromDb = conditions.find((c) => c.id === conditionId);
    if (fromDb) return fromDb;
    const fromStd = STANDARD_CONDITIONS.find((c) => c.id === conditionId);
    if (fromStd) return fromStd;
    if (conditionId === BASELINE.id) return BASELINE;
    return null;
  }, [conditions, conditionId]);

  const beginRun = useCallback(() => {
    clearStop();
    finishingRef.current = false;
    setStartedAt(Date.now());
    setDiscomfort(0);
    setLineLosses(0);
    setCompAnswer(null);
    setPhase("running");
    markSessionActivity();
  }, [clearStop, markSessionActivity]);

  const finishRun = useCallback(() => {
    if (phaseRef.current !== "running") return;
    if (finishingRef.current) return;
    finishingRef.current = true;
    setPhase("post");
    markSessionActivity();
  }, [markSessionActivity]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      if (e.repeat) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      e.preventDefault();
      if (phaseRef.current === "ready") beginRun();
      else if (phaseRef.current === "running") finishRun();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [beginRun, finishRun]);

  useEffect(() => {
    if (stopped && phase === "running") setPhase("post");
  }, [stopped, phase]);

  if (!passage) {
    return <p className="text-sm text-[var(--muted)]">Loading passages…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Continuous paper-style text — no line highlighting or greying (those
        act like a reading ruler). Read naturally, then finish when done.
        Built-in passages are best for comparable scores; pasted text is for
        ecological practice.
      </p>

      {phase === "setup" && !hideSetup && (
        <div className="space-y-4">
          {purpose !== "baseline" && (
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--muted)]">Condition</span>
              <select
                className="input"
                value={conditionId}
                onChange={(e) => setConditionId(e.target.value)}
                disabled={!!lockedConditionId}
              >
                {[
                  BASELINE,
                  ...conditions.filter((c) => c.id !== BASELINE.id),
                ].map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">Passage</span>
            <select
              className="input"
              value={passageId}
              onChange={(e) => setPassageId(e.target.value)}
              disabled={!!lockedPassageId}
            >
              {passages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.source === "custom-paste" ? "Custom · " : ""}
                  {p.title ?? p.id} ({wordsInPassage(p)} words)
                </option>
              ))}
            </select>
          </label>
          {allowPaste && (
            <div className="space-y-2">
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--muted)]">
                  Or paste your own text (research paper excerpt, etc.)
                </span>
                <textarea
                  className="input min-h-[8rem] font-mono text-xs"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste plain text. Stored locally only."
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pasteText.trim().length < 40}
                onClick={async () => {
                  const custom = createCustomPassage(pasteText);
                  await dbApi.putPassage(custom);
                  const all = await dbApi.getAllPassages();
                  setPassages(
                    all.filter(
                      (p) =>
                        p.source === "builtin-paper" ||
                        p.source === "custom-paste",
                    ),
                  );
                  setPassageId(custom.id);
                  setPasteText("");
                  setMessage("Custom passage saved locally.");
                }}
              >
                Save pasted passage
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              clearStop();
              setPhase("ready");
            }}
          >
            Continue to trial
          </button>
          {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
        </div>
      )}

      {(phase === "ready" || phase === "running" || phase === "post") && (
        <div
          onMouseMove={(e) => {
            const c = purpose === "baseline" ? BASELINE : condition;
            if (c?.type !== "readingRuler" && !c?.useReadingRuler) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setRulerY(e.clientY - rect.top);
          }}
        >
          <PassageView
            passage={passage}
            condition={purpose === "baseline" ? BASELINE : condition}
            rulerY={
              condition?.type === "readingRuler" || condition?.useReadingRuler
                ? rulerY
                : null
            }
          />
        </div>
      )}

      {phase === "ready" && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p>
            Press <kbd className="rounded border px-1">Space</kbd> or{" "}
            <kbd className="rounded border px-1">Enter</kbd> to start. Press
            again when you finish the whole passage.
          </p>
          <button type="button" className="btn btn-primary" onClick={beginRun}>
            Start
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-[var(--muted)]">
            Reading… press Space/Enter or Finish when done.
          </span>
          <button type="button" className="btn btn-primary" onClick={finishRun}>
            Finish passage
          </button>
        </div>
      )}

      {phase === "post" && (
        <div className="space-y-3">
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
          <label className="block text-sm">
            Times you felt you lost your place
            <input
              type="number"
              min={0}
              className="input"
              value={lineLosses}
              onChange={(e) => setLineLosses(Number(e.target.value))}
            />
          </label>
          {passage.source === "builtin-paper" && (
            <fieldset className="text-sm">
              <legend className="mb-1 text-[var(--muted)]">
                Quick comprehension (deters skimming)
              </legend>
              <p className="mb-2">{COMPREHENSION[0]!.q}</p>
              <div className="flex flex-col gap-1">
                {COMPREHENSION[0]!.options.map((opt, i) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="comp"
                      checked={compAnswer === i}
                      onChange={() => setCompAnswer(i)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              const session = await ensureSession();
              const end = Date.now();
              const start = startedAt ?? end;
              const timeTakenMs = Math.max(1, end - start);
              const totalWords = wordsInPassage(passage);
              const cwpm = (totalWords / timeTakenMs) * 60_000;
              const comprehensionScore =
                compAnswer == null
                  ? undefined
                  : compAnswer === COMPREHENSION[0]!.correct
                    ? 1
                    : 0;
              const record: ReadingTrialRecord = {
                id: createId(),
                sessionId: session.id,
                passageId: passage.id,
                conditionId:
                  purpose === "baseline"
                    ? BASELINE.id
                    : (condition?.id ?? BASELINE.id),
                correctWordsRead: totalWords,
                totalWordsInPassage: totalWords,
                errorCount: 0,
                timeTakenMs,
                correctWordsPerMinute: cwpm,
                perLineTimestampsMs: [],
                selfReportedLineLosses: lineLosses,
                selfReportedDiscomfort: discomfort,
                timestamp: new Date().toISOString(),
                comprehensionScore,
                purpose,
              };
              await dbApi.putReadingTrial(record);
              setMessage(
                `Saved · ${cwpm.toFixed(1)} cwpm · discomfort ${discomfort}`,
              );
              setPhase("done");
              onTrialSaved?.(record);
            }}
          >
            Save trial
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--accent)]">{message}</p>
          {!hideSetup && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPhase("setup")}
            >
              Another trial
            </button>
          )}
        </div>
      )}
    </div>
  );
}
