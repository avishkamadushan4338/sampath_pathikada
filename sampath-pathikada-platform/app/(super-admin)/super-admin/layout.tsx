"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, ShieldCheck, ScrollText,
  Settings, Database, ChevronLeft, Menu, Bell, LogOut, Sun, Moon,
  ChevronDown, Crown, Activity, AlertCircle, CheckCircle2, Clock, Zap, X,
  MapPinned,
} from "lucide-react";

/* ─── Brand tokens (raw hex so they work everywhere) ─────────────────────── */
const NAVY   = "#0E2B4E";
const NAVY2  = "#0B2240";
const GOLD   = "#BC9144";
const GOLD_L = "#D4A85A";
const GOLD_D = "#915F2F";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/super-admin/dashboard",        icon: LayoutDashboard, label: "Dashboard"          },
    ],
  },
  {
    label: "User Management",
    items: [
      { href: "/super-admin/registrations",    icon: UserCheck,       label: "Registrations",  badge: 12 },
      { href: "/super-admin/admins",           icon: Users,           label: "Admin Accounts"  },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/super-admin/divisions",        icon: MapPinned,       label: "Division Drill-Down" },
    ],
  },
  {
    label: "Control",
    items: [
      { href: "/super-admin/roles-permissions",icon: ShieldCheck,     label: "Roles & Permissions" },
      { href: "/super-admin/audit-logs",       icon: ScrollText,      label: "Audit Logs"      },
      { href: "/super-admin/backups",          icon: Database,        label: "Backups"         },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/super-admin/system-settings",  icon: Settings,        label: "System Settings" },
    ],
  },
];

const NOTIFS = [
  { id: 1, type: "pending", msg: "New registration from Galle GN Division",    time: "2m ago"  },
  { id: 2, type: "alert",   msg: "Failed login attempt detected",              time: "15m ago" },
  { id: 3, type: "success", msg: "Database backup completed",                  time: "1h ago"  },
  { id: 4, type: "pending", msg: "3 admin accounts awaiting approval",         time: "2h ago"  },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dark,         setDark]         = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  /* hydrate theme from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("sp-theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setDark(prev => {
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

  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  /* ── page label ── */
  const pageLabel =
    pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "dashboard";

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "hsl(var(--background))" }}>

      {/* ── Mobile overlay ─────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[250] lg:hidden"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════ SIDEBAR ══════════════════════════════ */}
      <aside
        style={{
          width:       collapsed ? 72 : 260,
          background:  `linear-gradient(180deg, ${NAVY2} 0%, ${NAVY} 50%, ${NAVY2} 100%)`,
          transition:  "width 300ms cubic-bezier(0.4,0,0.2,1)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
        className={[
          "fixed inset-y-0 left-0 z-260 flex flex-col border-r",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 lg:transition-none",
        ].join(" ")}
      >
        {/* ── Logo strip ── */}
        <div
          className="flex items-center gap-3 px-4 shrink-0"
          style={{
            height: 64,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            justifyContent: collapsed ? "center" : undefined,
          }}
        >
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${GOLD_L} 0%, ${GOLD_D} 100%)`,
                boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
              }}
            >
              <Crown size={17} color="#fff" />
            </div>
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
              style={{ background: "#34d399", borderColor: NAVY }}
            />
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p
                className="text-[13px] font-semibold text-white leading-tight truncate"
                style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}
              >
                Sampath Pathikada
              </p>
              <p
                className="text-[10px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: GOLD }}
              >
                Super Admin
              </p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(p => !p)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0"
            style={{ marginLeft: collapsed ? 0 : "auto", color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft
              size={14}
              style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 300ms" }}
            />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5" style={{ scrollbarWidth: "none" }}>
          {NAV.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p
                  className="px-4 mb-1.5 text-[10px] font-bold uppercase"
                  style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.13em" }}
                >
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5 px-2">
                {group.items.map(item => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className="flex items-center gap-3 rounded-xl transition-all duration-200 relative group"
                        style={{
                          padding:     collapsed ? "10px 0" : "10px 12px",
                          justifyContent: collapsed ? "center" : undefined,
                          background:  active
                            ? "linear-gradient(90deg,rgba(188,145,68,0.18) 0%,rgba(188,145,68,0.05) 100%)"
                            : "transparent",
                          color: active ? GOLD_L : "rgba(255,255,255,0.55)",
                        }}
                        onMouseEnter={e => {
                          if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                        }}
                        onMouseLeave={e => {
                          if (!active) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* active pill */}
                        {active && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                            style={{ background: GOLD }}
                          />
                        )}

                        <item.icon
                          size={18}
                          style={{ color: active ? GOLD : "rgba(255,255,255,0.45)", flexShrink: 0 }}
                        />

                        {!collapsed && (
                          <>
                            <span className="text-[13.5px] font-medium truncate flex-1">
                              {item.label}
                            </span>
                            {"badge" in item && item.badge ? (
                              <span
                                className="min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                                style={{ background: GOLD, color: NAVY }}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        )}

                        {collapsed && "badge" in item && item.badge ? (
                          <span
                            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                            style={{ background: GOLD }}
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── User strip ── */}
        <div
          className="shrink-0 p-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
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
              className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors group"
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: `linear-gradient(135deg,${GOLD_L},${GOLD_D})` }}
              >
                SA
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-[12px] font-semibold text-white truncate">Super Admin</p>
                <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.38)" }}>
                  superadmin@sampath.lk
                </p>
              </div>
              <LogOut size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            </button>
          )}
        </div>
      </aside>

      {/* ══════════════════ MAIN AREA ════════════════════════════ */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        {/* ── TOPBAR ──────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-50 flex items-center gap-3 shrink-0 px-4 sm:px-6"
          style={{
            height: 64,
            background: "hsl(var(--background)/0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid hsl(var(--border))",
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "hsl(var(--foreground))" }}
            onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Crown size={14} style={{ color: GOLD, flexShrink: 0 }} />
            <span
              className="text-xs font-medium hidden sm:inline"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Super Admin
            </span>
            <span className="text-xs hidden sm:inline" style={{ color: "hsl(var(--muted-foreground))" }}>
              /
            </span>
            <span
              className="text-sm font-bold capitalize truncate"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {pageLabel}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Theme */}
            <TopbarBtn onClick={toggleTheme} label="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </TopbarBtn>

            {/* Notifications */}
            <div className="relative">
              <TopbarBtn onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }} label="Notifications">
                <Bell size={16} />
                <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
                  style={{
                    background: GOLD,
                    borderColor: "hsl(var(--background))",
                  }}
                />
              </TopbarBtn>

              {notifOpen && (
                <Dropdown className="right-0 w-80 mt-2">
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: "1px solid hsl(var(--border))" }}
                  >
                    <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                      Notifications
                    </span>
                    <button
                      className="text-xs font-semibold"
                      style={{ color: GOLD_D }}
                      onClick={closeAll}
                    >
                      Mark all read
                    </button>
                  </div>
                  <ul>
                    {NOTIFS.map(n => (
                      <li
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                        style={{ borderBottom: "1px solid hsl(var(--border))" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span
                          className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background:
                              n.type === "pending" ? GOLD :
                              n.type === "alert"   ? "#66261E" : "#2D7A51",
                          }}
                        >
                          {n.type === "pending" && <Clock size={12} color="#fff" />}
                          {n.type === "alert"   && <AlertCircle size={12} color="#fff" />}
                          {n.type === "success" && <CheckCircle2 size={12} color="#fff" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-medium leading-snug" style={{ color: "hsl(var(--foreground))" }}>
                            {n.msg}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {n.time}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 text-center">
                    <button className="text-xs font-semibold" style={{ color: GOLD_D }}>
                      View all notifications
                    </button>
                  </div>
                </Dropdown>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-2.5 h-9 rounded-xl transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ background: `linear-gradient(135deg,${GOLD_L},${GOLD_D})` }}
                >
                  SA
                </div>
                <span
                  className="hidden sm:block text-[13px] font-semibold"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Super Admin
                </span>
                <ChevronDown
                  size={12}
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    transform: profileOpen ? "rotate(180deg)" : "none",
                    transition: "transform 200ms",
                  }}
                />
              </button>

              {profileOpen && (
                <Dropdown className="right-0 w-52 mt-2">
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid hsl(var(--border))" }}
                  >
                    <p className="text-[12.5px] font-bold" style={{ color: "hsl(var(--foreground))" }}>
                      Super Admin
                    </p>
                    <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      superadmin@sampath.lk
                    </p>
                  </div>
                  <ul className="py-1.5">
                    {[
                      { label: "Profile Settings", Icon: Settings  },
                      { label: "Activity Log",     Icon: Activity  },
                      { label: "System Status",    Icon: Zap       },
                    ].map(({ label, Icon }) => (
                      <li key={label}>
                        <button
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors"
                          style={{ color: "hsl(var(--foreground))" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <Icon size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div style={{ borderTop: "1px solid hsl(var(--border))", padding: "6px 0" }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold transition-colors"
                      style={{ color: "#b91c1c" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(185,28,28,0.06)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </Dropdown>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Click-away overlay */}
      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}
    </div>
  );
}

/* ── Shared micro-components ─────────────────────────────────────────────── */
function TopbarBtn({
  onClick, label, children,
}: {
  onClick: () => void; label: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
      style={{ color: "hsl(var(--muted-foreground))" }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "hsl(var(--muted))";
        e.currentTarget.style.color = "hsl(var(--foreground))";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "hsl(var(--muted-foreground))";
      }}
    >
      {children}
    </button>
  );
}

function Dropdown({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`absolute z-50 rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}
