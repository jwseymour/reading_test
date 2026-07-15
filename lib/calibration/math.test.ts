import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RAD_TO_DEG,
  angularSizeOfOneCycleDeg,
  cpdFromCycleWidth,
  cycleWidthCmForCpd,
  cycleWidthPxForCpd,
  isHighFrequencyReliable,
  pixelPitchCm,
  screenWidthCmFromDiagonalInches,
} from "./math.ts";

describe("calibration math §8", () => {
  it("uses RAD_TO_DEG ≈ 57.2958", () => {
    assert.ok(Math.abs(RAD_TO_DEG - 57.2957795) < 1e-5);
  });

  it("derives 16:9 width from diagonal", () => {
    const widthCm = screenWidthCmFromDiagonalInches(15.6);
    assert.ok(Math.abs(widthCm - 13.6 * 2.54) < 0.2);
  });

  it("computes pixel pitch", () => {
    assert.ok(Math.abs(pixelPitchCm(34.544, 1920) - 34.544 / 1920) < 1e-6);
  });

  it("matches hand-calculated cycle width for 3 cpd at 50 cm", () => {
    const w = cycleWidthCmForCpd(3, 50);
    assert.ok(Math.abs(w - 50 / (3 * RAD_TO_DEG)) < 1e-6);
    assert.ok(Math.abs(cpdFromCycleWidth(w, 50) - 3) < 1e-5);
  });

  it("round-trips angular size", () => {
    const cycleCm = 0.5;
    const dist = 60;
    const ang = angularSizeOfOneCycleDeg(cycleCm, dist);
    assert.ok(Math.abs(1 / ang - cpdFromCycleWidth(cycleCm, dist)) < 1e-10);
  });

  it("converts to pixels", () => {
    const pitch = 0.018;
    const px = cycleWidthPxForCpd(3, 50, pitch);
    const expectedCm = 50 / (3 * RAD_TO_DEG);
    assert.ok(Math.abs(px - expectedCm / pitch) < 1e-6);
  });

  it("flags unreliable high-frequency stripes", () => {
    assert.equal(isHighFrequencyReliable(5.9), false);
    assert.equal(isHighFrequencyReliable(6), true);
  });
});
