"use client";

import { useState } from "react";
import { ExportControls } from "@/components/data/ExportControls";
import { RawTables } from "@/components/data/RawTables";

export default function DataPage() {
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Data · export & tables
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Local IndexedDB only — no server. Photos stay out of the default JSON
          export. Wipe is permanent.
        </p>
      </header>
      <ExportControls onChanged={() => setKey((k) => k + 1)} />
      <RawTables key={key} />
    </div>
  );
}
