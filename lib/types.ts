/** PerceptLab data model — mirrors design doc §7 + UX redesign extensions */

export type AmbientLighting = "dim" | "normal" | "bright" | "daylight";

export type CalibrationConfidence = "measured" | "diagonal-assumed" | "low-confidence";

export interface ScreenCalibration {
  id: string;
  deviceLabel: string;
  screenDiagonalInches: number;
  resolutionPxW: number;
  resolutionPxH: number;
  measuredScreenWidthCm?: number;
  pixelPitchCm: number;
  assumedViewingDistanceCm: number;
  measuredViewingDistanceCm?: number;
  calibratedAt: string;
  confidence: CalibrationConfidence;
}

export interface SessionMeta {
  id: string;
  startedAt: string;
  endedAt?: string;
  hoursSinceWaking?: number;
  sleepHoursLastNight?: number;
  caffeineMgToday?: number;
  screenTimeHoursToday?: number;
  ambientLighting?: AmbientLighting;
  fatigueSelfRating?: number;
  notes?: string;
}

export type SymptomInstrument = "ci-inspired-15" | "visual-stress-checklist";

export interface SymptomSurveyResponse {
  id: string;
  sessionId: string;
  instrument: SymptomInstrument;
  itemScores: Record<string, number>;
  totalScore: number;
  administeredAt: string;
  triggerNote?: string;
  triggerTags?: string[];
}

export type SpatialFrequencyCpd = 0.5 | 3 | 12;
export type GratingOrientation = "horizontal" | "vertical";

export interface GratingIllusions {
  motion: boolean;
  colorFringing: boolean;
  shapeDistortion: boolean;
  flicker: boolean;
  blur: boolean;
}

export interface GratingTrial {
  id: string;
  sessionId: string;
  calibrationId: string;
  spatialFrequencyCpd: SpatialFrequencyCpd;
  orientation: GratingOrientation;
  contrast: number;
  exposureDurationMs: number;
  illusions: GratingIllusions;
  discomfortRating: number;
  timestamp: string;
}

export type InterventionType =
  | "none"
  | "colorOverlay"
  | "darkMode"
  | "fontChange"
  | "fontSize"
  | "lineSpacing"
  | "readingRuler"
  | "composite";

export interface InterventionCondition {
  id: string;
  type: InterventionType;
  overlayHue?: number;
  overlaySaturation?: number;
  overlayLightness?: number;
  overlayOpacity?: number;
  fontFamily?: string;
  fontSizePx?: number;
  lineSpacingMultiplier?: number;
  label: string;
  /** Promoted from Playground into Find Stage 3 */
  promotedFromPlayground?: boolean;
  /** For composites that include dark mode */
  invertContrast?: boolean;
  /** For composites that include reading ruler */
  useReadingRuler?: boolean;
}

export type SubjectiveOverlayRating = "better" | "worse" | "same";

export interface SubjectiveOverlayTrial {
  id: string;
  sessionId: string;
  conditionId: string;
  rating: SubjectiveOverlayRating;
  discomfortRating: number;
  notes?: string;
  timestamp: string;
}

export type PassageSource = "builtin-paper" | "custom-paste" | "legacy-wrrt";

export interface ReadingPassage {
  id: string;
  /** Paragraphs of plain text (paper-style). Legacy WRRT used lines[][]. */
  paragraphs?: string[];
  /** @deprecated WRRT line grid — kept for old stored records */
  lines?: string[][];
  totalWords: number;
  createdAt: string;
  source?: PassageSource;
  title?: string;
}

export interface ReadingTrial {
  id: string;
  sessionId: string;
  passageId: string;
  conditionId: string;
  correctWordsRead: number;
  totalWordsInPassage: number;
  errorCount: number;
  timeTakenMs: number;
  correctWordsPerMinute: number;
  perLineTimestampsMs: number[];
  selfReportedLineLosses: number;
  selfReportedDiscomfort: number;
  timestamp: string;
  /** Optional comprehension score 0–1 */
  comprehensionScore?: number;
  purpose?: "baseline" | "find" | "playground" | "manual";
}

export type ConvergenceMethod =
  | "npc-selfreport"
  | "npc-witnessed"
  | "saccade-digital";

export interface ConvergenceTrial {
  id: string;
  sessionId: string;
  method: ConvergenceMethod;
  nearPointOfConvergenceCm?: number;
  diplopiaReported?: boolean;
  saccadeAccuracy?: number;
  saccadeDurationMs?: number;
  timestamp: string;
}

export type TriggerType = "pattern" | "reading" | "screen" | "lighting" | "other";

export interface JournalEntry {
  id: string;
  occurredAt: string;
  description: string;
  triggerType: TriggerType;
  perceivedEffects: string[];
  severity: number;
  durationMinutes?: number;
  photoRefLocal?: string;
  tiredOrStressed?: boolean;
}

export interface PhotoBlob {
  id: string;
  mimeType: string;
  createdAt: string;
  blob: Blob;
}

export type InterventionFamily =
  | "fontSize"
  | "font"
  | "colorOverlay"
  | "lineSpacing"
  | "darkMode"
  | "readingRuler";

export type FindStage =
  | "families"
  | "within-family"
  | "combine"
  | "confirm"
  | "complete";

export interface ComparisonPhase {
  id: string;
  conditionIds: string[];
  prediction: string;
  startedAt: string;
  completedAt?: string;
  sessionOrderIndex: number;
  /** Adaptive Find wizard state */
  stage?: FindStage;
  selectedFamilies?: InterventionFamily[];
  recommendedFamilies?: InterventionFamily[];
  sourceSignals?: string[];
  familyWinners?: Partial<Record<InterventionFamily, string>>;
  /** Current family being A/B tested */
  activeFamily?: InterventionFamily;
  compositeConditionIds?: string[];
  confirmedProfileId?: string;
}

export interface AppSettings {
  id: "settings";
  activeSessionId?: string;
  activeComparisonPhaseId?: string;
  moduleBConsentSessionId?: string;
  lastNudgeAt?: string;
  promotedConditionIds?: string[];
}

export type StoreName =
  | "calibrations"
  | "sessions"
  | "symptomSurveys"
  | "gratingTrials"
  | "conditions"
  | "subjectiveOverlayTrials"
  | "passages"
  | "readingTrials"
  | "convergenceTrials"
  | "journalEntries"
  | "photos"
  | "comparisonPhases"
  | "settings";

export interface ExportBundle {
  version: 1;
  exportedAt: string;
  calibrations: ScreenCalibration[];
  sessions: SessionMeta[];
  symptomSurveys: SymptomSurveyResponse[];
  gratingTrials: GratingTrial[];
  conditions: InterventionCondition[];
  subjectiveOverlayTrials: SubjectiveOverlayTrial[];
  passages: ReadingPassage[];
  readingTrials: ReadingTrial[];
  convergenceTrials: ConvergenceTrial[];
  journalEntries: JournalEntry[];
  comparisonPhases: ComparisonPhase[];
  settings: AppSettings | null;
}
