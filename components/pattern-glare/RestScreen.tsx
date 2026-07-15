"use client";

import { useEffect, useState } from "react";
import {
  GRATING_REST_MIN_MS,
  NEUTRAL_GREY,
  canAdvanceFromRest,
} from "@/lib/session/safety";

export function RestScreen({ onDone }: { onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Date.now() - start);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const remaining = Math.max(0, GRATING_REST_MIN_MS - elapsed);
  const ready = canAdvanceFromRest(elapsed);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded p-8"
      style={{ background: NEUTRAL_GREY }}
    >
      <p className="text-center text-lg text-white">
        Neutral rest — look away from dense patterns if you can.
      </p>
      <p className="font-mono text-white">
        {ready
          ? "Rest complete"
          : `${Math.ceil(remaining / 1000)}s remaining`}
      </p>
      <button
        type="button"
        className="btn btn-primary disabled:opacity-40"
        disabled={!ready}
        onClick={onDone}
      >
        Continue to next trial
      </button>
    </div>
  );
}
