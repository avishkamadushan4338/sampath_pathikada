"use client";

import useSWR from "swr";
import type { SubmissionData } from "@/lib/types/submission";

export interface DivisionProfileResult {
  gnDivision: string;
  year: number;
  approvedAt: string;
  data: SubmissionData;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return (json.data as DivisionProfileResult | null) ?? null;
};

/** One GN division's approved DivisionProfile — null while no division is selected, and
 *  null (with isLoading false) once the request resolves if that division has no approved
 *  record yet. Distinguishing "not selected" from "selected but no data" is the caller's job. */
export function useDivisionProfile(gnDivision: string | null) {
  const { data, error, isLoading } = useSWR(
    gnDivision ? `/api/division-profile?gnDivision=${encodeURIComponent(gnDivision)}` : null,
    fetcher
  );

  return {
    profile: data ?? null,
    isLoading,
    isError: !!error,
  };
}
