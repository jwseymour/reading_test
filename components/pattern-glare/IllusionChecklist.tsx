"use client";

import type { GratingIllusions } from "@/lib/types";

const ILLUSION_FIELDS: { key: keyof GratingIllusions; label: string }[] = [
  { key: "motion", label: "Apparent motion (shimmering, moving, streaming)" },
  { key: "colorFringing", label: "Colour fringing" },
  { key: "shapeDistortion", label: "Shape distortion (curves/bending)" },
  { key: "flicker", label: "Flicker" },
  { key: "blur", label: "Blur" },
];

export function IllusionChecklist({
  illusions,
  onChange,
  discomfort,
  onDiscomfort,
  onSubmit,
}: {
  illusions: GratingIllusions;
  onChange: (next: GratingIllusions) => void;
  discomfort: number;
  onDiscomfort: (n: number) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="max-w-lg space-y-4">
      <h3 className="font-semibold">What did you notice? (multi-select)</h3>
      <ul className="space-y-2">
        {ILLUSION_FIELDS.map(({ key, label }) => (
          <li key={key}>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={illusions[key]}
                onChange={(e) =>
                  onChange({ ...illusions, [key]: e.target.checked })
                }
              />
              {label}
            </label>
          </li>
        ))}
      </ul>
      <label className="block text-sm">
        <span className="mb-1 block text-[var(--muted)]">
          Discomfort 0–10 (separate from illusions)
        </span>
        <input
          type="range"
          min={0}
          max={10}
          value={discomfort}
          onChange={(e) => onDiscomfort(Number(e.target.value))}
          className="w-full"
        />
        <span className="font-mono text-sm">{discomfort}</span>
      </label>
      <button type="button" className="btn btn-primary" onClick={onSubmit}>
        Submit & rest
      </button>
    </div>
  );
}
