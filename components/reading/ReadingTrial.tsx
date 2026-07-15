"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PassageView } from "./PassageView";
import { FIXED_PASSAGES } from "@/lib/reading/passages";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { orderForSession } from "@/lib/scheduling/latinSquare";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";
import { useSafety } from "@/lib/session/SafetyContext";
import { WRRT_INSPIRED } from "@/lib/content/disclaimers";
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
  label: "Baseline (no intervention)",
};

export function ReadingTrialRunner({
  lockedConditionId,
  lockedPassageId,
  onTrialSaved,
  hideSetup = false,
}: {
  /** When set, skip condition picker and use this condition. */
  lockedConditionId?: string;
  lockedPassageId?: string;
  onTrialSaved?: (trial: ReadingTrialRecord) => void;
  hideSetup?: boolean;
}) {
  const { ensureSession } = useSessionMeta();
  const { markSessionActivity, stopped, clearStop } = useSafety();
  const [phase, setPhase] = useState<Phase>(hideSetup ? "ready" : "setup");
  const [conditions, setConditions] = useState<InterventionCondition[]>([]);
  const [conditionId, setConditionId] = useState(
    lockedConditionId ?? BASELINE.id,
  );
  const [passageId, setPassageId] = useState(
    lockedPassageId ?? FIXED_PASSAGES[0]!.id,
  );
  const [passages, setPassages] = useState<ReadingPassage[]>(FIXED_PASSAGES);
  const [currentLine, setCurrentLine] = useState(0);
  const [lineTs, setLineTs] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [discomfort, setDiscomfort] = useState(0);
  const [lineLosses, setLineLosses] = useState(0);
  const [errors, setErrors] = useState(0);
  const [message, setMessage] = useState("");
  const [scheduleHint, setScheduleHint] = useState("");
  const [rulerY, setRulerY] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const phaseRef = useRef(phase);
  const currentLineRef = useRef(0);
  const advancingRef = useRef(false);
  const passageRef = useRef<ReadingPassage | undefined>(undefined);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    currentLineRef.current = currentLine;
  }, [currentLine]);

  useEffect(() => {
    if (lockedConditionId) setConditionId(lockedConditionId);
  }, [lockedConditionId]);

  useEffect(() => {
    if (lockedPassageId) setPassageId(lockedPassageId);
  }, [lockedPassageId]);

  useEffect(() => {
    (async () => {
      await dbApi.putCondition(BASELINE);
      let stored = await dbApi.getAllPassages();
      if (stored.length === 0) {
        for (const p of FIXED_PASSAGES) {
          await dbApi.putPassage(p);
        }
        stored = FIXED_PASSAGES;
      }
      setPassages(stored);
      const conds = await dbApi.getAllConditions();
      setConditions(conds);
      const settings = await dbApi.getSettings();
      if (!lockedConditionId && settings.activeComparisonPhaseId) {
        const phaseRec = await dbApi.getComparisonPhase(
          settings.activeComparisonPhaseId,
        );
        if (phaseRec && !phaseRec.completedAt) {
          const order = orderForSession(
            phaseRec.conditionIds,
            phaseRec.sessionOrderIndex,
          );
          setScheduleHint(
            `Latin-square order for this phase session: ${order
              .map((id) => conds.find((c) => c.id === id)?.label ?? id)
              .join(" → ")}`,
          );
          if (order[0]) setConditionId(order[0]);
        }
      }
    })();
  }, [lockedConditionId]);

  const passage = useMemo(
    () => passages.find((p) => p.id === passageId) ?? passages[0],
    [passages, passageId],
  );
  passageRef.current = passage;

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
    setCurrentLine(0);
    currentLineRef.current = 0;
    setLineTs([]);
    setStartedAt(Date.now());
    setDiscomfort(0);
    setLineLosses(0);
    setErrors(0);
    setPhase("running");
    markSessionActivity();
  }, [clearStop, markSessionActivity]);

  const advanceLine = useCallback(() => {
    if (phaseRef.current !== "running") return;
    if (advancingRef.current) return;
    advancingRef.current = true;

    const p = passageRef.current;
    const line = currentLineRef.current;
    const nextLine = line + 1;
    const now = Date.now();

    setLineTs((prev) => [...prev, now]);
    setCurrentLine(nextLine);
    currentLineRef.current = nextLine;
    markSessionActivity();

    if (p && nextLine >= p.lines.length) {
      setPhase("post");
    }

    window.setTimeout(() => {
      advancingRef.current = false;
    }, 200);
  }, [markSessionActivity]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      // Key-repeat while holding Space was skipping multiple lines
      if (e.repeat) return;
      e.preventDefault();

      if (phaseRef.current === "ready") {
        beginRun();
        return;
      }
      if (phaseRef.current === "running") {
        advanceLine();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [beginRun, advanceLine]);

  useEffect(() => {
    if (stopped && phase === "running") {
      setPhase("post");
    }
  }, [stopped, phase]);

  if (!passage) {
    return <p className="text-sm text-[var(--muted)]">Loading passages…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">{WRRT_INSPIRED}</p>
      {scheduleHint && (
        <p className="text-sm text-[var(--accent)]">{scheduleHint}</p>
      )}

      {phase === "setup" && !hideSetup && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[var(--muted)]">Condition</span>
            <select
              className="input"
              value={conditionId}
              onChange={(e) => setConditionId(e.target.value)}
              disabled={!!lockedConditionId}
            >
              {[BASELINE, ...conditions.filter((c) => c.id !== BASELINE.id)].map(
                (c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                    {c.fontSizePx ? ` · ${c.fontSizePx}px` : ""}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--muted)]">Passage</span>
            <select
              className="input"
              value={passageId}
              onChange={(e) => setPassageId(e.target.value)}
            >
              {passages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} ({p.totalWords} words)
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={recording}
              onChange={async (e) => {
                const on = e.target.checked;
                if (!on) {
                  mediaRecorder?.stop();
                  setMediaRecorder(null);
                  setRecording(false);
                  return;
                }
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                  });
                  const rec = new MediaRecorder(stream);
                  const chunks: BlobPart[] = [];
                  rec.ondataavailable = (ev) => chunks.push(ev.data);
                  rec.onstop = () => {
                    stream.getTracks().forEach((t) => t.stop());
                    void new Blob(chunks, { type: "audio/webm" });
                  };
                  rec.start();
                  setMediaRecorder(rec);
                  setRecording(true);
                } catch {
                  setMessage(
                    "Microphone permission denied — continuing silent.",
                  );
                  setRecording(false);
                }
              }}
            />
            Optional read-aloud recording (local only; silent mode is default)
          </label>
          <button
            type="button"
            className="btn btn-primary sm:col-span-2"
            onClick={() => {
              clearStop();
              setCurrentLine(0);
              currentLineRef.current = 0;
              setLineTs([]);
              setStartedAt(null);
              setPhase("ready");
            }}
          >
            Continue to trial
          </button>
        </div>
      )}

      {(phase === "ready" || phase === "running" || phase === "post") && (
        <div
          onMouseMove={(e) => {
            if (condition?.type !== "readingRuler") return;
            const rect = e.currentTarget.getBoundingClientRect();
            setRulerY(e.clientY - rect.top);
          }}
        >
          <PassageView
            passage={passage}
            currentLine={Math.min(currentLine, passage.lines.length - 1)}
            condition={condition}
            rulerY={condition?.type === "readingRuler" ? rulerY : null}
          />
        </div>
      )}

      {phase === "ready" && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p>
            Press <kbd className="rounded border px-1">Space</kbd> or{" "}
            <kbd className="rounded border px-1">Enter</kbd> once to start.
            After that, press again only when you finish each line.
          </p>
          <button type="button" className="btn btn-primary" onClick={beginRun}>
            Start
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <span>
            Line {Math.min(currentLine + 1, passage.lines.length)} /{" "}
            {passage.lines.length} — press Space/Enter when this line is done
            (hold will not skip).
          </span>
          <button type="button" className="btn btn-secondary" onClick={advanceLine}>
            Next line
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
            Subjective line losses
            <input
              type="number"
              min={0}
              className="input"
              value={lineLosses}
              onChange={(e) => setLineLosses(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            Estimated errors (self-count)
            <input
              type="number"
              min={0}
              className="input"
              value={errors}
              onChange={(e) => setErrors(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              const session = await ensureSession();
              const end = Date.now();
              const start = startedAt ?? end;
              const timeTakenMs = Math.max(1, end - start);
              const completedWords = passage.lines
                .slice(0, currentLine)
                .reduce((n, line) => n + line.length, 0);
              const correctWordsRead = Math.max(0, completedWords - errors);
              const cwpm = (correctWordsRead / timeTakenMs) * 60_000;
              const perLineTimestampsMs: number[] = [];
              let prev = start;
              for (const t of lineTs) {
                perLineTimestampsMs.push(t - prev);
                prev = t;
              }
              const record: ReadingTrialRecord = {
                id: createId(),
                sessionId: session.id,
                passageId: passage.id,
                conditionId: condition?.id ?? BASELINE.id,
                correctWordsRead,
                totalWordsInPassage: passage.totalWords,
                errorCount: errors,
                timeTakenMs,
                correctWordsPerMinute: cwpm,
                perLineTimestampsMs,
                selfReportedLineLosses: lineLosses,
                selfReportedDiscomfort: discomfort,
                timestamp: new Date().toISOString(),
              };
              await dbApi.putReadingTrial(record);
              mediaRecorder?.stop();
              setMediaRecorder(null);
              setRecording(false);
              setMessage(
                `Saved · ${cwpm.toFixed(1)} cwpm · ${correctWordsRead} words`,
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
