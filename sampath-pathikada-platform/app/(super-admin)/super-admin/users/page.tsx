"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search, Mail, Phone, CheckCircle2, XCircle, ShieldAlert,
  Users as UsersIcon, MapPin,
} from "lucide-react";
import { DISTRICTS, DIVISIONAL_SECRETARIATS } from "@/lib/registration-data";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY   = "#0E2B4E";
const NAVY2  = "#0B2240";
const GOLD   = "#BC9144";
const GOLD_D = "#915F2F";
const MAROON = "#66261E";
const GREEN  = "#2D7A51";

type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
type UserRole = "SUPER_ADMIN" | "ADMIN" | "ECONOMIC_DEVELOPMENT_OFFICER" | "DIVISIONAL_SECRETARIAT";

interface UserRow {
  id: string; name: string; email: string; phone: string | null;
  role: UserRole; status: UserStatus;
  district: string | null; dsDivision: string | null;
  createdAt: string; lastLoginAt: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as UserRow[];
};

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  ECONOMIC_DEVELOPMENT_OFFICER: "Economic Development Officer",
  DIVISIONAL_SECRETARIAT: "Divisional Secretariat",
};

const ROLE_COLOR: Record<UserRole, string> = {
  SUPER_ADMIN: GOLD_D,
  ADMIN: MAROON,
  ECONOMIC_DEVELOPMENT_OFFICER: NAVY,
  DIVISIONAL_SECRETARIAT: GREEN,
};

const STATUS_MAP: Record<UserStatus, { bg: string; color: string; border: string; Icon: React.ElementType; label: string }> = {
  ACTIVE:    { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", Icon: CheckCircle2, label: "Active"    },
  INACTIVE:  { bg: "#f3f4f6", color: "#374151", border: "#d1d5db", Icon: XCircle,      label: "Inactive"  },
  SUSPENDED: { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3", Icon: ShieldAlert,  label: "Suspended" },
};

function divisionLabel(dsDivision: string | null): { name: string; district: string } | null {
  if (!dsDivision) return null;
  const div = DIVISIONAL_SECRETARIATS.find((d) => d.id === dsDivision);
  if (!div) return null;
  const district = DISTRICTS.find((d) => d.id === div.districtId);
  return { name: div.en, district: district?.en ?? div.districtId };
}

const ROLE_FILTERS: (UserRole | "all")[] = ["all", "DIVISIONAL_SECRETARIAT", "ECONOMIC_DEVELOPMENT_OFFICER", "ADMIN", "SUPER_ADMIN"];

export default function UsersPage() {
  const { data: users, isLoading } = useSWR("/api/users", fetcher);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  const rows = users ?? [];

  const filtered = rows.filter((u) => {
    const q = search.toLowerCase();
    return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (roleFilter === "all" || u.role === roleFilter)
      && (statusFilter === "all" || u.status === statusFilter);
  });

  const statItems = [
    { label: "Total Users", value: rows.length, color: "hsl(var(--foreground))" },
    { label: "Divisional Secretariats", value: rows.filter((u) => u.role === "DIVISIONAL_SECRETARIAT").length, color: GREEN },
    { label: "Economic Development Officers", value: rows.filter((u) => u.role === "ECONOMIC_DEVELOPMENT_OFFICER").length, color: NAVY },
    { label: "Admins & Super Admins", value: rows.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length, color: GOLD_D },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
        >
          All Users
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Every account across all roles, in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
              {s.label}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ fontVariantNumeric: "tabular-nums", color: s.color }}>
              {isLoading ? "—" : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          className="h-10 px-3 rounded-xl text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>{r === "all" ? "All Roles" : ROLE_LABEL[r]}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {(["all", "ACTIVE", "INACTIVE", "SUSPENDED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-colors"
              style={statusFilter === s
                ? { background: NAVY, color: "#fff", border: "1px solid transparent" }
                : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
              }
            >
              {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
                {["User", "Contact", "Role", "Division", "Status", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <UsersIcon size={22} className="mx-auto mb-2 opacity-40" />
                    No users match these filters
                  </td>
                </tr>
              )}
              {filtered.map((u, idx) => {
                const st = STATUS_MAP[u.status];
                const division = divisionLabel(u.dsDivision);
                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: `linear-gradient(135deg, ${ROLE_COLOR[u.role]}, ${NAVY2})` }}
                        >
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{u.name}</p>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Mail size={11} /> <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                            <Phone size={11} /> <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: `${ROLE_COLOR[u.role]}1a`, color: ROLE_COLOR[u.role] }}
                      >
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>

                    {/* Division */}
                    <td className="px-5 py-3.5">
                      {division ? (
                        <div>
                          <p className="text-[12.5px] font-semibold" style={{ color: NAVY }}>{division.name}</p>
                          <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{division.district}</p>
                        </div>
                      ) : (
                        <span className="text-[12px] flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <MapPin size={11} /> None
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                        style={{ background: st.bg, color: st.color, borderColor: st.border }}
                      >
                        <st.Icon size={10} /> {st.label}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
