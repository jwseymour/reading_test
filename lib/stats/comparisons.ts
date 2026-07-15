import { cohensDz } from "./cohensDz";
import { pairedTTest } from "./pairedT";
import { wilcoxonSignedRank } from "./wilcoxon";

export const MIN_TRIALS_PER_CONDITION = 5;

export type ConditionSeries = {
  conditionId: string;
  label: string;
  values: number[];
  /** optional session ids aligned with values for pairing */
  sessionIds?: string[];
};

export type PairComparison = {
  aId: string;
  bId: string;
  aLabel: string;
  bLabel: string;
  n: number;
  insufficient: boolean;
  differences: number[];
  meanDiff: number;
  cohensDz: number;
  wilcoxon: ReturnType<typeof wilcoxonSignedRank>;
  pairedT: ReturnType<typeof pairedTTest>;
  testsDisagree: boolean;
};

function pairedDifferences(
  a: ConditionSeries,
  b: ConditionSeries,
): number[] {
  if (a.sessionIds && b.sessionIds) {
    const mapB = new Map<string, number[]>();
    b.sessionIds.forEach((sid, i) => {
      const list = mapB.get(sid) ?? [];
      list.push(b.values[i]!);
      mapB.set(sid, list);
    });
    const diffs: number[] = [];
    a.sessionIds.forEach((sid, i) => {
      const pool = mapB.get(sid);
      if (pool && pool.length) {
        diffs.push(a.values[i]! - pool.shift()!);
      }
    });
    if (diffs.length >= 2) return diffs;
  }
  const n = Math.min(a.values.length, b.values.length);
  const diffs: number[] = [];
  for (let i = 0; i < n; i++) {
    diffs.push(a.values[i]! - b.values[i]!);
  }
  return diffs;
}

export function compareConditionPair(
  a: ConditionSeries,
  b: ConditionSeries,
): PairComparison {
  const insufficient =
    a.values.length < MIN_TRIALS_PER_CONDITION ||
    b.values.length < MIN_TRIALS_PER_CONDITION;
  const differences = pairedDifferences(a, b);
  const meanDiff =
    differences.length === 0
      ? NaN
      : differences.reduce((x, y) => x + y, 0) / differences.length;
  const wilcoxon = wilcoxonSignedRank(differences);
  const pairedT = pairedTTest(differences);
  const dz = cohensDz(differences);
  const alpha = 0.05;
  const wSig = wilcoxon.pValue < alpha;
  const tSig = pairedT.pValue < alpha;
  return {
    aId: a.conditionId,
    bId: b.conditionId,
    aLabel: a.label,
    bLabel: b.label,
    n: differences.length,
    insufficient,
    differences,
    meanDiff,
    cohensDz: dz,
    wilcoxon,
    pairedT,
    testsDisagree:
      Number.isFinite(wilcoxon.pValue) &&
      Number.isFinite(pairedT.pValue) &&
      wSig !== tSig,
  };
}

export function compareAllPairs(series: ConditionSeries[]): PairComparison[] {
  const out: PairComparison[] = [];
  for (let i = 0; i < series.length; i++) {
    for (let j = i + 1; j < series.length; j++) {
      out.push(compareConditionPair(series[i]!, series[j]!));
    }
  }
  return out;
}
