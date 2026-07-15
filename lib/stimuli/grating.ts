import type { GratingOrientation } from "../types";

export type DrawGratingOptions = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  cycleWidthPx: number;
  orientation: GratingOrientation;
  /** 0–1; 1 = full black/white */
  contrast?: number;
  dutyCycle?: number;
};

/**
 * Square-wave grating, ~50% duty cycle, static (no flicker).
 * cycleWidthPx = one full black+white period in device pixels.
 */
export function drawSquareWaveGrating(opts: DrawGratingOptions): void {
  const {
    ctx,
    width,
    height,
    cycleWidthPx,
    orientation,
    contrast = 1,
    dutyCycle = 0.5,
  } = opts;

  const cycle = Math.max(2, cycleWidthPx);
  const half = Math.max(1, Math.round(cycle * dutyCycle));
  const dark = Math.round(127.5 * (1 - contrast));
  const light = Math.round(255 - 127.5 * (1 - contrast));

  ctx.fillStyle = `rgb(${light},${light},${light})`;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = `rgb(${dark},${dark},${dark})`;

  if (orientation === "vertical") {
    for (let x = 0; x < width; x += cycle) {
      ctx.fillRect(x, 0, half, height);
    }
  } else {
    for (let y = 0; y < height; y += cycle) {
      ctx.fillRect(0, y, width, half);
    }
  }
}

export function fillNeutralGrey(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colour = "#808080",
): void {
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, width, height);
}

/** Measure average stripe period along a scanline for tests. */
export function measureVerticalCyclePx(
  ctx: CanvasRenderingContext2D,
  width: number,
  y = 0,
): number | null {
  const data = ctx.getImageData(0, y, width, 1).data;
  const isDark = (i: number) => data[i] < 128;
  let transitions = 0;
  let first = -1;
  let second = -1;
  for (let x = 1; x < width; x++) {
    if (isDark(x * 4) !== isDark((x - 1) * 4)) {
      transitions++;
      if (first < 0) first = x;
      else if (second < 0) {
        second = x;
        break;
      }
    }
  }
  if (first < 0 || second < 0) return null;
  return second - first;
}
