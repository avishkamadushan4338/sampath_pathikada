"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";

export default function NewAdminUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

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

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Failed to create user account.");
        return;
      }
      toast.success(`Account created for ${form.name}.`);
      router.push("/admin/users");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft size={14} /> Back to Users
      </Link>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        <div className="px-6 py-4" style={{ background: `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 100%)` }}>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}>
            New User
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
            This account will be assigned to your division automatically
          </p>
        </div>

        <div className="p-6 space-y-4">
          {[
            { key: "name",  label: "Full Name",    type: "text",  placeholder: "Full name"   },
            { key: "email", label: "Email Address", type: "email", placeholder: "name@sampath.lk" },
            { key: "phone", label: "Mobile Number", type: "tel",   placeholder: "07XXXXXXXX"  },
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
                className="w-full h-10 px-3.5 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
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
                className="w-full h-10 px-3.5 pr-10 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "hsl(var(--muted-foreground))" }}
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
              The user will be asked to reset this password on first login.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-[12.5px]" style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239" }}>
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
          <Link
            href="/admin/users"
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-center transition-colors"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            Cancel
          </Link>
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
  );
}
