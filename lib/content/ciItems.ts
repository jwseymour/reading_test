/** Original CI-inspired items covering CISS symptom domains — not the CISS text. */

export type LikertItem = {
  id: string;
  prompt: string;
};

export const CI_INSPIRED_ITEMS: LikertItem[] = [
  {
    id: ci("eyes-tired"),
    prompt: "Do your eyes feel tired or strained during or after near work (reading, screens)?",
  },
  {
    id: ci("eyes-uncomfortable"),
    prompt: "Do your eyes feel uncomfortable during near work?",
  },
  {
    id: ci("headache"),
    prompt: "Do you get headaches during or after reading or other near work?",
  },
  {
    id: ci("sleepy"),
    prompt: "Do you feel sleepy when reading or doing near work?",
  },
  {
    id: ci("lose-concentration"),
    prompt: "Do you lose concentration when reading or doing near work?",
  },
  {
    id: ci("trouble-remember"),
    prompt: "Do you have trouble remembering what you read?",
  },
  {
    id: ci("double-vision"),
    prompt: "Do you see double when reading or doing near work?",
  },
  {
    id: ci("words-move"),
    prompt: "Do words appear to move, jump, swim, or shimmer on the page or screen?",
  },
  {
    id: ci("blur"),
    prompt: "Does near vision go blurry or in-and-out of focus during reading?",
  },
  {
    id: ci("lose-place"),
    prompt: "Do you lose your place while reading?",
  },
  {
    id: ci("reread"),
    prompt: "Do you have to re-read the same line of words?",
  },
  {
    id: ci("pulling"),
    prompt: "Do your eyes feel like they are pulling or sore after near work?",
  },
  {
    id: ci("avoid-near"),
    prompt: "Do you avoid reading or near work because of visual discomfort?",
  },
  {
    id: ci("hold-away"),
    prompt: "Do you hold reading material farther away than usual to see it better?",
  },
  {
    id: ci("close-one-eye"),
    prompt: "Do you close or cover one eye when reading?",
  },
];

function ci(suffix: string): string {
  return `ci-${suffix}`;
}

export const LIKERT_LABELS = [
  "Never",
  "Infrequently",
  "Sometimes",
  "Fairly often",
  "Always",
] as const;
