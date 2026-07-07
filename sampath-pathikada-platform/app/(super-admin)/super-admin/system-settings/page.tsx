"use client";

import { useState } from "react";
import {
  Save, RefreshCw, Shield, Bell, Globe, Database,
  AlertTriangle, CheckCircle2, ChevronRight,
} from "lucide-react";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";
const GREEN = "#2D7A51";

interface SettingSection { id: string; label: string; icon: React.ElementType; description: string; }

const SECTIONS: SettingSection[] = [
  { id: "general",       label: "General",       icon: Globe,    description: "Platform name, language, and locale settings" },
  { id: "security",      label: "Security",      icon: Shield,   description: "Session, password policy, and 2FA settings"  },
  { id: "notifications", label: "Notifications", icon: Bell,     description: "Email alerts and system notifications"        },
  { id: "maintenance",   label: "Maintenance",   icon: Database, description: "Backup schedule, DB and cache management"     },
];

/* ── Toggle ──────────────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className="relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2"
      style={{ background: on ? GREEN : "hsl(var(--muted))" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

/* ── Field row ───────────────────────────────────────────────── */
function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4"
      style={{ borderBottom: "1px solid hsl(var(--border))" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{label}</p>
        {description && (
          <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ── Text Input ──────────────────────────────────────────────── */
function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-3.5 min-w-50 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
      style={{
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--input))",
        color: "hsl(var(--foreground))",
      }}
    />
  );
}

/* ── Select ──────────────────────────────────────────────────── */
function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] appearance-none"
        style={{
          border: "1px solid hsl(var(--border))",
          background: "hsl(var(--input))",
          color: "hsl(var(--foreground))",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronRight
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none"
        style={{ color: "hsl(var(--muted-foreground))" }}
      />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function SystemSettingsPage() {
  const [active, setActive]   = useState("general");
  const [saved, setSaved]     = useState(false);

  // General
  const [platformName,    setPlatformName]    = useState("Sampath Pathikada");
  const [platformNameSi,  setPlatformNameSi]  = useState("සම්පත් පැතිකඩ");
  const [defaultLang,     setDefaultLang]     = useState("si");
  const [timezone,        setTimezone]        = useState("Asia/Colombo");
  const [dateFormat,      setDateFormat]      = useState("DD/MM/YYYY");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security
  const [sessionTimeout,          setSessionTimeout]          = useState("30");
  const [maxLoginAttempts,        setMaxLoginAttempts]        = useState("5");
  const [lockoutDuration,         setLockoutDuration]         = useState("15");
  const [requireTwoFactor,        setRequireTwoFactor]        = useState(false);
  const [passwordMinLength,       setPasswordMinLength]       = useState("8");
  const [forcePasswordReset,      setForcePasswordReset]      = useState(true);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  const [requireEmailVerification,setRequireEmailVerification]= useState(true);

  // Notifications
  const [emailOnRegistration, setEmailOnRegistration] = useState(true);
  const [emailOnApproval,     setEmailOnApproval]     = useState(true);
  const [emailOnRejection,    setEmailOnRejection]    = useState(true);
  const [emailOnFailedLogin,  setEmailOnFailedLogin]  = useState(true);
  const [adminEmail,          setAdminEmail]          = useState("admin@sampath.lk");
  const [smtpHost,            setSmtpHost]            = useState("smtp.gmail.com");
  const [smtpPort,            setSmtpPort]            = useState("587");

  // Maintenance
  const [autoBackup,       setAutoBackup]       = useState(true);
  const [backupFrequency,  setBackupFrequency]  = useState("daily");
  const [backupRetention,  setBackupRetention]  = useState("30");
  const [cacheEnabled,     setCacheEnabled]     = useState(true);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const currentSection = SECTIONS.find(s => s.id === active)!;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            System Settings
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Configure global platform behaviour and security
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold"
              style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46" }}
            >
              <CheckCircle2 size={14} /> Changes saved
            </div>
          )}
          <button
            className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium rounded-xl transition-colors"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
            onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
            onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--card))")}
          >
            <RefreshCw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-all"
            style={{
              background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`,
              boxShadow: "0 2px 8px rgba(14,43,78,0.22)",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,43,78,0.32)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,43,78,0.22)")}
          >
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>

      {/* Maintenance mode banner */}
      {maintenanceMode && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <AlertTriangle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#92400e" }}>Maintenance Mode is ON</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#b45309" }}>
              Regular users cannot access the platform. Only super admins can log in.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* ── Sidebar nav ── */}
        <div className="lg:col-span-1">
          <nav
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          >
            {SECTIONS.map((s, idx) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                  style={{
                    borderBottom: idx < SECTIONS.length - 1 ? "1px solid hsl(var(--border))" : undefined,
                    background: isActive ? "rgba(14,43,78,0.06)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={isActive
                      ? { background: NAVY, color: "#fff" }
                      : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
                    }
                  >
                    <s.icon size={15} />
                  </div>
                  <p className="text-[13px] font-semibold flex-1 truncate" style={{ color: "hsl(var(--foreground))" }}>
                    {s.label}
                  </p>
                  <ChevronRight
                    size={13}
                    className="ml-auto transition-transform"
                    style={{
                      color: "hsl(var(--muted-foreground))",
                      transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Settings content ── */}
        <div
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          {/* Section header — inline style instead of bg-[hsl(var(--background)/0.5)] */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: NAVY, color: "#fff" }}
            >
              <currentSection.icon size={15} />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>
                {currentSection.label}
              </h2>
              <p className="text-[11.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                {currentSection.description}
              </p>
            </div>
          </div>

          <div className="px-5 py-2">

            {/* ── General ── */}
            {active === "general" && (<>
              <Field label="Platform Name (English)" description="Displayed in browser title and emails">
                <TextInput value={platformName} onChange={setPlatformName} />
              </Field>
              <Field label="Platform Name (Sinhala)" description="Displayed in Sinhala UI mode">
                <TextInput value={platformNameSi} onChange={setPlatformNameSi} />
              </Field>
              <Field label="Default Language" description="Language shown to new users on first visit">
                <Select value={defaultLang} onChange={setDefaultLang} options={[
                  { value: "si", label: "Sinhala (සිංහල)" },
                  { value: "en", label: "English" },
                ]} />
              </Field>
              <Field label="Time Zone" description="Used for timestamps and scheduled tasks">
                <Select value={timezone} onChange={setTimezone} options={[
                  { value: "Asia/Colombo", label: "Asia/Colombo (IST +5:30)" },
                  { value: "UTC",          label: "UTC" },
                ]} />
              </Field>
              <Field label="Date Format" description="Display format for all dates across the platform">
                <Select value={dateFormat} onChange={setDateFormat} options={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                ]} />
              </Field>
              <Field label="Maintenance Mode" description="Temporarily blocks regular user access for system updates">
                <Toggle on={maintenanceMode} onChange={setMaintenanceMode} />
              </Field>
            </>)}

            {/* ── Security ── */}
            {active === "security" && (<>
              <Field label="Session Timeout (minutes)" description="Users are automatically logged out after this period of inactivity">
                <TextInput value={sessionTimeout} onChange={setSessionTimeout} type="number" placeholder="30" />
              </Field>
              <Field label="Max Login Attempts" description="Account is locked after this many consecutive failed attempts">
                <TextInput value={maxLoginAttempts} onChange={setMaxLoginAttempts} type="number" placeholder="5" />
              </Field>
              <Field label="Account Lockout Duration (minutes)" description="How long an account stays locked after too many failed attempts">
                <TextInput value={lockoutDuration} onChange={setLockoutDuration} type="number" placeholder="15" />
              </Field>
              <Field label="Minimum Password Length" description="Users cannot set passwords shorter than this">
                <TextInput value={passwordMinLength} onChange={setPasswordMinLength} type="number" placeholder="8" />
              </Field>
              <Field label="Require Two-Factor Authentication" description="Force all admins to set up 2FA on next login">
                <Toggle on={requireTwoFactor} onChange={setRequireTwoFactor} />
              </Field>
              <Field label="Force Password Reset on First Login" description="New users must change their temporary password">
                <Toggle on={forcePasswordReset} onChange={setForcePasswordReset} />
              </Field>
              <Field label="Allow Public Registration" description="Allow new users to submit registration requests">
                <Toggle on={allowPublicRegistration} onChange={setAllowPublicRegistration} />
              </Field>
              <Field label="Require Email Verification" description="Users must verify their email before their registration is reviewed">
                <Toggle on={requireEmailVerification} onChange={setRequireEmailVerification} />
              </Field>
            </>)}

            {/* ── Notifications ── */}
            {active === "notifications" && (<>
              <Field label="Admin Email Address" description="System alerts and reports are sent to this address">
                <TextInput value={adminEmail} onChange={setAdminEmail} type="email" placeholder="admin@sampath.lk" />
              </Field>
              <Field label="SMTP Host" description="Outgoing email server hostname">
                <TextInput value={smtpHost} onChange={setSmtpHost} placeholder="smtp.gmail.com" />
              </Field>
              <Field label="SMTP Port" description="Standard: 587 (STARTTLS) or 465 (SSL)">
                <TextInput value={smtpPort} onChange={setSmtpPort} type="number" placeholder="587" />
              </Field>
              <Field label="Email on New Registration" description="Notify admin when a new registration is submitted">
                <Toggle on={emailOnRegistration} onChange={setEmailOnRegistration} />
              </Field>
              <Field label="Email on Registration Approved" description="Notify applicant when their registration is approved">
                <Toggle on={emailOnApproval} onChange={setEmailOnApproval} />
              </Field>
              <Field label="Email on Registration Rejected" description="Notify applicant when their registration is rejected">
                <Toggle on={emailOnRejection} onChange={setEmailOnRejection} />
              </Field>
              <Field label="Email on Failed Login Attempt" description="Alert admin when repeated failed logins are detected">
                <Toggle on={emailOnFailedLogin} onChange={setEmailOnFailedLogin} />
              </Field>
            </>)}

            {/* ── Maintenance ── */}
            {active === "maintenance" && (<>
              <Field label="Automatic Backups" description="Schedule regular database backups automatically">
                <Toggle on={autoBackup} onChange={setAutoBackup} />
              </Field>
              <Field label="Backup Frequency" description="How often the system should create a backup">
                <Select value={backupFrequency} onChange={setBackupFrequency} options={[
                  { value: "hourly",  label: "Hourly"  },
                  { value: "daily",   label: "Daily"   },
                  { value: "weekly",  label: "Weekly"  },
                  { value: "monthly", label: "Monthly" },
                ]} />
              </Field>
              <Field label="Backup Retention (days)" description="Automatically delete backups older than this many days">
                <TextInput value={backupRetention} onChange={setBackupRetention} type="number" placeholder="30" />
              </Field>
              <Field label="Enable Caching" description="Cache API responses and rendered pages for better performance">
                <Toggle on={cacheEnabled} onChange={setCacheEnabled} />
              </Field>

              {/* Danger zone */}
              <div
                className="mt-6 mb-2 rounded-xl p-4"
                style={{ border: "1px solid #fecdd3", background: "#fff1f2" }}
              >
                <p className="text-[13px] font-bold mb-3" style={{ color: "#9f1239" }}>Danger Zone</p>
                <div className="space-y-2">
                  {[
                    { label: "Clear Application Cache",      desc: "Flushes all cached data. May cause temporary slowness."      },
                    { label: "Reset All Settings to Default", desc: "Restores all settings to factory defaults. Cannot be undone." },
                  ].map(a => (
                    <div
                      key={a.label}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg"
                      style={{ background: "#fff", border: "1px solid #fecdd3" }}
                    >
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: "#9f1239" }}>{a.label}</p>
                        <p className="text-[11.5px]" style={{ color: "#dc2626" }}>{a.desc}</p>
                      </div>
                      <button
                        className="px-3 py-1.5 rounded-lg text-[12px] font-bold shrink-0 transition-colors"
                        style={{ border: "1px solid #fca5a5", color: "#9f1239", background: "transparent" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fff1f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>)}

          </div>
        </div>
      </div>
    </div>
  );
}
