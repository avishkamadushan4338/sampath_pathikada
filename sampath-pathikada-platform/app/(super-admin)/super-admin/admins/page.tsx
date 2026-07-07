"use client";

import { useState } from "react";
import {
  Plus, Search, MoreVertical, Shield, ShieldOff, Trash2,
  Edit2, Mail, Phone, CheckCircle2, XCircle,
  Clock, X, Eye, EyeOff, Download, AlertTriangle,
} from "lucide-react";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";

type AdminStatus = "active" | "inactive" | "pending";
interface Admin {
  id: string; name: string; email: string; phone: string;
  role: "admin" | "super-admin"; status: AdminStatus;
  createdAt: string; lastLogin: string; assignedDistricts: string[];
}

const MOCK_ADMINS: Admin[] = [
  { id: "ADM-001", name: "Kamal Rajapaksha",  email: "kamal.r@sampath.lk",   phone: "0712345678", role: "admin",       status: "active",   createdAt: "2026-01-15", lastLogin: "2026-07-02 09:14", assignedDistricts: ["Galle"] },
  { id: "ADM-002", name: "Nimal Perera",       email: "nimal.p@sampath.lk",   phone: "0723456789", role: "admin",       status: "active",   createdAt: "2026-02-10", lastLogin: "2026-07-01 16:45", assignedDistricts: ["Matara"] },
  { id: "ADM-003", name: "Dilshan Fernando",   email: "dilshan.f@sampath.lk", phone: "0734567890", role: "admin",       status: "inactive", createdAt: "2026-03-05", lastLogin: "2026-06-10 11:22", assignedDistricts: ["Hambantota"] },
  { id: "ADM-004", name: "Sumudu Silva",       email: "sumudu.s@sampath.lk",  phone: "0745678901", role: "admin",       status: "pending",  createdAt: "2026-06-28", lastLogin: "Never",            assignedDistricts: [] },
  { id: "ADM-005", name: "Pradeep Jayasuriya", email: "pradeep.j@sampath.lk", phone: "0756789012", role: "admin",       status: "active",   createdAt: "2026-04-20", lastLogin: "2026-07-02 07:50", assignedDistricts: ["Galle", "Matara"] },
];

const STATUS_MAP: Record<AdminStatus, { bg: string; color: string; border: string; Icon: React.ElementType; label: string }> = {
  active:   { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", Icon: CheckCircle2, label: "Active"   },
  inactive: { bg: "#f3f4f6", color: "#374151", border: "#d1d5db", Icon: XCircle,      label: "Inactive" },
  pending:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a", Icon: Clock,        label: "Pending"  },
};

/* ── Create Admin Modal ───────────────────────────────────────── */
function CreateAdminModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Partial<Admin>) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div className="fixed inset-0 z-(--z-overlay) bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
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
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
            >
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
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
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(var(--foreground))")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div
              className="p-3 rounded-xl flex gap-2"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
            >
              <AlertTriangle size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px]" style={{ color: "#92400e" }}>
                The admin will receive an email invitation to set their permanent password.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 flex gap-3"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Cancel
            </button>
            <button
              onClick={() => { onCreate(form); onClose(); }}
              className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all"
              style={{
                background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
                boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,43,78,0.32)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,43,78,0.22)")}
            >
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
  const [admins, setAdmins] = useState<Admin[]>(MOCK_ADMINS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    return (!q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
      && (statusFilter === "all" || a.status === statusFilter);
  });

  const handleCreate = (data: Partial<Admin>) => {
    setAdmins(prev => [...prev, {
      id: `ADM-00${prev.length + 1}`,
      name: data.name || "",
      email: data.email || "",
      phone: (data as any).phone || "",
      role: "admin",
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: "Never",
      assignedDistricts: [],
    }]);
  };

  const toggleStatus = (id: string) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    setOpenMenu(null);
  };

  const deleteAdmin = (id: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
    setOpenMenu(null);
  };

  const statItems = [
    { label: "Total Admins",   value: admins.length,                                     color: "hsl(var(--foreground))" },
    { label: "Active",         value: admins.filter(a => a.status === "active").length,   color: "#065f46" },
    { label: "Inactive",       value: admins.filter(a => a.status === "inactive").length, color: "#374151" },
    { label: "Pending Invite", value: admins.filter(a => a.status === "pending").length,  color: "#b45309" },
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
            Manage administrator accounts and access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium rounded-xl transition-colors"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
            onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
            onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--card))")}
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
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,43,78,0.32)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,43,78,0.22)")}
          >
            <Plus size={16} /> Create Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
              {s.label}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ fontVariantNumeric: "tabular-nums", color: s.color }}>
              {s.value}
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
            placeholder="Search name, email, ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive", "pending"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-colors"
              style={statusFilter === s
                ? { background: NAVY, color: "#fff", border: "1px solid transparent" }
                : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
              }
            >
              {s === "all" ? "All" : s}
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
                {["Admin", "Contact", "Districts", "Status", "Last Login", "Created", ""].map(h => (
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
              {filtered.map((admin, idx) => {
                const st = STATUS_MAP[admin.status];
                return (
                  <tr
                    key={admin.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)` }}
                        >
                          {admin.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{admin.name}</p>
                          <p className="text-[11px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{admin.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Mail size={11} /> <span>{admin.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Phone size={11} /> <span>{admin.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Districts */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {admin.assignedDistricts.length === 0 ? (
                          <span className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>None</span>
                        ) : admin.assignedDistricts.map(d => (
                          <span
                            key={d}
                            className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: "rgba(14,43,78,0.08)", color: NAVY }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
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

                    {/* Last login */}
                    <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {admin.lastLogin}
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {admin.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenu(openMenu === admin.id ? null : admin.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
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
                                onClick={() => setOpenMenu(null)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition-colors text-left"
                                style={{ color: "hsl(var(--foreground))" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                <Edit2 size={13} /> Edit Details
                              </button>
                              <button
                                onClick={() => toggleStatus(admin.id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition-colors text-left"
                                style={{ color: "hsl(var(--foreground))" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                {admin.status === "active"
                                  ? <><ShieldOff size={13} /> Deactivate</>
                                  : <><Shield size={13} /> Activate</>
                                }
                              </button>
                              <div style={{ borderTop: "1px solid hsl(var(--border))", margin: "4px 0" }} />
                              <button
                                onClick={() => deleteAdmin(admin.id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition-colors text-left"
                                style={{ color: "#dc2626" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#fff1f2")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
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

      {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
