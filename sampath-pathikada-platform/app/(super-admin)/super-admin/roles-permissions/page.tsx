"use client";

import { useState } from "react";
import {
  ShieldCheck, Edit2, Save, X, Info, CheckSquare, Square,
} from "lucide-react";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";
const GOLD  = "#BC9144";
const GOLD_D = "#915F2F";
const GREEN = "#2D7A51";
const MAROON = "#66261E";

type Role = "economic-development-officer" | "regional-secretary" | "admin";

interface Permission { id: string; label: string; description: string; category: string; }
interface RoleConfig  { id: Role; label: string; labelSi: string; iconBg: string; userCount: number; permissions: string[]; }

const ALL_PERMISSIONS: Permission[] = [
  { id: "submission.create",  label: "Create Submission",   description: "Submit new resource profile data",   category: "Submissions" },
  { id: "submission.read",    label: "View Submissions",    description: "View own or assigned submissions",   category: "Submissions" },
  { id: "submission.update",  label: "Edit Submission",     description: "Edit draft submissions",             category: "Submissions" },
  { id: "submission.delete",  label: "Delete Submission",   description: "Delete own draft submissions",       category: "Submissions" },
  { id: "submission.approve", label: "Approve Submission",  description: "Approve or reject submissions",      category: "Submissions" },
  { id: "submission.export",  label: "Export Data",         description: "Export submission data to Excel/PDF",category: "Submissions" },
  { id: "user.read",          label: "View Users",          description: "View user profiles in system",       category: "Users"       },
  { id: "user.create",        label: "Create Users",        description: "Invite or create user accounts",     category: "Users"       },
  { id: "user.update",        label: "Update Users",        description: "Edit user profile details",          category: "Users"       },
  { id: "user.delete",        label: "Delete Users",        description: "Remove user accounts",               category: "Users"       },
  { id: "analytics.read",     label: "View Analytics",      description: "Access reports and dashboards",      category: "Analytics"   },
  { id: "analytics.export",   label: "Export Analytics",    description: "Export analytics reports",           category: "Analytics"   },
  { id: "system.settings",    label: "System Settings",     description: "Modify global system configuration", category: "System"      },
  { id: "system.backup",      label: "Manage Backups",      description: "Create and restore database backups",category: "System"      },
  { id: "system.audit",       label: "View Audit Logs",     description: "Access complete audit trail",        category: "System"      },
  { id: "system.roles",       label: "Manage Roles",        description: "Edit role permissions",              category: "System"      },
];

const ROLE_CONFIGS: RoleConfig[] = [
  { id: "economic-development-officer", label: "Economic Development Officer", labelSi: "ආර්ථික සංවර්ධන නිලධාරී", iconBg: NAVY,   userCount: 312, permissions: ["submission.create","submission.read","submission.update"] },
  { id: "regional-secretary", label: "Regional Secretary",  labelSi: "ප්‍රාදේශීය ලේකම්",        iconBg: MAROON, userCount: 28,  permissions: ["submission.read","submission.approve","submission.export","analytics.read","analytics.export","user.read"] },
  { id: "admin",              label: "Admin",               labelSi: "පරිපාලක",                   iconBg: GREEN,  userCount: 12,  permissions: ["submission.read","submission.approve","submission.export","user.read","user.create","user.update","analytics.read","analytics.export","system.audit"] },
];

const CATEGORIES = [...new Set(ALL_PERMISSIONS.map(p => p.category))];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleConfig[]>(ROLE_CONFIGS);
  const [selectedRole, setSelectedRole] = useState<Role>("economic-development-officer");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);

  const current = roles.find(r => r.id === selectedRole)!;

  const startEdit  = () => { setDraft([...current.permissions]); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setDraft([]); };
  const saveEdit   = () => {
    setRoles(prev => prev.map(r => r.id === selectedRole ? { ...r, permissions: draft } : r));
    setEditing(false); setDraft([]);
  };
  const toggle = (id: string) => setDraft(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const activePerms = editing ? draft : current.permissions;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            Roles &amp; Permissions
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Define what each role can access and perform
          </p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold rounded-xl transition-colors"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
              onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--card))")}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={saveEdit}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ background: GREEN, boxShadow: "0 2px 8px rgba(45,122,81,0.30)" }}
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-all"
            style={{
              background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
              boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,43,78,0.32)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,43,78,0.22)")}
          >
            <Edit2 size={14} /> Edit Permissions
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Role selector ── */}
        <div className="lg:col-span-1 space-y-2">
          <p
            className="text-[11.5px] font-bold uppercase tracking-wider mb-3"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Select Role
          </p>
          {roles.map(role => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => { setSelectedRole(role.id); setEditing(false); setDraft([]); }}
                className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                style={isSelected
                  ? {
                      border: `1px solid ${GOLD}`,
                      background: "rgba(188,145,68,0.07)",
                      boxShadow: "0 2px 8px rgba(188,145,68,0.12)",
                    }
                  : { border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }
                }
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "hsl(var(--card))"; }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: role.iconBg }}
                >
                  <ShieldCheck size={16} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold truncate" style={{ color: "hsl(var(--foreground))" }}>
                    {role.label}
                  </p>
                  <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {role.userCount} users
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-bold" style={{ fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>
                    {role.permissions.length}
                  </p>
                  <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>perms</p>
                </div>
              </button>
            );
          })}

          {/* Info panel — inline style instead of bg-[hsl(var(--accent)/0.08)] */}
          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: "rgba(188,145,68,0.06)",
              border: "1px solid rgba(188,145,68,0.20)",
            }}
          >
            <div className="flex gap-2">
              <Info size={14} style={{ color: GOLD_D, flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                Changes apply immediately to all users with this role. Super Admin always retains full access.
              </p>
            </div>
          </div>
        </div>

        {/* ── Permissions grid ── */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          {/* Grid header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}
          >
            <div>
              <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>
                {current.label} Permissions
              </h2>
              <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                {activePerms.length} of {ALL_PERMISSIONS.length} permissions enabled
              </p>
            </div>
            {editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setDraft(ALL_PERMISSIONS.map(p => p.id))}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                  style={{ background: "rgba(14,43,78,0.08)", color: NAVY }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,43,78,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,43,78,0.08)")}
                >
                  Select All
                </button>
                <button
                  onClick={() => setDraft([])}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                  style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="p-5 space-y-5">
            {CATEGORIES.map(cat => {
              const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
              const enabledInCat = catPerms.filter(p => activePerms.includes(p.id)).length;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {cat}
                    </h3>
                    <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      ({enabledInCat}/{catPerms.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catPerms.map(perm => {
                      const enabled = activePerms.includes(perm.id);
                      return (
                        <button
                          key={perm.id}
                          onClick={() => editing && toggle(perm.id)}
                          disabled={!editing}
                          className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
                          style={enabled
                            ? {
                                border: "1px solid rgba(188,145,68,0.35)",
                                background: "rgba(188,145,68,0.06)",
                                cursor: editing ? "pointer" : "default",
                              }
                            : {
                                border: "1px solid hsl(var(--border))",
                                background: "transparent",
                                opacity: 0.6,
                                cursor: editing ? "pointer" : "default",
                              }
                          }
                          onMouseEnter={e => { if (editing) e.currentTarget.style.opacity = "1"; }}
                          onMouseLeave={e => { if (editing && !enabled) e.currentTarget.style.opacity = "0.6"; }}
                        >
                          <div className="mt-0.5 shrink-0">
                            {enabled
                              ? <CheckSquare size={15} style={{ color: GOLD_D }} />
                              : <Square size={15} style={{ color: "hsl(var(--muted-foreground))" }} />
                            }
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-[13px] font-semibold leading-tight"
                              style={{ color: enabled ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                            >
                              {perm.label}
                            </p>
                            <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "hsl(var(--muted-foreground))" }}>
                              {perm.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
