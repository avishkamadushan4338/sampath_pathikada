"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Plus, Search, MoreVertical, Shield, ShieldOff, Trash2,
  Mail, Phone, CheckCircle2, XCircle, Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

const NAVY = "#0E2B4E";

type UserStatus = "ACTIVE" | "INACTIVE";
interface UserRow {
  id: string; name: string; email: string; phone: string | null;
  role: string; status: UserStatus;
  district: string | null; dsDivision: string | null;
  createdAt: string; lastLoginAt: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as UserRow[];
};

const STATUS_MAP: Record<UserStatus, { bg: string; color: string; border: string; Icon: React.ElementType; label: string }> = {
  ACTIVE:   { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", Icon: CheckCircle2, label: "Active"   },
  INACTIVE: { bg: "#f3f4f6", color: "#374151", border: "#d1d5db", Icon: XCircle,      label: "Inactive" },
};

export default function AdminUsersPage() {
  const { data: users, isLoading, mutate } = useSWR("/api/users", fetcher);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = users ?? [];

  const filtered = rows.filter((u) => {
    const q = search.toLowerCase();
    return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (statusFilter === "all" || u.status === statusFilter);
  });

  async function toggleStatus(user: UserRow) {
    setOpenMenu(null);
    setBusyId(user.id);
    try {
      const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message);
      toast.success(`${user.name} is now ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`);
      mutate();
    } catch {
      toast.error("Failed to update user status.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(user: UserRow) {
    setOpenMenu(null);
    if (!confirm(`Delete the account for ${user.name}? This cannot be undone.`)) return;
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message);
      toast.success(`Deleted account for ${user.name}.`);
      mutate();
    } catch {
      toast.error("Failed to delete account.");
    } finally {
      setBusyId(null);
    }
  }

  const statItems = [
    { label: "Total Users", value: rows.length, color: "hsl(var(--foreground))" },
    { label: "Active",      value: rows.filter((u) => u.status === "ACTIVE").length,   color: "#065f46" },
    { label: "Inactive",    value: rows.filter((u) => u.status === "INACTIVE").length, color: "#374151" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

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
              Accounts within your assigned division
            </p>
          </div>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-all self-start sm:self-auto"
          style={{
            background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
            boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
          }}
        >
          <Plus size={16} /> New User
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
                {["User", "Contact", "Status", "Created", ""].map((h) => (
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
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>No users yet</td></tr>
              )}
              {filtered.map((user, idx) => {
                const st = STATUS_MAP[user.status];
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid hsl(var(--border))" : undefined, opacity: busyId === user.id ? 0.5 : 1 }}
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
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                            <Phone size={11} /> <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                        style={{ background: st.bg, color: st.color, borderColor: st.border }}
                      >
                        <st.Icon size={10} /> {st.label}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          <MoreVertical size={15} />
                        </button>

                        {openMenu === user.id && (
                          <>
                            <div className="fixed inset-0 z-(--z-overlay)" onClick={() => setOpenMenu(null)} />
                            <div
                              className="absolute right-0 top-full mt-1 z-(--z-popover) w-44 rounded-xl overflow-hidden"
                              style={{
                                border: "1px solid hsl(var(--border))",
                                background: "hsl(var(--background))",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                              }}
                            >
                              <button
                                onClick={() => toggleStatus(user)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition-colors text-left"
                                style={{ color: "hsl(var(--foreground))" }}
                              >
                                {user.status === "ACTIVE"
                                  ? <><ShieldOff size={13} /> Deactivate</>
                                  : <><Shield size={13} /> Activate</>
                                }
                              </button>
                              <div style={{ borderTop: "1px solid hsl(var(--border))", margin: "4px 0" }} />
                              <button
                                onClick={() => deleteUser(user)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition-colors text-left"
                                style={{ color: "#dc2626" }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </>
                        )}
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
