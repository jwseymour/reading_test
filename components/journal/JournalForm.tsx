"use client";

import { useEffect, useState } from "react";
import { createId } from "@/lib/id";
import { dbApi } from "@/lib/db/client";
import type { JournalEntry, TriggerType } from "@/lib/types";

const EFFECTS = ["motion", "flicker", "rotation", "colour", "other"];

export function JournalForm() {
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("pattern");
  const [effects, setEffects] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [tiredOrStressed, setTiredOrStressed] = useState(false);
  const [photoId, setPhotoId] = useState<string | undefined>();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [message, setMessage] = useState("");

  const reload = async () => setEntries(await dbApi.getAllJournalEntries());

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-6">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const entry: JournalEntry = {
            id: createId(),
            occurredAt: new Date().toISOString(),
            description: description.trim(),
            triggerType,
            perceivedEffects: effects,
            severity,
            durationMinutes:
              durationMinutes === "" ? undefined : Number(durationMinutes),
            photoRefLocal: photoId,
            tiredOrStressed,
          };
          await dbApi.putJournalEntry(entry);
          setDescription("");
          setEffects([]);
          setPhotoId(undefined);
          setMessage("Entry saved locally.");
          await reload();
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">What happened?</span>
          <textarea
            className="input min-h-[5rem]"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Trigger type</span>
          <select
            className="input"
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
          >
            <option value="pattern">Pattern</option>
            <option value="reading">Reading</option>
            <option value="screen">Screen</option>
            <option value="lighting">Lighting</option>
            <option value="other">Other</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {EFFECTS.map((tag) => {
            const on = effects.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`rounded border px-2 py-1 text-xs ${
                  on
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)]"
                }`}
                onClick={() =>
                  setEffects((prev) =>
                    on ? prev.filter((t) => t !== tag) : [...prev, tag],
                  )
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
        <label className="block text-sm">
          Severity {severity}/10
          <input
            type="range"
            min={0}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block text-sm">
          Duration (minutes, optional)
          <input
            type="number"
            min={0}
            className="input"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={tiredOrStressed}
            onChange={(e) => setTiredOrStressed(e.target.checked)}
          />
          Tired or stressed at the time
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">
            Optional photo (stored locally only)
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const id = createId();
              await dbApi.putPhoto({
                id,
                mimeType: file.type || "image/jpeg",
                createdAt: new Date().toISOString(),
                blob: file,
              });
              setPhotoId(id);
              setMessage("Photo stored in IndexedDB (not in JSON export).");
            }}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Save entry
        </button>
        {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
      </form>

      <section>
        <h2 className="mb-2 font-semibold">Recent entries</h2>
        <ul className="divide-y divide-[var(--border)]">
          {entries
            .slice()
            .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
            .slice(0, 20)
            .map((e) => (
              <li key={e.id} className="py-3 text-sm">
                <p className="font-medium">
                  {new Date(e.occurredAt).toLocaleString()} · {e.triggerType} ·
                  severity {e.severity}
                </p>
                <p className="text-[var(--muted)]">{e.description}</p>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
