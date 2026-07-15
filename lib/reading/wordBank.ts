/** Fixed high-frequency short words for WRRT-inspired passages — original bank. */
export const WORD_BANK = [
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "had",
  "her",
  "was",
  "one",
  "our",
  "out",
  "day",
  "get",
  "has",
  "him",
  "his",
] as const;

export type BankWord = (typeof WORD_BANK)[number];
