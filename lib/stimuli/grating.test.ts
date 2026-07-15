import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { drawSquareWaveGrating } from "./grating.ts";

describe("grating renderer", () => {
  it("issues fillRect calls at the requested vertical cycle pitch", () => {
    const fillRect = mock.fn();
    const ctx = {
      fillStyle: "",
      fillRect,
    } as unknown as CanvasRenderingContext2D;

    drawSquareWaveGrating({
      ctx,
      width: 100,
      height: 50,
      cycleWidthPx: 20,
      orientation: "vertical",
      contrast: 1,
      dutyCycle: 0.5,
    });

    const darkBars = fillRect.mock.calls
      .map((c) => c.arguments)
      .filter(
        (args) => !(args[0] === 0 && args[1] === 0 && args[2] === 100),
      );
    assert.equal(darkBars.length, 5);
    assert.deepEqual(darkBars[0], [0, 0, 10, 50]);
    assert.deepEqual(darkBars[1], [20, 0, 10, 50]);
  });
});
