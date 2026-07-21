"use client";

import useSWR from "swr";
import { useState } from "react";
import type { SectionKey, SubmissionData } from "@/lib/types/submission";

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
        setErrorMessage(json.message ?? "Save failed.");
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
