"use client";

import { ConditionEditor } from "@/components/interventions/ConditionEditor";

export default function PlaygroundPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Playground
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Explore overlays, fonts, size, and spacing freely. This is curiosity —
          not confirmation. Promote a setup into Find if you want it considered
          when combining winners.
        </p>
      </header>
      <ConditionEditor showPromote />
    </div>
  );
}
