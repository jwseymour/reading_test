import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FIXED_PASSAGES,
  frequencySkew,
  generatePassage,
  lineHasNoImmediateRepeat,
} from "./passages.ts";
import { WORD_BANK } from "./wordBank.ts";

describe("passage generator", () => {
  it("avoids immediate word repeats within a line", () => {
    const p = generatePassage({
      rng: () => 0.42,
      lineCount: 10,
      wordsPerLine: 9,
    });
    for (const line of p.lines) {
      assert.equal(lineHasNoImmediateRepeat(line), true);
      assert.equal(
        line.every((w) => (WORD_BANK as readonly string[]).includes(w)),
        true,
      );
    }
  });

  it("keeps frequency skew bounded", () => {
    const p = generatePassage({
      rng: () => 0.17,
      lineCount: 10,
      wordsPerLine: 9,
    });
    assert.ok(frequencySkew(p) <= 6);
  });

  it("ships a fixed set of ≥6 passages", () => {
    assert.ok(FIXED_PASSAGES.length >= 6);
    assert.equal(
      new Set(FIXED_PASSAGES.map((p) => p.id)).size,
      FIXED_PASSAGES.length,
    );
  });
});
