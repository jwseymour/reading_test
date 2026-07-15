export type FontOption = {
  id: string;
  family: string;
  label: string;
};

export const INTERVENTION_FONTS: FontOption[] = [
  {
    id: "serif",
    family: "Georgia, 'Times New Roman', serif",
    label: "Serif",
  },
  {
    id: "sans",
    family: "var(--font-source-sans), system-ui, sans-serif",
    label: "Sans",
  },
  {
    id: "atkinson",
    family: "var(--font-atkinson), 'Atkinson Hyperlegible', sans-serif",
    label: "Atkinson Hyperlegible",
  },
  {
    id: "opendyslexic",
    family: '"OpenDyslexic", var(--font-source-sans), sans-serif',
    label: "OpenDyslexic",
  },
];

export const DEFAULT_FONT_SIZE_PX = 16;
