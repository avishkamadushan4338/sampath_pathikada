"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Plus, Search, MoreVertical, Shield, ShieldOff, Trash2,
  Mail, Phone, CheckCircle2, XCircle,
  Clock, X, Eye, EyeOff, Download, AlertTriangle, MapPin, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { DISTRICTS, DIVISIONAL_SECRETARIATS } from "@/lib/registration-data";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";

type AdminStatus = "ACTIVE" | "INACTIVE";
interface AdminRow {
  id: string; name: string; email: string; phone: string | null;
  role: string; status: AdminStatus;
  district: string | null; dsDivision: string | null;
  createdAt: string; lastLoginAt: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json.data as AdminRow[];
};

const STATUS_MAP: Record<AdminStatus, { bg: string; color: string; border: string; Icon: React.ElementType; label: string }> = {
  ACTIVE:   { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", Icon: CheckCircle2, label: "Active"   },
  INACTIVE: { bg: "#f3f4f6", color: "#374151", border: "#d1d5db", Icon: XCircle,      label: "Inactive" },
};

function divisionLabel(dsDivision: string | null): { name: string; district: string } | null {
  if (!dsDivision) return null;
  const div = DIVISIONAL_SECRETARIATS.find((d) => d.id === dsDivision);
  if (!div) return null;
  const district = DISTRICTS.find((d) => d.id === div.districtId);
  return { name: div.en, district: district?.en ?? div.districtId };
}

/* ── Create Admin Modal ───────────────────────────────────────── */
function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", dsDivision: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [districtFilter, setDistrictFilter] = useState<string>(DISTRICTS[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const divisionsInDistrict = useMemo(
    () => DIVISIONAL_SECRETARIATS.filter((d) => d.districtId === districtFilter),
    [districtFilter]
  );

  async function handleSubmit() {
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.dsDivision) {
      setError("Please select the division this admin will be assigned to.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Failed to create admin account.");
        return;
      }
      toast.success(`Admin account created for ${form.name}.`);
      onCreated();
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-(--z-overlay) bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ background: `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 100%)` }}
          >
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}
            >
              Create Admin Account
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.10)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
            >
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4 overflow-y-auto">
            {[
              { key: "name",  label: "Full Name",     type: "text",  placeholder: "Admin full name"  },
              { key: "email", label: "Email Address",  type: "email", placeholder: "admin@sampath.lk" },
              { key: "phone", label: "Mobile Number",  type: "tel",   placeholder: "07XXXXXXXX"       },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full h-10 px-3.5 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  style={{
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--input))",
                    color: "hsl(var(--foreground))",
                  }}
                />
              </div>
            ))}

            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                Temporary Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 8 characters"
                  className="w-full h-10 px-3.5 pr-10 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  style={{
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--input))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Division assignment — exactly one division, this is the scope the admin will see data for */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => { setDistrictFilter(e.target.value); setForm((p) => ({ ...p, dsDivision: "" })); }}
                  className="w-full h-10 px-3 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
                >
                  {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.en}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  Division <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  value={form.dsDivision}
                  onChange={(e) => setForm((p) => ({ ...p, dsDivision: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
                >
                  <option value="">Select division…</option>
                  {divisionsInDistrict.map((d) => <option key={d.id} value={d.id}>{d.en}</option>)}
                </select>
              </div>
            </div>

            <div
              className="p-3 rounded-xl flex gap-2"
              style={{ background: "rgba(14,43,78,0.06)", border: "1px solid rgba(14,43,78,0.15)" }}
            >
              <MapPin size={14} style={{ color: NAVY, flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                This admin will only be able to view data summaries for the selected division.
              </p>
            </div>

            <div
              className="p-3 rounded-xl flex gap-2"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
            >
              <AlertTriangle size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px]" style={{ color: "#92400e" }}>
                The admin will be asked to reset this password on first login.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-[12.5px]" style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239" }}>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 flex gap-3 shrink-0"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{
                background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
                boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
              }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Create Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function AdminsPage() {
  const { data: admins, isLoading, mutate } = useSWR("/api/users?role=admin", fetcher);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = admins ?? [];

  const filtered = rows.filter((a) => {
    const q = search.toLowerCase();
    return (!q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
      && (statusFilter === "all" || a.status === statusFilter);
  });

  async function toggleStatus(admin: AdminRow) {
    setOpenMenu(null);
    setBusyId(admin.id);
    try {
      const nextStatus = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await fetch(`/api/users/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message);
      toast.success(`${admin.name} is now ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`);
      mutate();
    } catch {
      toast.error("Failed to update admin status.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAdmin(admin: AdminRow) {
    setOpenMenu(null);
    if (!confirm(`Delete the admin account for ${admin.name}? This cannot be undone.`)) return;
    setBusyId(admin.id);
    try {
      const res = await fetch(`/api/users/${admin.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message);
      toast.success(`Deleted admin account for ${admin.name}.`);
      mutate();
    } catch {
      toast.error("Failed to delete admin account.");
    } finally {
      setBusyId(null);
    }
  }

  const statItems = [
    { label: "Total Admins", value: rows.length, color: "hsl(var(--foreground))" },
    { label: "Active",       value: rows.filter((a) => a.status === "ACTIVE").length,   color: "#065f46" },
    { label: "Inactive",     value: rows.filter((a) => a.status === "INACTIVE").length, color: "#374151" },
    { label: "Divisions Covered", value: new Set(rows.map((a) => a.dsDivision).filter(Boolean)).size, color: NAVY },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            Admin Accounts
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Nominate division-scoped admins who can view data summaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium rounded-xl transition-colors"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--card))")}
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-all"
            style={{
              background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
              boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,43,78,0.32)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,43,78,0.22)")}
          >
            <Plus size={16} /> Create Admin
          </button>
        </div>
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
                {["Admin", "Contact", "Division", "Status", "Created", ""].map((h) => (
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
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>No admin accounts yet</td></tr>
              )}
              {filtered.map((admin, idx) => {
                const st = STATUS_MAP[admin.status];
                const division = divisionLabel(admin.dsDivision);
                return (
                  <tr
                    key={admin.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid hsl(var(--border))" : undefined, opacity: busyId === admin.id ? 0.5 : 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)` }}
                        >
                          {admin.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{admin.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Mail size={11} /> <span>{admin.email}</span>
                        </div>
                        {admin.phone && (
                          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                            <Phone size={11} /> <span>{admin.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Division */}
                    <td className="px-5 py-3.5">
                      {division ? (
                        <div>
                          <p className="text-[12.5px] font-semibold" style={{ color: NAVY }}>{division.name}</p>
                          <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{division.district}</p>
                        </div>
                      ) : (
                        <span className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>None</span>
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

                    {/* Created */}
                    <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {new Date(admin.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenu(openMenu === admin.id ? null : admin.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <MoreVertical size={15} />
                        </button>

                        {openMenu === admin.id && (
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
                                onClick={() => toggleStatus(admin)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition-colors text-left"
                                style={{ color: "hsl(var(--foreground))" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                {admin.status === "ACTIVE"
                                  ? <><ShieldOff size={13} /> Deactivate</>
                                  : <><Shield size={13} /> Activate</>
                                }
                              </button>
                              <div style={{ borderTop: "1px solid hsl(var(--border))", margin: "4px 0" }} />
                              <button
                                onClick={() => deleteAdmin(admin)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition-colors text-left"
                                style={{ color: "#dc2626" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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

      {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} onCreated={() => mutate()} />}
    </div>
  );
}
