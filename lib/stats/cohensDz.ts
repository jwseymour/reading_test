/** Cohen's dz for paired differences: mean(d) / sd(d) */

export function cohensDz(differences: number[]): number {
  if (differences.length < 2) return NaN;
  const mean =
    differences.reduce((a, b) => a + b, 0) / differences.length;
  const variance =
    differences.reduce((a, d) => a + (d - mean) ** 2, 0) /
    (differences.length - 1);
  const sd = Math.sqrt(variance);
  if (sd === 0) return mean === 0 ? 0 : Infinity;
  return mean / sd;
}
