"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Search, Mail, Phone, Users as UsersIcon,
  Landmark, Briefcase, Download,
} from "lucide-react";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";

const NAVY = "#0E2B4E";

type UserStatus = "ACTIVE" | "INACTIVE";
type UserRole = "DIVISIONAL_SECRETARIAT" | "ECONOMIC_DEVELOPMENT_OFFICER";

interface UserRow {
  id: string; name: string; email: string; phone: string | null;
  role: UserRole; status: UserStatus;
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
  return json.data as UserRow[];
};

const val = (v: string | null) => v || "—";

function districtLabel(id: string | null): string {
  if (!id) return "—";
  return DISTRICTS.find((d) => d.id === id)?.en ?? id;
}

function dsDivisionLabel(id: string | null): string {
  if (!id) return "—";
  return DIVISIONAL_SECRETARIATS.find((d) => d.id === id)?.en ?? id;
}

function gnDivisionLabel(id: string | null): string {
  if (!id) return "—";
  return GN_DIVISIONS.find((g) => g.id === id)?.en ?? id;
}

const ROLE_LABELS: Record<UserRole, string> = {
  DIVISIONAL_SECRETARIAT:       "Divisional Secretariat",
  ECONOMIC_DEVELOPMENT_OFFICER: "Economic Development Officer",
};

const CSV_HEADERS = [
  "Role", "Name", "Email", "Phone", "District", "Divisional Secretariat",
  "GN Division Name", "GN Division Number", "Designation",
  "Local Government Body", "Electoral / Polling Division", "Farmers' Service Center",
  "Education Zone", "Education Division", "Mahaweli Zone",
];

/** RFC 4180 — quotes/escapes any field containing a comma, quote, or newline. */
function escapeCsvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildUsersCsv(users: UserRow[]): string {
  const lines = [CSV_HEADERS.map(escapeCsvCell).join(",")];
  for (const u of users) {
    const isEdo = u.role === "ECONOMIC_DEVELOPMENT_OFFICER";
    const cells = [
      ROLE_LABELS[u.role],
      u.name,
      u.email,
      u.phone ?? "",
      districtLabel(u.district),
      dsDivisionLabel(u.dsDivision),
      isEdo ? gnDivisionLabel(u.gnDivision) : "",
      isEdo ? (u.gnDivision ?? "") : "",
      isEdo ? (u.officerDesignation ?? "") : "",
      isEdo ? (u.localGovt ?? "") : "",
      isEdo ? (u.electoral ?? "") : "",
      isEdo ? (u.farmers ?? "") : "",
      isEdo ? (u.eduZone ?? "") : "",
      isEdo ? (u.eduDiv ?? "") : "",
      isEdo ? (u.mahaweli ?? "") : "",
    ];
    lines.push(cells.map(escapeCsvCell).join(","));
  }
  return lines.join("\r\n");
}

function downloadUsersCsv(users: UserRow[]) {
  const csvText = buildUsersCsv(users);
  // UTF-8 BOM so Excel correctly detects encoding for Sinhala names/divisions.
  const blob = new Blob(["﻿", csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const { data: users, isLoading } = useSWR("/api/users", fetcher);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  const rows = users ?? [];

  const filtered = rows.filter((u) => {
    const q = search.toLowerCase();
    return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (statusFilter === "all" || u.status === statusFilter);
  });

  const dsRows  = filtered.filter((u) => u.role === "DIVISIONAL_SECRETARIAT");
  const edoRows = filtered.filter((u) => u.role === "ECONOMIC_DEVELOPMENT_OFFICER");

  const statItems = [
    { label: "Total Users",              value: rows.length,                                                       color: "hsl(var(--foreground))" },
    { label: "Divisional Secretariat",   value: rows.filter((u) => u.role === "DIVISIONAL_SECRETARIAT").length,     color: "#7c2d12" },
    { label: "Economic Dev. Officers",   value: rows.filter((u) => u.role === "ECONOMIC_DEVELOPMENT_OFFICER").length, color: NAVY },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
            <UsersIcon size={20} color="#fff" />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
            >
              Users
            </h1>
            <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              View-only directory of the Divisional Secretariat and Economic Development Officers in your division
            </p>
          </div>
        </div>
        <button
          onClick={() => downloadUsersCsv(filtered)}
          disabled={isLoading || filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-all self-start sm:self-auto disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
            boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
          }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
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
            className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "ACTIVE", "INACTIVE"] as const).map((s) => (
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

      {/* Divisional Secretariat */}
      <RoleSection
        title="Divisional Secretariat"
        subtitle="The officer responsible for your division"
        icon={Landmark}
        rows={dsRows}
        emptyText="No Divisional Secretariat has been assigned to your division yet."
        isLoading={isLoading}
      />

      {/* Economic Development Officers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--muted))" }}>
            <Briefcase size={15} style={{ color: NAVY }} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: "hsl(var(--foreground))" }}>Economic Development Officers</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              Full identification details for every officer assigned across your division&apos;s GN divisions
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
                  {[
                    "Officer Name", "GN Division Name", "GN Division Number", "Designation",
                    "District", "Divisional Secretariat", "Local Government Body",
                    "Electoral / Polling Division", "Farmers' Service Center",
                    "Education Zone", "Education Division", "Mahaweli Zone",
                    "Contact",
                  ].map((h) => (
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
                  <tr><td colSpan={13} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>Loading…</td></tr>
                )}
                {!isLoading && edoRows.length === 0 && (
                  <tr><td colSpan={13} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>No Economic Development Officers found for your division.</td></tr>
                )}
                {edoRows.map((user, idx) => {
                  return (
                    <tr
                      key={user.id}
                      style={{ borderBottom: idx < edoRows.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)` }}
                          >
                            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <Link href={`/admin/users/${user.id}`} className="text-[13px] font-semibold hover:underline whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>
                            {user.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{gnDivisionLabel(user.gnDivision)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.gnDivision)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.officerDesignation)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{districtLabel(user.district)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{dsDivisionLabel(user.dsDivision)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.localGovt)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.electoral)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.farmers)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.eduZone)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.eduDiv)}</td>
                      <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>{val(user.mahaweli)}</td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                            <Mail size={11} /> <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                            <Phone size={11} /> <span>{val(user.phone)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>
          Designation is entered by the officer inside their yearly submission and shows as "—" until they save the Identification section for the current cycle.
        </p>
      </div>
    </div>
  );
}

function RoleSection({
  title, subtitle, icon: Icon, rows, emptyText, isLoading,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  rows: UserRow[];
  emptyText: string;
  isLoading: boolean;
}) {
  const headers = ["Name", "Contact"];
  const colCount = headers.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--muted))" }}>
            <Icon size={15} style={{ color: NAVY }} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: "hsl(var(--foreground))" }}>{title}</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>{subtitle}</p>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
                {headers.map((h) => (
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
                <tr><td colSpan={colCount} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>Loading…</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={colCount} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>{emptyText}</td></tr>
              )}
              {rows.map((user, idx) => {
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: idx < rows.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)` }}
                        >
                          {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <Link href={`/admin/users/${user.id}`} className="text-[13px] font-semibold hover:underline" style={{ color: "hsl(var(--foreground))" }}>
                          {user.name}
                        </Link>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Mail size={11} /> <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Phone size={11} /> <span>{val(user.phone)}</span>
                        </div>
                      </div>
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
