"use client";

import { useState } from "react";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import { useSessionMeta } from "@/lib/session/SessionMetaContext";

export function NpcForm() {
  const { ensureSession } = useSessionMeta();
  const [cm, setCm] = useState("");
  const [diplopia, setDiplopia] = useState(false);
  const [witnessed, setWitnessed] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const session = await ensureSession();
        await dbApi.putConvergenceTrial({
          id: createId(),
          sessionId: session.id,
          method: witnessed ? "npc-witnessed" : "npc-selfreport",
          nearPointOfConvergenceCm: Number(cm),
          diplopiaReported: diplopia,
          timestamp: new Date().toISOString(),
        });
        setMessage(
          witnessed
            ? "Saved witnessed NPC (higher confidence)."
            : "Saved self-reported NPC (lower confidence — solo eye-drift observation is unreliable).",
        );
      }}
    >
      <h3 className="font-semibold">Near point of convergence (log only)</h3>
      <p className="text-sm text-[var(--muted)]">
        Bring a small target toward the bridge of your nose. Note the distance
        (cm) at which it doubles, or when an eye drifts. Self-observation of
        your own eye drift is unreliable — prefer a witness.
      </p>
      <label className="block text-sm">
        Break distance (cm)
        <input
          type="number"
          min={0}
          step={0.5}
          required
          className="input"
          value={cm}
          onChange={(e) => setCm(e.target.value)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={diplopia}
          onChange={(e) => setDiplopia(e.target.checked)}
        />
        Diplopia noted
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={witnessed}
          onChange={(e) => setWitnessed(e.target.checked)}
        />
        Witnessed by another person
      </label>
      <button type="submit" className="btn btn-primary">
        Save NPC log
      </button>
      {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
    </form>
  );
}
