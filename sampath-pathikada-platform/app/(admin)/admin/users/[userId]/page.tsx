"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Loader2, Shield, ShieldOff, Trash2, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";

interface UserDetail {
  id: string; name: string; email: string; phone: string | null;
  role: string; status: "ACTIVE" | "INACTIVE";
  district: string | null; dsDivision: string | null;
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
  const router = useRouter();
  // Reuse the scoped list endpoint and find the row — /api/users has no single-user
  // GET route, and this keeps the ADMIN division-scoping logic in exactly one place.
  const { data: users, isLoading, mutate } = useSWR("/api/users", fetcher);
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (name !== null) body.name = name;
      if (phone !== null) body.phone = phone;
      const res = await fetch(`/api/users/${user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message);
      toast.success("Changes saved.");
      mutate();
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    const nextStatus = user!.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/users/${user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message);
      toast.success(`${user!.name} is now ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`);
      mutate();
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function remove() {
    if (!confirm(`Delete the account for ${user!.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/users/${user!.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message);
      toast.success(`Deleted account for ${user!.name}.`);
      router.push("/admin/users");
    } catch {
      toast.error("Failed to delete account.");
    }
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
          <div>
            <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>Full Name</label>
            <input
              defaultValue={user.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>Mobile Number</label>
            <input
              defaultValue={user.phone ?? ""}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            <Phone size={11} />
            Joined {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {user.lastLoginAt && ` · Last login ${new Date(user.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
          </div>

          <button
            onClick={save}
            disabled={saving || (name === null && phone === null)}
            className="w-full py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)` }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>

        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
          <button
            onClick={toggleStatus}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            {user.status === "ACTIVE" ? <><ShieldOff size={14} /> Deactivate</> : <><Shield size={14} /> Activate</>}
          </button>
          <button
            onClick={remove}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
            style={{ border: "1px solid #fecdd3", color: "#dc2626" }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
