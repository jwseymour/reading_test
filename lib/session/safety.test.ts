import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GRATING_EXPOSURE_MAX_MS,
  canAdvanceFromRest,
  clampExposureMs,
} from "./safety.ts";

describe("safety primitives", () => {
  it("clamps exposure to hard max 15s", () => {
    assert.equal(clampExposureMs(20_000), GRATING_EXPOSURE_MAX_MS);
    assert.equal(clampExposureMs(10_000), 10_000);
    assert.equal(clampExposureMs(-5), 0);
  });

  it("enforces 30s rest gate", () => {
    assert.equal(canAdvanceFromRest(29_999), false);
    assert.equal(canAdvanceFromRest(30_000), true);
  });
});
