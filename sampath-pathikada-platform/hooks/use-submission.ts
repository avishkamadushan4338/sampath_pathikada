"use client";

import useSWR from "swr";
import { useState } from "react";
import type { SectionKey, SubmissionData } from "@/lib/types/submission";

/** Sentinel `errorMessage` value for the 409 "already submitted" case, whose body text from
 *  the API is English-only. Consumers should render `dictionary.submissionLocked[lang]`
 *  instead of this raw string, resolved at render time so it tracks the active language
 *  even if the user toggles language after the error already landed. */
export const SUBMISSION_LOCKED_ERROR = "SUBMISSION_LOCKED";

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
        setErrorMessage(res.status === 409 ? SUBMISSION_LOCKED_ERROR : json.message ?? "Save failed.");
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
