"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CI_INSPIRED_ITEMS, LIKERT_LABELS } from "@/lib/content/ciItems";
import {
  VISUAL_STRESS_ITEMS,
  visualStressScoreKey,
} from "@/lib/content/visualStressItems";
import { CISS_INSPIRED } from "@/lib/content/disclaimers";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";
import type { SymptomSurveyResponse } from "@/lib/types";

const TRIGGER_TAGS = ["pattern", "reading", "screen", "lighting", "other"];

export function SymptomForm() {
  const { ensureSession } = useSessionMeta();
  const [ciScores, setCiScores] = useState<Record<string, number>>({});
  const [vsScores, setVsScores] = useState<Record<string, number>>({});
  const [triggerNote, setTriggerNote] = useState("");
  const [triggerTags, setTriggerTags] = useState<string[]>([]);
  const [ciId, setCiId] = useState(() => createId());
  const [vsId, setVsId] = useState(() => createId());
  const [status, setStatus] = useState("Answers auto-save as you go.");
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    ensureSession().then((s) => setSessionId(s.id));
  }, [ensureSession]);

  const ciTotal = useMemo(
    () => Object.values(ciScores).reduce((a, b) => a + b, 0),
    [ciScores],
  );
  const vsTotal = useMemo(
    () => Object.values(vsScores).reduce((a, b) => a + b, 0),
    [vsScores],
  );

  const persistCi = useCallback(
    async (scores: Record<string, number>, note?: string, tags?: string[]) => {
      if (!sessionId) return;
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      const record: SymptomSurveyResponse = {
        id: ciId,
        sessionId,
        instrument: "ci-inspired-15",
        itemScores: scores,
        totalScore: total,
        administeredAt: new Date().toISOString(),
        triggerNote: note,
        triggerTags: tags,
      };
      await dbApi.putSymptomSurvey(record);
      setStatus(`Saved CI checklist (total ${total}/60) at ${new Date().toLocaleTimeString()}`);
    },
    [sessionId, ciId],
  );

  const persistVs = useCallback(
    async (scores: Record<string, number>) => {
      if (!sessionId) return;
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      const record: SymptomSurveyResponse = {
        id: vsId,
        sessionId,
        instrument: "visual-stress-checklist",
        itemScores: scores,
        totalScore: total,
        administeredAt: new Date().toISOString(),
      };
      await dbApi.putSymptomSurvey(record);
      setStatus(
        `Saved visual-stress checklist (total ${total}) at ${new Date().toLocaleTimeString()}`,
      );
    },
    [sessionId, vsId],
  );

  return (
    <div className="space-y-10">
      <p className="text-sm text-[var(--muted)]">{status}</p>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          CI-inspired checklist
        </h2>
        <p className="text-sm text-[var(--muted)]">{CISS_INSPIRED}</p>
        <p className="text-sm">
          Running total:{" "}
          <strong>
            {ciTotal}/60
          </strong>{" "}
          ({Object.keys(ciScores).length}/15 answered) — trend tracking only,
          not a clinical cutoff.
        </p>
        <ol className="space-y-6">
          {CI_INSPIRED_ITEMS.map((item, idx) => (
            <li key={item.id} className="space-y-2">
              <p className="text-sm font-medium">
                {idx + 1}. {item.prompt}
              </p>
              <div className="flex flex-wrap gap-2">
                {LIKERT_LABELS.map((label, value) => (
                  <label
                    key={label}
                    className={`cursor-pointer rounded border px-2 py-1 text-xs ${
                      ciScores[item.id] === value
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={item.id}
                      checked={ciScores[item.id] === value}
                      onChange={async () => {
                        const next = { ...ciScores, [item.id]: value };
                        setCiScores(next);
                        await persistCi(next, triggerNote, triggerTags);
                      }}
                    />
                    {value} · {label}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Visual-stress checklist
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Rate frequency and severity (when it occurs), each 0–4.
        </p>
        <p className="text-sm">
          Running total: <strong>{vsTotal}</strong> (
          {Object.keys(vsScores).length}/
          {VISUAL_STRESS_ITEMS.length * 2} ratings)
        </p>
        {VISUAL_STRESS_ITEMS.map((item) => (
          <div key={item.id} className="space-y-3 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-medium">{item.prompt}</p>
            {(["frequency", "severity"] as const).map((dim) => {
              const key = visualStressScoreKey(item.id, dim);
              return (
                <div key={key}>
                  <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">
                    {dim}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LIKERT_LABELS.map((label, value) => (
                      <label
                        key={`${key}-${value}`}
                        className={`cursor-pointer rounded border px-2 py-1 text-xs ${
                          vsScores[key] === value
                            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                            : "border-[var(--border)] bg-[var(--surface)]"
                        }`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={key}
                          checked={vsScores[key] === value}
                          onChange={async () => {
                            const next = { ...vsScores, [key]: value };
                            setVsScores(next);
                            await persistVs(next);
                          }}
                        />
                        {value} · {label}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Last trigger note
        </h2>
        <textarea
          className="input min-h-[5rem]"
          placeholder="What were you looking at when this last happened?"
          value={triggerNote}
          onChange={async (e) => {
            const v = e.target.value;
            setTriggerNote(v);
            await persistCi(ciScores, v, triggerTags);
          }}
        />
        <div className="flex flex-wrap gap-2">
          {TRIGGER_TAGS.map((tag) => {
            const on = triggerTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`rounded border px-2 py-1 text-xs ${
                  on
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)]"
                }`}
                onClick={async () => {
                  const next = on
                    ? triggerTags.filter((t) => t !== tag)
                    : [...triggerTags, tag];
                  setTriggerTags(next);
                  await persistCi(ciScores, triggerNote, next);
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setCiId(createId());
          setVsId(createId());
          setCiScores({});
          setVsScores({});
          setTriggerNote("");
          setTriggerTags([]);
          setStatus("Started a fresh intake (previous responses kept in storage).");
        }}
      >
        Start new intake
      </button>
    </div>
  );
}
