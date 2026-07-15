"use client";

import { dbApi } from "./client";
import type { ExportBundle } from "@/lib/types";

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportDatabaseJson(): Promise<void> {
  const bundle = await dbApi.exportBundle();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadJson(`perceptlab-export-${stamp}.json`, bundle);
}

export function parseExportBundle(text: string): ExportBundle {
  const data = JSON.parse(text) as ExportBundle;
  if (!data || data.version !== 1) {
    throw new Error("Unsupported or missing export version");
  }
  return data;
}
