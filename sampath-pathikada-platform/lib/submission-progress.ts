import { SECTION_KEYS, type SectionKey, type SubmissionData } from "@/lib/types/submission";
import { getSectionStrictSchema } from "@/lib/validators/section-registry";

export type SectionStatus = "empty" | "partial" | "complete";

export function getSectionStatus(data: SubmissionData, key: SectionKey): SectionStatus {
  const value = data[key];
  if (value == null) return "empty";
  const schema = getSectionStrictSchema(key);
  return schema.safeParse(value).success ? "complete" : "partial";
}

export function getAllSectionStatuses(data: SubmissionData): Record<SectionKey, SectionStatus> {
  return Object.fromEntries(SECTION_KEYS.map((key) => [key, getSectionStatus(data, key)])) as Record<
    SectionKey,
    SectionStatus
  >;
}

export function getMissingSections(data: SubmissionData): SectionKey[] {
  return SECTION_KEYS.filter((key) => data[key] == null);
}

export function getIncompleteSections(data: SubmissionData): SectionKey[] {
  return SECTION_KEYS.filter((key) => getSectionStatus(data, key) !== "complete");
}

export function getCompletionSummary(data: SubmissionData) {
  const statuses = getAllSectionStatuses(data);
  const values = Object.values(statuses);
  const complete = values.filter((s) => s === "complete").length;
  const touched = values.filter((s) => s !== "empty").length;
  return { total: SECTION_KEYS.length, complete, touched, statuses };
}
