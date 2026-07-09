"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, MapPinned, ChevronLeft, Menu, LogOut, Sun, Moon,
  ChevronDown, ShieldCheck, Users, CalendarClock, ClipboardList, FileText, DatabaseZap,
} from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { useSession } from "@/hooks/use-session";
import { DIVISIONAL_SECRETARIATS, DISTRICTS } from "@/lib/registration-data";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY   = "#0E2B4E";
const NAVY2  = "#0B2240";
const GOLD   = "#BC9144";
const GOLD_L = "#D4A85A";
const GOLD_D = "#915F2F";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Division",
    items: [
      { href: "/admin/divisions", icon: MapPinned, label: "Division Summary" },
    ],
  },
  {
    label: "Team",
    items: [
      { href: "/admin/users", icon: Users, label: "Users" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/reporting-cycles", icon: CalendarClock, label: "Reporting Cycles" },
      { href: "/admin/form-config", icon: ClipboardList, label: "Form Config" },
      { href: "/admin/website-content", icon: FileText, label: "Website Content" },
      { href: "/admin/backups", icon: DatabaseZap, label: "Backups" },
    ],
  },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sp-theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("sp-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }, [router]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const pageLabel = pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "dashboard";

  const division = user?.dsDivision ? DIVISIONAL_SECRETARIATS.find((d) => d.id === user.dsDivision) : undefined;
  const district = division ? DISTRICTS.find((d) => d.id === division.districtId) : undefined;

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "hsl(var(--background))" }}>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-250 lg:hidden"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════ SIDEBAR ══════════════════════════════ */}
      <aside
        style={{
          width: collapsed ? 72 : 260,
          background: `linear-gradient(180deg, ${NAVY2} 0%, ${NAVY} 50%, ${NAVY2} 100%)`,
          transition: "width 300ms cubic-bezier(0.4,0,0.2,1)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
        className={[
          "fixed inset-y-0 left-0 z-260 flex flex-col border-r",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 lg:transition-none",
        ].join(" ")}
      >
        {/* Logo strip */}
        <div
          className="flex items-center gap-3 px-4 shrink-0"
          style={{ height: 64, borderBottom: "1px solid rgba(255,255,255,0.08)", justifyContent: collapsed ? "center" : undefined }}
        >
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GOLD_L} 0%, ${GOLD_D} 100%)`, boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
            >
              <ShieldCheck size={17} color="#fff" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2" style={{ background: "#34d399", borderColor: NAVY }} />
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white leading-tight truncate" style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}>
                Sampath Pathikada
              </p>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: GOLD }}>
                Admin
              </p>
            </div>
          )}

          <button
            onClick={() => setCollapsed((p) => !p)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0"
            style={{ marginLeft: collapsed ? 0 : "auto", color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft size={14} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 300ms" }} />
          </button>
        </div>

        {/* Division badge */}
        {!collapsed && division && (
          <div className="mx-3 mt-3 p-3 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Assigned Division</p>
            <p className="text-[13px] font-semibold text-white mt-0.5 truncate">{division.en}</p>
            <p className="text-[11px] truncate" style={{ color: GOLD_L }}>{district?.en} District</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5" style={{ scrollbarWidth: "none" }}>
          {NAV.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-4 mb-1.5 text-[10px] font-bold uppercase" style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.13em" }}>
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className="flex items-center gap-3 rounded-xl transition-all duration-200 relative"
                        style={{
                          padding: collapsed ? "10px 0" : "10px 12px",
                          justifyContent: collapsed ? "center" : undefined,
                          background: active
                            ? "linear-gradient(90deg,rgba(188,145,68,0.18) 0%,rgba(188,145,68,0.05) 100%)"
                            : "transparent",
                          color: active ? GOLD_L : "rgba(255,255,255,0.55)",
                        }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                        aria-current={active ? "page" : undefined}
                      >
                        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: GOLD }} />}
                        <item.icon size={18} style={{ color: active ? GOLD : "rgba(255,255,255,0.45)", flexShrink: 0 }} />
                        {!collapsed && <span className="text-[13.5px] font-medium truncate flex-1">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User strip */}
        <div className="shrink-0 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {collapsed ? (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm mx-auto cursor-pointer"
              style={{ background: `linear-gradient(135deg,${GOLD_L},${GOLD_D})` }}
              onClick={handleLogout}
              title="Sign Out"
            />
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg,${GOLD_L},${GOLD_D})` }}>
                {user ? initials(user.name) : "…"}
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-[12px] font-semibold text-white truncate">{user?.name ?? "…"}</p>
                <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.38)" }}>{user?.email ?? ""}</p>
              </div>
              <LogOut size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            </button>
          )}
        </div>
      </aside>

      {/* ══════════════════ MAIN AREA ════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300" style={{ marginLeft: collapsed ? 72 : 260 }}>
        <header
          className="sticky top-0 z-50 flex items-center gap-3 shrink-0 px-4 sm:px-6"
          style={{ height: 64, background: "hsl(var(--background)/0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid hsl(var(--border))" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "hsl(var(--foreground))" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-2">
            <ShieldCheck size={14} style={{ color: GOLD, flexShrink: 0 }} />
            <span className="text-xs font-medium hidden sm:inline" style={{ color: "hsl(var(--muted-foreground))" }}>Admin</span>
            <span className="text-xs hidden sm:inline" style={{ color: "hsl(var(--muted-foreground))" }}>/</span>
            <span className="text-sm font-bold capitalize truncate" style={{ color: "hsl(var(--foreground))" }}>{pageLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: "hsl(var(--muted-foreground))" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--muted))"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 pl-2 pr-2.5 h-9 rounded-xl transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: `linear-gradient(135deg,${GOLD_L},${GOLD_D})` }}>
                  {user ? initials(user.name) : "…"}
                </div>
                <span className="hidden sm:block text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{user?.name ?? "…"}</span>
                <ChevronDown size={12} style={{ color: "hsl(var(--muted-foreground))", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
              </button>

              {profileOpen && (
                <div
                  className="absolute z-50 rounded-2xl overflow-hidden right-0 w-56 mt-2"
                  style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)" }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    <p className="text-[12.5px] font-bold" style={{ color: "hsl(var(--foreground))" }}>{user?.name ?? "…"}</p>
                    <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{user?.email ?? ""}</p>
                    {division && (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: GOLD_D }}>{division.en}</p>
                    )}
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold transition-colors"
                      style={{ color: "#b91c1c" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(185,28,28,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {profileOpen && <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["ADMIN"]}>
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
