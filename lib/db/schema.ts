import type { DBSchema } from "idb";
import type {
  AppSettings,
  ComparisonPhase,
  ConvergenceTrial,
  GratingTrial,
  InterventionCondition,
  JournalEntry,
  PhotoBlob,
  ReadingPassage,
  ReadingTrial,
  ScreenCalibration,
  SessionMeta,
  SubjectiveOverlayTrial,
  SymptomSurveyResponse,
} from "@/lib/types";

export const DB_NAME = "perceptlab";
export const DB_VERSION = 1;

export interface PerceptLabDB extends DBSchema {
  calibrations: {
    key: string;
    value: ScreenCalibration;
    indexes: { "by-calibratedAt": string };
  };
  sessions: {
    key: string;
    value: SessionMeta;
    indexes: { "by-startedAt": string };
  };
  symptomSurveys: {
    key: string;
    value: SymptomSurveyResponse;
    indexes: {
      "by-sessionId": string;
      "by-administeredAt": string;
    };
  };
  gratingTrials: {
    key: string;
    value: GratingTrial;
    indexes: {
      "by-sessionId": string;
      "by-timestamp": string;
      "by-calibrationId": string;
    };
  };
  conditions: {
    key: string;
    value: InterventionCondition;
  };
  subjectiveOverlayTrials: {
    key: string;
    value: SubjectiveOverlayTrial;
    indexes: {
      "by-sessionId": string;
      "by-timestamp": string;
      "by-conditionId": string;
    };
  };
  passages: {
    key: string;
    value: ReadingPassage;
  };
  readingTrials: {
    key: string;
    value: ReadingTrial;
    indexes: {
      "by-sessionId": string;
      "by-timestamp": string;
      "by-conditionId": string;
      "by-passageId": string;
    };
  };
  convergenceTrials: {
    key: string;
    value: ConvergenceTrial;
    indexes: {
      "by-sessionId": string;
      "by-timestamp": string;
    };
  };
  journalEntries: {
    key: string;
    value: JournalEntry;
    indexes: { "by-occurredAt": string };
  };
  photos: {
    key: string;
    value: PhotoBlob;
  };
  comparisonPhases: {
    key: string;
    value: ComparisonPhase;
    indexes: { "by-startedAt": string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

export const STORE_NAMES = [
  "calibrations",
  "sessions",
  "symptomSurveys",
  "gratingTrials",
  "conditions",
  "subjectiveOverlayTrials",
  "passages",
  "readingTrials",
  "convergenceTrials",
  "journalEntries",
  "photos",
  "comparisonPhases",
  "settings",
] as const;
