"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, type SessionUser } from "@/hooks/use-session";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  allow: SessionUser["role"][];
  children: React.ReactNode;
}

/**
 * UI-level defense-in-depth check. Real route protection already happens in
 * middleware.ts (path-prefix + JWT validation); this only prevents a flash
 * of role-specific content if the client-side session turns out mismatched.
 */
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { user, isLoading, isError } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/auth/login");
    } else if (!isLoading && user && !allow.includes(user.role)) {
      router.replace("/auth/login");
    }
  }, [isLoading, isError, user, allow, router]);

  if (isLoading || !user || !allow.includes(user.role)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
