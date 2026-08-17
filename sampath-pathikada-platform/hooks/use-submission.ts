"use client";

import useSWR from "swr";
import { useState } from "react";
import type { SectionKey, SubmissionData } from "@/lib/types/submission";
import type { SectionReviews } from "@/lib/submission-review";

/** Sentinel `errorMessage` values for the 409 "locked" cases, whose body text from the API is
 *  English-only. Consumers should render the corresponding `dictionary.*` string instead of this
 *  raw value, resolved at render time so it tracks the active language even if the user toggles
 *  language after the error already landed. `SUBMISSION_LOCKED_ERROR` is kept as the generic
 *  fallback for any 409 that doesn't carry one of the more specific per-section codes below. */
export const SUBMISSION_LOCKED_ERROR = "SUBMISSION_LOCKED";
export const SECTION_LOCKED_APPROVED_ERROR = "SECTION_LOCKED_APPROVED";
export const SECTION_LOCKED_SUBMITTED_ERROR = "SECTION_LOCKED_SUBMITTED";

export interface SubmissionRecord {
  id: string;
  submittedById: string;
  year: number;
  district: string;
  dsDivision: string;
  gnDivision: string;
  data: SubmissionData;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "REVISION_NEEDED";
  rejectionNote: string | null;
  sectionReviews: SectionReviews | null;
  createdAt: string;
  updatedAt: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load submission");
  return json.data as SubmissionRecord;
};

export function useSubmission(year: number) {
  const { data, error, isLoading, mutate } = useSWR<SubmissionRecord>(
    `/api/my-submission/${year}`,
    fetcher
  );

  return { submission: data ?? null, isLoading, isError: !!error, mutate };
}

/** Maps the API's `code` field on a 409 to the sentinel the UI renders a translated message
 *  for. Anything else — no code, or a code predating this mapping — falls back to the generic
 *  "already locked" message rather than showing a raw/untranslated string. */
function lockedErrorFor(code: unknown): string {
  if (code === "SECTION_LOCKED_APPROVED") return SECTION_LOCKED_APPROVED_ERROR;
  if (code === "SECTION_LOCKED_SUBMITTED") return SECTION_LOCKED_SUBMITTED_ERROR;
  return SUBMISSION_LOCKED_ERROR;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useSaveSection(year: number) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function saveSection(section: SectionKey, data: unknown): Promise<boolean> {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/my-submission/${year}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus("error");
        setErrorMessage(res.status === 409 ? lockedErrorFor(json.code) : (json.message ?? "Save failed."));
        return false;
      }
      setStatus("saved");
      return true;
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
      return false;
    }
  }

  return { saveSection, status, errorMessage, setStatus };
}
