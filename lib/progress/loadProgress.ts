"use client";

import { dbApi } from "@/lib/db/client";
import { computeProgress, type ProgressSnapshot } from "./status";
import { buildBaselineProfile, type BaselineProfile } from "@/lib/recommendations/fromBaseline";

export async function loadProgressSnapshot(): Promise<{
  progress: ProgressSnapshot;
  profile: BaselineProfile;
}> {
  const [
    calibration,
    symptoms,
    gratings,
    readings,
    convergence,
    journal,
  ] = await Promise.all([
    dbApi.getLatestCalibration(),
    dbApi.getAllSymptomSurveys(),
    dbApi.getAllGratingTrials(),
    dbApi.getAllReadingTrials(),
    dbApi.getAllConvergenceTrials(),
    dbApi.getAllJournalEntries(),
  ]);

  const progress = computeProgress({
    calibration,
    symptoms,
    gratings,
    readings,
    convergence,
    journal,
  });

  const profile = buildBaselineProfile({
    symptoms,
    gratings,
    readings,
    convergence,
    journal,
  });

  return { progress, profile };
}
