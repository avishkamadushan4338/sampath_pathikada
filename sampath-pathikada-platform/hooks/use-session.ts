"use client";

import useSWR from "swr";

export interface SessionUser {
  id: string;
  name: string;
  nameSinhala: string | null;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "ECONOMIC_DEVELOPMENT_OFFICER" | "REGIONAL_SECRETARY";
  district: string | null;
  dsDivision: string | null;
  gnDivision: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load session");
  return json.data as SessionUser;
};

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<SessionUser>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return {
    user: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
