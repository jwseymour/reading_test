/** PerceptLab data model — mirrors design doc §7 */

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
  /** Optional free-text trigger note attached to intake */
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
  | "readingRuler";

export interface InterventionCondition {
  id: string;
  type: InterventionType;
  overlayHue?: number;
  overlaySaturation?: number;
  overlayLightness?: number;
  overlayOpacity?: number;
  fontFamily?: string;
  /** CSS px size for reading text; default ~16 */
  fontSizePx?: number;
  lineSpacingMultiplier?: number;
  label: string;
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

export interface ReadingPassage {
  id: string;
  lines: string[][];
  totalWords: number;
  createdAt: string;
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
  /** Blob stored in IndexedDB; omitted from default JSON export */
  blob: Blob;
}

export interface ComparisonPhase {
  id: string;
  conditionIds: string[];
  prediction: string;
  startedAt: string;
  completedAt?: string;
  sessionOrderIndex: number;
}

export interface AppSettings {
  id: "settings";
  activeSessionId?: string;
  activeComparisonPhaseId?: string;
  moduleBConsentSessionId?: string;
  lastNudgeAt?: string;
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
