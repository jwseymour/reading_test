/**
 * Wilcoxon signed-rank test (two-sided) on paired differences.
 * Exact enumeration for n ≤ 20; large-n normal approximation otherwise.
 */

export type WilcoxonResult = {
  W: number;
  n: number;
  pValue: number;
  method: "exact" | "approximate";
};

function rankAbs(values: number[]): number[] {
  const indexed = values
    .map((v, i) => ({ v: Math.abs(v), i, sign: Math.sign(v) }))
    .filter((x) => x.v !== 0);
  indexed.sort((a, b) => a.v - b.v);
  const ranks = new Array(values.length).fill(0);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j]!.v === indexed[i]!.v) j++;
    const avg = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      ranks[indexed[k]!.i] = avg * indexed[k]!.sign;
    }
    i = j;
  }
  return ranks;
}

function exactPValue(W: number, n: number): number {
  // Distribution of sum of positive ranks under H0
  const total = 1 << n;
  let asExtreme = 0;
  const maxW = (n * (n + 1)) / 2;
  const target = Math.min(W, maxW - W);
  for (let mask = 0; mask < total; mask++) {
    let sum = 0;
    for (let bit = 0; bit < n; bit++) {
      if (mask & (1 << bit)) sum += bit + 1;
    }
    const w = Math.min(sum, maxW - sum);
    if (w <= target) asExtreme++;
  }
  return asExtreme / total;
}

function normalPValue(W: number, n: number): number {
  const mean = (n * (n + 1)) / 4;
  const variance = (n * (n + 1) * (2 * n + 1)) / 24;
  const z = (W - mean) / Math.sqrt(variance);
  // two-sided from standard normal
  const p = 2 * (1 - normalCdf(Math.abs(z)));
  return Math.min(1, Math.max(0, p));
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function wilcoxonSignedRank(differences: number[]): WilcoxonResult {
  const nonzero = differences.filter((d) => d !== 0);
  const n = nonzero.length;
  if (n < 1) {
    return { W: 0, n: 0, pValue: NaN, method: "exact" };
  }
  const signedRanks = rankAbs(nonzero);
  const W = signedRanks.filter((r) => r > 0).reduce((a, b) => a + b, 0);
  if (n <= 20) {
    return { W, n, pValue: exactPValue(W, n), method: "exact" };
  }
  return { W, n, pValue: normalPValue(W, n), method: "approximate" };
}
