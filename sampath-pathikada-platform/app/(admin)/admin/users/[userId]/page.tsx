"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Loader2, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";

const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";

const ROLE_LABELS: Record<string, string> = {
  ADMIN:                         "Admin",
  DIVISIONAL_SECRETARIAT:        "Divisional Secretariat",
  ECONOMIC_DEVELOPMENT_OFFICER:  "Economic Development Officer",
};

const val = (v: string | null) => v || "—";

interface UserDetail {
  id: string; name: string; email: string; phone: string | null;
  role: string; status: "ACTIVE" | "INACTIVE";
  district: string | null; dsDivision: string | null; gnDivision: string | null;
  localGovt: string | null; electoral: string | null; farmers: string | null;
  eduZone: string | null; eduDiv: string | null; mahaweli: string | null;
  officerDesignation: string | null;
  createdAt: string; lastLoginAt: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as UserDetail[];
};

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  // Reuse the scoped list endpoint and find the row — /api/users has no single-user
  // GET route, and this keeps the ADMIN division-scoping logic in exactly one place.
  const { data: users, isLoading } = useSWR("/api/users", fetcher);

  const user = users?.find((u) => u.id === userId);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto space-y-4">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
          <ArrowLeft size={14} /> Back to Users
        </Link>
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <p className="text-[14px] font-semibold" style={{ color: "#92400e" }}>
            This user was not found, or is outside your division.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft size={14} /> Back to Users
      </Link>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 100%)` }}>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}>
              {user.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-[12px]" style={{ color: "rgba(255,255,255,0.7)" }}>
              <Mail size={11} /> {user.email}
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={user.status === "ACTIVE"
              ? { background: "rgba(52,211,153,0.18)", color: "#34d399" }
              : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }
            }
          >
            {user.status === "ACTIVE" ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            {user.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
            >
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
            {user.role === "ECONOMIC_DEVELOPMENT_OFFICER" && (
              <span className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                {GN_DIVISIONS.find((g) => g.id === user.gnDivision)?.en ?? user.gnDivision ?? "No GN division assigned"}
              </span>
            )}
          </div>

          <div>
            <p className="text-[12.5px] font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Full Name</p>
            <p className="text-[13.5px]" style={{ color: "hsl(var(--foreground))" }}>{user.name}</p>
          </div>

          <div>
            <p className="text-[12.5px] font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Mobile Number</p>
            <p className="text-[13.5px]" style={{ color: "hsl(var(--foreground))" }}>{user.phone || "—"}</p>
          </div>

          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            <Phone size={11} />
            Joined {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {user.lastLoginAt && ` · Last login ${new Date(user.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
          </div>

          {user.role === "ECONOMIC_DEVELOPMENT_OFFICER" && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4" style={{ borderColor: "hsl(var(--border))" }}>
              {[
                ["GN Division Name",             GN_DIVISIONS.find((g) => g.id === user.gnDivision)?.en ?? val(user.gnDivision)],
                ["GN Division Number",           val(user.gnDivision)],
                ["Designation",                  val(user.officerDesignation)],
                ["District",                     DISTRICTS.find((d) => d.id === user.district)?.en ?? val(user.district)],
                ["Divisional Secretariat",       DIVISIONAL_SECRETARIATS.find((d) => d.id === user.dsDivision)?.en ?? val(user.dsDivision)],
                ["Local Government Body",        val(user.localGovt)],
                ["Electoral / Polling Division", val(user.electoral)],
                ["Farmers' Service Center",      val(user.farmers)],
                ["Education Zone",               val(user.eduZone)],
                ["Education Division",           val(user.eduDiv)],
                ["Mahaweli Zone",                val(user.mahaweli)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11.5px] font-semibold mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
                  <p className="text-[13px]" style={{ color: "hsl(var(--foreground))" }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          <div
            className="p-3 rounded-xl text-[12px]"
            style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
          >
            This is a view-only record. Contact your Super Admin to update, activate/deactivate, or remove this account.
          </div>
        </div>
      </div>
    </div>
  );
}
