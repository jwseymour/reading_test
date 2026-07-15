"use client";

import type { ReactNode } from "react";
import { SafetyProvider } from "@/lib/session/SafetyContext";
import { SessionMetaProvider } from "@/lib/session/SessionMetaContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SafetyProvider>
      <SessionMetaProvider>{children}</SessionMetaProvider>
    </SafetyProvider>
  );
}
