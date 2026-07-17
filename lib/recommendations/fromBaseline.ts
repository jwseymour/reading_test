import type {
  ConvergenceTrial,
  GratingTrial,
  InterventionFamily,
  JournalEntry,
  ReadingTrial,
  SymptomSurveyResponse,
} from "@/lib/types";

export type FamilyRecommendation = {
  family: InterventionFamily;
  reason: string;
  priority: number;
};

export type BaselineProfile = {
  visualStressLean: "low" | "moderate" | "high";
  ciLean: "low" | "moderate" | "high";
  readingFriction: "low" | "moderate" | "high";
  signals: string[];
  recommendations: FamilyRecommendation[];
};

export function buildBaselineProfile(input: {
  symptoms: SymptomSurveyResponse[];
  gratings: GratingTrial[];
  readings: ReadingTrial[];
  convergence: ConvergenceTrial[];
  journal: JournalEntry[];
}): BaselineProfile {
  const signals: string[] = [];
  const recs = new Map<InterventionFamily, FamilyRecommendation>();

  const add = (family: InterventionFamily, reason: string, priority: number) => {
    const existing = recs.get(family);
    if (!existing || priority > existing.priority) {
      recs.set(family, { family, reason, priority });
    }
  };

  const ci = latest(
    input.symptoms.filter((s) => s.instrument === "ci-inspired-15"),
    (s) => s.administeredAt,
  );
  const vs = latest(
    input.symptoms.filter((s) => s.instrument === "visual-stress-checklist"),
    (s) => s.administeredAt,
  );

  let ciLean: BaselineProfile["ciLean"] = "low";
  if (ci) {
    if (ci.totalScore >= 30) ciLean = "high";
    else if (ci.totalScore >= 15) ciLean = "moderate";
    signals.push(`CI-inspired total ${ci.totalScore}/60`);
    if (ciLean !== "low") {
      add(
        "lineSpacing",
        `CI-inspired score ${ci.totalScore} suggests near-work strain — try wider spacing`,
        ciLean === "high" ? 8 : 5,
      );
      add(
        "readingRuler",
        `CI-inspired symptoms often include losing place — ruler may help`,
        ciLean === "high" ? 7 : 4,
      );
      add(
        "fontSize",
        `Larger text can reduce near-work demand when CI symptoms are elevated`,
        4,
      );
    }
  }

  let visualStressLean: BaselineProfile["visualStressLean"] = "low";
  const cpd3 = input.gratings.filter((g) => g.spatialFrequencyCpd === 3);
  const meanDiscomfort3 =
    cpd3.length === 0
      ? 0
      : cpd3.reduce((a, g) => a + g.discomfortRating, 0) / cpd3.length;
  const meanIllusions3 =
    cpd3.length === 0
      ? 0
      : cpd3.reduce(
          (a, g) => a + Object.values(g.illusions).filter(Boolean).length,
          0,
        ) / cpd3.length;

  if (cpd3.length) {
    signals.push(
      `3 cpd mean discomfort ${meanDiscomfort3.toFixed(1)}, illusions ${meanIllusions3.toFixed(1)}`,
    );
    if (meanDiscomfort3 >= 5 || meanIllusions3 >= 2.5) {
      visualStressLean = "high";
      add(
        "colorOverlay",
        `Strong 3 cpd pattern-glare response — colour overlays are first-line candidates`,
        9,
      );
      add(
        "darkMode",
        `High pattern discomfort — inverted contrast may reduce stripe energy`,
        5,
      );
    } else if (meanDiscomfort3 >= 3 || meanIllusions3 >= 1.5) {
      visualStressLean = "moderate";
      add(
        "colorOverlay",
        `Moderate pattern-glare signal — worth testing overlays`,
        6,
      );
    }
  }

  if (vs && vs.totalScore >= 12) {
    if (visualStressLean === "low") visualStressLean = "moderate";
    signals.push(`Visual-stress checklist total ${vs.totalScore}`);
    add(
      "colorOverlay",
      `Elevated visual-stress checklist — overlays and contrast changes are relevant`,
      6,
    );
    add("font", `Dyslexia-oriented fonts sometimes help with pattern-related distortion`, 3);
  }

  const baselineReadings = input.readings.filter(
    (r) =>
      r.purpose === "baseline" ||
      r.conditionId === "condition-baseline-none",
  );
  let readingFriction: BaselineProfile["readingFriction"] = "low";
  if (baselineReadings.length) {
    const meanDisc =
      baselineReadings.reduce((a, r) => a + r.selfReportedDiscomfort, 0) /
      baselineReadings.length;
    const meanCwpm =
      baselineReadings.reduce((a, r) => a + r.correctWordsPerMinute, 0) /
      baselineReadings.length;
    const meanLoss =
      baselineReadings.reduce((a, r) => a + r.selfReportedLineLosses, 0) /
      baselineReadings.length;
    signals.push(
      `Baseline reading: ${meanCwpm.toFixed(0)} cwpm, discomfort ${meanDisc.toFixed(1)}, place-losses ${meanLoss.toFixed(1)}`,
    );
    if (meanDisc >= 5 || meanLoss >= 3) {
      readingFriction = "high";
      add("fontSize", `High reading discomfort/place-loss — try larger text first`, 8);
      add("lineSpacing", `Place-loss and discomfort — increase line spacing`, 7);
      add("font", `Try OpenDyslexic or Atkinson vs serif`, 5);
    } else if (meanDisc >= 3 || meanLoss >= 1.5 || meanCwpm < 120) {
      readingFriction = "moderate";
      add("fontSize", `Moderate dense-text friction — size is a cheap first test`, 6);
      add("lineSpacing", `Moderate friction — spacing may help`, 4);
    }
  }

  const npc = input.convergence.filter((c) => c.method.startsWith("npc"));
  if (npc.length) {
    const latestNpc = latest(npc, (c) => c.timestamp)!;
    if (
      latestNpc.nearPointOfConvergenceCm != null &&
      latestNpc.nearPointOfConvergenceCm > 10
    ) {
      signals.push(
        `NPC break ~${latestNpc.nearPointOfConvergenceCm} cm (${latestNpc.method})`,
      );
      if (ciLean === "low") ciLean = "moderate";
      add(
        "fontSize",
        `Receded NPC suggests near demand is hard — larger text / less dense layout`,
        6,
      );
    }
  }

  const patternJournal = input.journal.filter(
    (j) => j.triggerType === "pattern" || j.triggerType === "reading",
  );
  if (patternJournal.some((j) => j.severity >= 6)) {
    signals.push("High-severity pattern/reading journal events");
    add(
      "colorOverlay",
      `Real-world pattern/reading triggers logged as severe`,
      7,
    );
  }

  // Always offer a minimal default if nothing fired
  if (recs.size === 0) {
    add("fontSize", "Default starter: text size is low-friction to test", 2);
    add("colorOverlay", "Default starter: overlays are common visual-stress aids", 2);
    add("lineSpacing", "Default starter: spacing is easy to compare", 2);
  }

  const recommendations = [...recs.values()]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);

  return {
    visualStressLean,
    ciLean,
    readingFriction,
    signals,
    recommendations,
  };
}

function latest<T>(items: T[], key: (t: T) => string): T | undefined {
  return items.slice().sort((a, b) => key(b).localeCompare(key(a)))[0];
}
