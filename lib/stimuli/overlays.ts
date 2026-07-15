export type OverlayHsl = {
  hue: number;
  saturation: number;
  lightness: number;
  opacity: number;
};

export function overlayCssColour(o: OverlayHsl): string {
  return `hsla(${o.hue}, ${o.saturation}%, ${o.lightness}%, ${o.opacity})`;
}

export const SAMPLE_DENSE_TEXT = Array.from({ length: 12 }, () =>
  "the and for are but not you all can had her was one our out day get has him his how man new now old see two way who boy did its let put say she too use",
).join("\n");
