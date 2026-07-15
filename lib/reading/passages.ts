import { createId } from "../id";
import { WORD_BANK } from "./wordBank";
import type { ReadingPassage } from "../types";

export type GenerateOptions = {
  lineCount?: number;
  wordsPerLine?: number;
  rng?: () => number;
};

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Build one line with no immediate repeats; roughly balanced draws from bank. */
export function generateLine(
  wordsPerLine: number,
  counts: Map<string, number>,
  rng: () => number,
): string[] {
  const line: string[] = [];
  for (let i = 0; i < wordsPerLine; i++) {
    const candidates = [...WORD_BANK].filter((w) => w !== line[i - 1]);
    candidates.sort((a, b) => {
      const ca = counts.get(a) ?? 0;
      const cb = counts.get(b) ?? 0;
      if (ca !== cb) return ca - cb;
      return rng() - 0.5;
    });
    const pick = candidates[0]!;
    line.push(pick);
    counts.set(pick, (counts.get(pick) ?? 0) + 1);
  }
  return line;
}

export function generatePassage(opts: GenerateOptions = {}): ReadingPassage {
  const lineCount = opts.lineCount ?? 10;
  const wordsPerLine = opts.wordsPerLine ?? 9;
  const rng = opts.rng ?? Math.random;
  const counts = new Map<string, number>();
  const lines: string[][] = [];
  for (let i = 0; i < lineCount; i++) {
    lines.push(generateLine(wordsPerLine, counts, rng));
  }
  return {
    id: createId(),
    lines,
    totalWords: lineCount * wordsPerLine,
    createdAt: new Date().toISOString(),
  };
}

export function generatePassageSet(
  count = 6,
  opts: GenerateOptions = {},
): ReadingPassage[] {
  return Array.from({ length: count }, () => generatePassage(opts));
}

/** Invariants for tests */
export function lineHasNoImmediateRepeat(line: string[]): boolean {
  for (let i = 1; i < line.length; i++) {
    if (line[i] === line[i - 1]) return false;
  }
  return true;
}

export function frequencySkew(passage: ReadingPassage): number {
  const counts = new Map<string, number>();
  for (const line of passage.lines) {
    for (const w of line) {
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  const values = [...counts.values()];
  if (values.length === 0) return 0;
  const max = Math.max(...values);
  const min = Math.min(...values);
  return max - min;
}

/**
 * Frozen seed passages — generated once with a deterministic LCG so the set
 * is stable across installs (do not regenerate per session).
 */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FIXED_PASSAGES: ReadingPassage[] = (() => {
  const rng = mulberry32(0x50455243); // "PERC"
  const set = generatePassageSet(6, { rng, lineCount: 10, wordsPerLine: 9 });
  // Stable IDs for cross-session comparison
  return set.map((p, i) => ({
    ...p,
    id: `passage-fixed-${i + 1}`,
    createdAt: "2026-01-01T00:00:00.000Z",
  }));
})();

export { shuffleInPlace };
