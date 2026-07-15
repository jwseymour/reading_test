import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cohensDz } from "./cohensDz.ts";
import { pairedTTest } from "./pairedT.ts";
import { wilcoxonSignedRank } from "./wilcoxon.ts";
import {
  MIN_TRIALS_PER_CONDITION,
  compareConditionPair,
} from "./comparisons.ts";

describe("stats", () => {
  it("computes Cohen's dz on known differences", () => {
    const d = [2, 2, 2, 2, 2];
    assert.equal(cohensDz(d), Infinity);
    const d2 = [1, 2, 3, 4, 5];
    const expected = 3 / Math.sqrt((4 + 1 + 0 + 1 + 4) / 4);
    assert.ok(Math.abs(cohensDz(d2) - expected) < 1e-5);
  });

  it("paired t detects large consistent effect", () => {
    const diffs = [5, 6, 4, 5, 7, 6];
    const { pValue, t } = pairedTTest(diffs);
    assert.ok(t > 0);
    assert.ok(pValue < 0.05);
  });

  it("wilcoxon exact for small n", () => {
    const diffs = [1, 2, 3, 4, 5];
    const r = wilcoxonSignedRank(diffs);
    assert.equal(r.method, "exact");
    assert.ok(r.pValue < 0.1);
  });

  it("greys out under-sampled comparisons", () => {
    const cmp = compareConditionPair(
      { conditionId: "a", label: "A", values: [1, 2, 3] },
      { conditionId: "b", label: "B", values: [2, 3, 4, 5, 6] },
    );
    assert.equal(cmp.insufficient, true);
    assert.equal(MIN_TRIALS_PER_CONDITION, 5);
  });
});
