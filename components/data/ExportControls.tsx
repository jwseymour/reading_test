"use client";

import { useRef, useState } from "react";
import { dbApi } from "@/lib/db/client";
import {
  downloadJson,
  exportDatabaseJson,
  parseExportBundle,
} from "@/lib/db/export";
import {
  decryptJson,
  encryptJson,
  looksEncrypted,
} from "@/lib/db/crypto";

export function ExportControls({ onChanged }: { onChanged?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [passphrase, setPassphrase] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [message, setMessage] = useState("");
  const [wipeConfirm, setWipeConfirm] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await exportDatabaseJson();
            setMessage("Exported plain JSON (photos excluded).");
          }}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!passphrase}
          onClick={async () => {
            const bundle = await dbApi.exportBundle();
            const enc = await encryptJson(
              JSON.stringify(bundle),
              passphrase,
            );
            const stamp = new Date().toISOString().replace(/[:.]/g, "-");
            const envelope = JSON.parse(enc) as unknown;
            downloadJson(
              `perceptlab-export-${stamp}.encrypted.json`,
              envelope,
            );
            setMessage("Exported AES-GCM encrypted JSON.");
          }}
        >
          Export encrypted
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileRef.current?.click()}
        >
          Import…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const text = await file.text();
              let jsonText = text;
              if (looksEncrypted(text)) {
                if (!passphrase) {
                  setMessage("Enter passphrase to decrypt this file.");
                  return;
                }
                jsonText = await decryptJson(text, passphrase);
              }
              const bundle = parseExportBundle(jsonText);
              if (
                importMode === "replace" &&
                !window.confirm("Replace ALL local data with this import?")
              ) {
                return;
              }
              await dbApi.importBundle(bundle, importMode);
              setMessage(`Import ${importMode} complete.`);
              onChanged?.();
            } catch (err) {
              setMessage(
                err instanceof Error ? err.message : "Import failed",
              );
            }
            e.target.value = "";
          }}
        />
      </div>

      <label className="block max-w-sm text-sm">
        <span className="mb-1 block text-[var(--muted)]">
          Passphrase (encrypted export/import)
        </span>
        <input
          type="password"
          className="input"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          autoComplete="new-password"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        Import mode
        <select
          className="input w-auto"
          value={importMode}
          onChange={(e) =>
            setImportMode(e.target.value as "merge" | "replace")
          }
        >
          <option value="merge">Merge</option>
          <option value="replace">Replace</option>
        </select>
      </label>

      <div className="border-t border-[var(--border)] pt-4">
        <p className="text-sm font-semibold text-[var(--danger)]">
          Wipe all data
        </p>
        <p className="text-sm text-[var(--muted)]">
          Unrecoverable. Type DELETE to enable.
        </p>
        <input
          className="input mt-2 max-w-xs"
          value={wipeConfirm}
          onChange={(e) => setWipeConfirm(e.target.value)}
          placeholder="DELETE"
        />
        <button
          type="button"
          className="btn mt-2 bg-[var(--danger)] text-white disabled:opacity-40"
          disabled={wipeConfirm !== "DELETE"}
          onClick={async () => {
            await dbApi.wipeAll();
            setWipeConfirm("");
            setMessage("All local data wiped.");
            onChanged?.();
          }}
        >
          Wipe everything
        </button>
      </div>

      {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
    </div>
  );
}
