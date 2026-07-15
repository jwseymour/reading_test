/** Paired t-test on differences (A − B). Returns t, df, two-sided p (approx). */

function regularizedBetaIncomplete(
  x: number,
  a: number,
  b: number,
): number {
  // Continued fraction approximation (sufficient for UI p-values)
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt =
    Math.exp(
      lgamma(a + b) -
        lgamma(a) -
        lgamma(b) +
        a * Math.log(x) +
        b * Math.log(1 - x),
    );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

function betacf(x: number, a: number, b: number): number {
  const MAX = 200;
  const EPS = 3e-7;
  let am = 1;
  let bm = 1;
  let az = 1;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let bz = 1 - (qab * x) / qap;
  for (let m = 1; m <= MAX; m++) {
    const em = m;
    const tem = em + em;
    let d = (em * (b - m) * x) / ((qam + tem) * (a + tem));
    const ap = az + d * am;
    const bp = bz + d * bm;
    d = (-(a + em) * (qab + em) * x) / ((a + tem) * (qap + tem));
    const app = ap + d * az;
    const bpp = bp + d * bz;
    const aold = az;
    am = ap / bpp;
    bm = bp / bpp;
    az = app / bpp;
    bz = 1;
    if (Math.abs(az - aold) < EPS * Math.abs(az)) return az;
  }
  return az;
}

function lgamma(z: number): number {
  // Stirling approximation
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.984369654078691e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  }
  z -= 1;
  let x = c[0]!;
  for (let i = 1; i < g + 2; i++) x += c[i]! / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function pairedTTest(differences: number[]): {
  t: number;
  df: number;
  pValue: number;
} {
  const n = differences.length;
  if (n < 2) return { t: NaN, df: 0, pValue: NaN };
  const mean = differences.reduce((a, b) => a + b, 0) / n;
  const variance =
    differences.reduce((a, d) => a + (d - mean) ** 2, 0) / (n - 1);
  const se = Math.sqrt(variance / n);
  const t = se === 0 ? (mean === 0 ? 0 : Infinity) : mean / se;
  const df = n - 1;
  const x = df / (df + t * t);
  const pValue = regularizedBetaIncomplete(x, df / 2, 0.5);
  return { t, df, pValue };
}
