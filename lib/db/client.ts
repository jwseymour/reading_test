"use client";

import { openDB, type IDBPDatabase } from "idb";
import type { PerceptLabDB } from "./schema";
import { DB_NAME, DB_VERSION, STORE_NAMES } from "./schema";
import type {
  AppSettings,
  ComparisonPhase,
  ConvergenceTrial,
  ExportBundle,
  GratingTrial,
  InterventionCondition,
  JournalEntry,
  PhotoBlob,
  ReadingPassage,
  ReadingTrial,
  ScreenCalibration,
  SessionMeta,
  StoreName,
  SubjectiveOverlayTrial,
  SymptomSurveyResponse,
} from "@/lib/types";

let dbPromise: Promise<IDBPDatabase<PerceptLabDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<PerceptLabDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (!dbPromise) {
    dbPromise = openDB<PerceptLabDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("calibrations")) {
          const s = db.createObjectStore("calibrations", { keyPath: "id" });
          s.createIndex("by-calibratedAt", "calibratedAt");
        }
        if (!db.objectStoreNames.contains("sessions")) {
          const s = db.createObjectStore("sessions", { keyPath: "id" });
          s.createIndex("by-startedAt", "startedAt");
        }
        if (!db.objectStoreNames.contains("symptomSurveys")) {
          const s = db.createObjectStore("symptomSurveys", { keyPath: "id" });
          s.createIndex("by-sessionId", "sessionId");
          s.createIndex("by-administeredAt", "administeredAt");
        }
        if (!db.objectStoreNames.contains("gratingTrials")) {
          const s = db.createObjectStore("gratingTrials", { keyPath: "id" });
          s.createIndex("by-sessionId", "sessionId");
          s.createIndex("by-timestamp", "timestamp");
          s.createIndex("by-calibrationId", "calibrationId");
        }
        if (!db.objectStoreNames.contains("conditions")) {
          db.createObjectStore("conditions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("subjectiveOverlayTrials")) {
          const s = db.createObjectStore("subjectiveOverlayTrials", {
            keyPath: "id",
          });
          s.createIndex("by-sessionId", "sessionId");
          s.createIndex("by-timestamp", "timestamp");
          s.createIndex("by-conditionId", "conditionId");
        }
        if (!db.objectStoreNames.contains("passages")) {
          db.createObjectStore("passages", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("readingTrials")) {
          const s = db.createObjectStore("readingTrials", { keyPath: "id" });
          s.createIndex("by-sessionId", "sessionId");
          s.createIndex("by-timestamp", "timestamp");
          s.createIndex("by-conditionId", "conditionId");
          s.createIndex("by-passageId", "passageId");
        }
        if (!db.objectStoreNames.contains("convergenceTrials")) {
          const s = db.createObjectStore("convergenceTrials", {
            keyPath: "id",
          });
          s.createIndex("by-sessionId", "sessionId");
          s.createIndex("by-timestamp", "timestamp");
        }
        if (!db.objectStoreNames.contains("journalEntries")) {
          const s = db.createObjectStore("journalEntries", { keyPath: "id" });
          s.createIndex("by-occurredAt", "occurredAt");
        }
        if (!db.objectStoreNames.contains("photos")) {
          db.createObjectStore("photos", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("comparisonPhases")) {
          const s = db.createObjectStore("comparisonPhases", {
            keyPath: "id",
          });
          s.createIndex("by-startedAt", "startedAt");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

async function put<T>(store: StoreName, value: T): Promise<void> {
  const db = await getDb();
  // idb's put is store-specific; cast through unknown for shared helper
  await (db as IDBPDatabase).put(store, value as never);
}

async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await getDb();
  return (await (db as IDBPDatabase).getAll(store)) as T[];
}

async function getById<T>(
  store: StoreName,
  id: string,
): Promise<T | undefined> {
  const db = await getDb();
  return (await (db as IDBPDatabase).get(store, id)) as T | undefined;
}

async function deleteById(store: StoreName, id: string): Promise<void> {
  const db = await getDb();
  await (db as IDBPDatabase).delete(store, id);
}

export const dbApi = {
  putCalibration: (v: ScreenCalibration) => put("calibrations", v),
  getCalibration: (id: string) => getById<ScreenCalibration>("calibrations", id),
  getAllCalibrations: () => getAll<ScreenCalibration>("calibrations"),
  getLatestCalibration: async () => {
    const all = await getAll<ScreenCalibration>("calibrations");
    return all.sort((a, b) => b.calibratedAt.localeCompare(a.calibratedAt))[0];
  },

  putSession: (v: SessionMeta) => put("sessions", v),
  getSession: (id: string) => getById<SessionMeta>("sessions", id),
  getAllSessions: () => getAll<SessionMeta>("sessions"),

  putSymptomSurvey: (v: SymptomSurveyResponse) => put("symptomSurveys", v),
  getAllSymptomSurveys: () => getAll<SymptomSurveyResponse>("symptomSurveys"),

  putGratingTrial: (v: GratingTrial) => put("gratingTrials", v),
  getAllGratingTrials: () => getAll<GratingTrial>("gratingTrials"),

  putCondition: (v: InterventionCondition) => put("conditions", v),
  getCondition: (id: string) =>
    getById<InterventionCondition>("conditions", id),
  getAllConditions: () => getAll<InterventionCondition>("conditions"),

  putSubjectiveOverlayTrial: (v: SubjectiveOverlayTrial) =>
    put("subjectiveOverlayTrials", v),
  getAllSubjectiveOverlayTrials: () =>
    getAll<SubjectiveOverlayTrial>("subjectiveOverlayTrials"),

  putPassage: (v: ReadingPassage) => put("passages", v),
  getPassage: (id: string) => getById<ReadingPassage>("passages", id),
  getAllPassages: () => getAll<ReadingPassage>("passages"),

  putReadingTrial: (v: ReadingTrial) => put("readingTrials", v),
  getAllReadingTrials: () => getAll<ReadingTrial>("readingTrials"),

  putConvergenceTrial: (v: ConvergenceTrial) => put("convergenceTrials", v),
  getAllConvergenceTrials: () => getAll<ConvergenceTrial>("convergenceTrials"),

  putJournalEntry: (v: JournalEntry) => put("journalEntries", v),
  getAllJournalEntries: () => getAll<JournalEntry>("journalEntries"),
  deleteJournalEntry: (id: string) => deleteById("journalEntries", id),

  putPhoto: (v: PhotoBlob) => put("photos", v),
  getPhoto: (id: string) => getById<PhotoBlob>("photos", id),
  getAllPhotos: () => getAll<PhotoBlob>("photos"),
  deletePhoto: (id: string) => deleteById("photos", id),

  putComparisonPhase: (v: ComparisonPhase) => put("comparisonPhases", v),
  getComparisonPhase: (id: string) =>
    getById<ComparisonPhase>("comparisonPhases", id),
  getAllComparisonPhases: () => getAll<ComparisonPhase>("comparisonPhases"),

  getSettings: async (): Promise<AppSettings> => {
    const existing = await getById<AppSettings>("settings", "settings");
    return existing ?? { id: "settings" };
  },
  putSettings: (v: AppSettings) => put("settings", { ...v, id: "settings" }),

  wipeAll: async () => {
    const db = await getDb();
    const tx = db.transaction([...STORE_NAMES], "readwrite");
    await Promise.all(STORE_NAMES.map((name) => tx.objectStore(name).clear()));
    await tx.done;
  },

  exportBundle: async (): Promise<ExportBundle> => {
    const settings = await dbApi.getSettings();
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      calibrations: await dbApi.getAllCalibrations(),
      sessions: await dbApi.getAllSessions(),
      symptomSurveys: await dbApi.getAllSymptomSurveys(),
      gratingTrials: await dbApi.getAllGratingTrials(),
      conditions: await dbApi.getAllConditions(),
      subjectiveOverlayTrials: await dbApi.getAllSubjectiveOverlayTrials(),
      passages: await dbApi.getAllPassages(),
      readingTrials: await dbApi.getAllReadingTrials(),
      convergenceTrials: await dbApi.getAllConvergenceTrials(),
      journalEntries: (await dbApi.getAllJournalEntries()).map((e) => ({
        ...e,
        // Photos are local blobs — strip refs stay; blobs excluded
      })),
      comparisonPhases: await dbApi.getAllComparisonPhases(),
      settings,
    };
  },

  importBundle: async (
    bundle: ExportBundle,
    mode: "merge" | "replace",
  ): Promise<void> => {
    if (mode === "replace") {
      await dbApi.wipeAll();
    }
    const db = await getDb();
    const tx = db.transaction(
      [
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
        "comparisonPhases",
        "settings",
      ],
      "readwrite",
    );
    for (const v of bundle.calibrations ?? []) {
      await tx.objectStore("calibrations").put(v);
    }
    for (const v of bundle.sessions ?? []) {
      await tx.objectStore("sessions").put(v);
    }
    for (const v of bundle.symptomSurveys ?? []) {
      await tx.objectStore("symptomSurveys").put(v);
    }
    for (const v of bundle.gratingTrials ?? []) {
      await tx.objectStore("gratingTrials").put(v);
    }
    for (const v of bundle.conditions ?? []) {
      await tx.objectStore("conditions").put(v);
    }
    for (const v of bundle.subjectiveOverlayTrials ?? []) {
      await tx.objectStore("subjectiveOverlayTrials").put(v);
    }
    for (const v of bundle.passages ?? []) {
      await tx.objectStore("passages").put(v);
    }
    for (const v of bundle.readingTrials ?? []) {
      await tx.objectStore("readingTrials").put(v);
    }
    for (const v of bundle.convergenceTrials ?? []) {
      await tx.objectStore("convergenceTrials").put(v);
    }
    for (const v of bundle.journalEntries ?? []) {
      await tx.objectStore("journalEntries").put(v);
    }
    for (const v of bundle.comparisonPhases ?? []) {
      await tx.objectStore("comparisonPhases").put(v);
    }
    if (bundle.settings) {
      await tx.objectStore("settings").put(bundle.settings);
    }
    await tx.done;
  },
};
