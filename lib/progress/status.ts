import type {
  ConvergenceTrial,
  GratingTrial,
  JournalEntry,
  ReadingTrial,
  ScreenCalibration,
  SymptomSurveyResponse,
} from "@/lib/types";

export type StepStatus = "missing" | "partial" | "done" | "optional";

export type AssessStepId =
  | "calibration"
  | "symptoms"
  | "patternGlare"
  | "readingBaseline"
  | "binocular"
  | "journal";

export type AssessStep = {
  id: AssessStepId;
  title: string;
  href: string;
  status: StepStatus;
  detail: string;
  required: boolean;
};

export type ProgressSnapshot = {
  steps: AssessStep[];
  nextStep: AssessStep | null;
  assessReadyForFind: boolean;
  calibration: ScreenCalibration | null;
  completedRequired: number;
  totalRequired: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeProgress(input: {
  calibration: ScreenCalibration | null | undefined;
  symptoms: SymptomSurveyResponse[];
  gratings: GratingTrial[];
  readings: ReadingTrial[];
  convergence: ConvergenceTrial[];
  journal: JournalEntry[];
}): ProgressSnapshot {
  const cal = input.calibration ?? null;
  let calStatus: StepStatus = "missing";
  let calDetail = "Required before pattern glare";
  if (cal) {
    if (cal.confidence === "measured") {
      calStatus = "done";
      calDetail = `Measured · ${cal.deviceLabel}`;
    } else if (cal.confidence === "low-confidence") {
      calStatus = "partial";
      calDetail = `Low confidence · ${cal.deviceLabel}`;
    } else {
      calStatus = "done";
      calDetail = `Diagonal-assumed · ${cal.deviceLabel}`;
    }
  }

  const latestCi = latestOf(
    input.symptoms.filter((s) => s.instrument === "ci-inspired-15"),
    (s) => s.administeredAt,
  );
  const latestVs = latestOf(
    input.symptoms.filter((s) => s.instrument === "visual-stress-checklist"),
    (s) => s.administeredAt,
  );
  const symptomFresh =
    !!latestCi &&
    Date.now() - new Date(latestCi.administeredAt).getTime() < WEEK_MS;
  let symptomStatus: StepStatus = "missing";
  let symptomDetail = "CI-inspired + visual-stress checklists";
  if (latestCi && latestVs) {
    symptomStatus = symptomFresh ? "done" : "partial";
    symptomDetail = `CI ${latestCi.totalScore}/60 · VS ${latestVs.totalScore}${
      symptomFresh ? "" : " · older than a week"
    }`;
  } else if (latestCi || latestVs) {
    symptomStatus = "partial";
    symptomDetail = "Complete both checklists";
  }

  const glareN = input.gratings.length;
  const glareStatus: StepStatus =
    glareN >= 18 ? "done" : glareN >= 6 ? "partial" : "missing";
  const glareDetail =
    glareN === 0
      ? "No trials yet"
      : glareN >= 18
        ? `${glareN} trials (full battery done)`
        : `${glareN} trials (quick ok; full preferred)`;

  const baselineReadings = input.readings.filter(
    (r) =>
      r.purpose === "baseline" ||
      r.conditionId === "condition-baseline-none",
  );
  const readingStatus: StepStatus =
    baselineReadings.length >= 2
      ? "done"
      : baselineReadings.length >= 1
        ? "partial"
        : "missing";
  const readingDetail =
    baselineReadings.length === 0
      ? "Paper-style baseline, no intervention"
      : `${baselineReadings.length} baseline trial(s)`;

  const hasNpc = input.convergence.some((c) =>
    c.method.startsWith("npc"),
  );
  const hasSaccade = input.convergence.some(
    (c) => c.method === "saccade-digital",
  );
  const binocStatus: StepStatus =
    hasNpc && hasSaccade
      ? "done"
      : hasNpc || hasSaccade
        ? "partial"
        : "missing";
  const binocDetail =
    binocStatus === "missing"
      ? "NPC log and/or saccade baseline"
      : [
          hasNpc ? "NPC logged" : null,
          hasSaccade ? "Saccade logged" : null,
        ]
          .filter(Boolean)
          .join(" · ");

  const journalStatus: StepStatus =
    input.journal.length > 0 ? "done" : "optional";
  const journalDetail =
    input.journal.length === 0
      ? "Optional — log real-world triggers anytime"
      : `${input.journal.length} entries`;

  const steps: AssessStep[] = [
    {
      id: "calibration",
      title: "Calibration",
      href: "/assess/calibration",
      status: calStatus,
      detail: calDetail,
      required: true,
    },
    {
      id: "symptoms",
      title: "Symptoms",
      href: "/assess/symptoms",
      status: symptomStatus,
      detail: symptomDetail,
      required: true,
    },
    {
      id: "patternGlare",
      title: "Pattern glare",
      href: "/assess/pattern-glare",
      status: glareStatus,
      detail: glareDetail,
      required: true,
    },
    {
      id: "readingBaseline",
      title: "Reading baseline",
      href: "/assess/reading-baseline",
      status: readingStatus,
      detail: readingDetail,
      required: true,
    },
    {
      id: "binocular",
      title: "Binocular screening",
      href: "/assess/binocular",
      status: binocStatus,
      detail: binocDetail,
      required: false,
    },
    {
      id: "journal",
      title: "Trigger journal",
      href: "/assess/journal",
      status: journalStatus,
      detail: journalDetail,
      required: false,
    },
  ];

  const required = steps.filter((s) => s.required);
  const completedRequired = required.filter((s) => s.status === "done").length;
  const nextStep =
    steps.find((s) => s.required && s.status !== "done") ??
    steps.find((s) => s.status === "partial" || s.status === "missing") ??
    null;

  // Ready when calibration + symptoms + some glare + ≥1 baseline reading
  const assessReadyForFind =
    calStatus !== "missing" &&
    (symptomStatus === "done" || symptomStatus === "partial") &&
    glareStatus !== "missing" &&
    readingStatus !== "missing";

  return {
    steps,
    nextStep,
    assessReadyForFind,
    calibration: cal,
    completedRequired,
    totalRequired: required.length,
  };
}

function latestOf<T>(items: T[], key: (t: T) => string): T | undefined {
  return items.slice().sort((a, b) => key(b).localeCompare(key(a)))[0];
}
