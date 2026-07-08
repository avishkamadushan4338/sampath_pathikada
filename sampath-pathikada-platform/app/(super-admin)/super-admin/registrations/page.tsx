"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, CheckCircle2, XCircle, Clock, Eye, ChevronDown,
  ChevronLeft, ChevronRight, RefreshCw, User, MapPin,
  Phone, Mail, CreditCard, Calendar, X, AlertCircle, Loader2,
  ShieldCheck, ZoomIn, ImageOff,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY  = "#0E2B4E";
const NAVY2 = "#0B2240";

/* ── Types ───────────────────────────────────────────────────── */
type Status = "pending" | "approved" | "rejected";
type Role = "economic-development-officer" | "divisional-secretariat";
type TableKey = "gn" | "ds";
type DocType = "NIC" | "DRIVING_LICENSE" | "PASSPORT" | null;

const DOC_TYPE_LABELS: Record<Exclude<DocType, null>, string> = {
  NIC: "National Identity Card",
  DRIVING_LICENSE: "Driving License",
  PASSPORT: "Passport",
};

interface Registration {
  id: string; name: string; nameSi: string; role: Role; district: string;
  ds: string; gnDivision: string; nic: string; mobile: string; email: string;
  submittedAt: string; status: Status; note?: string;
  docType: DocType; hasDocFront: boolean; hasDocBack: boolean;
}

const ROLE_TO_TABLE_KEY: Record<Role, TableKey> = {
  "economic-development-officer": "gn",
  "divisional-secretariat":       "ds",
};

const UI_ROLE_TO_API: Record<Role | "all", string> = {
  "economic-development-officer": "gn",
  "divisional-secretariat":       "ds",
  all:                            "all",
};

/* ── API row shape → UI shape ─────────────────────────────────── */
interface ApiRow {
  id: string; name: string; nameSinhala: string | null; email: string;
  phone: string; nic: string; district: string; dsDivision: string;
  gnDivision?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionNote: string | null; submittedAt: string; approvedAt: string | null;
  role: Role; roleLabel: string;
  verificationDocType?: DocType;
  hasDocFront?: boolean; hasDocBack?: boolean;
}

function mapRow(r: ApiRow): Registration {
  return {
    id: r.id,
    name: r.name,
    nameSi: r.nameSinhala ?? "—",
    role: r.role,
    district: r.district,
    ds: r.dsDivision,
    gnDivision: r.gnDivision ?? "—",
    nic: r.nic,
    mobile: r.phone,
    email: r.email,
    submittedAt: new Date(r.submittedAt).toLocaleString("en-GB", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).replace(",", ""),
    status: r.status.toLowerCase() as Status,
    note: r.rejectionNote ?? undefined,
    docType: r.verificationDocType ?? null,
    hasDocFront: !!r.hasDocFront,
    hasDocBack: !!r.hasDocBack,
  };
}

/* Role pill — inline styles instead of broken bg-[#hex]/12 */
const ROLE_STYLES: Record<Role, { bg: string; color: string; border: string; label: string }> = {
  "economic-development-officer": { bg: "rgba(14,43,78,0.10)",  color: NAVY2,    border: "rgba(14,43,78,0.20)",  label: "Economic Development Officer" },
  "divisional-secretariat":       { bg: "#f3e8ff",               color: "#6b21a8", border: "#ddd6fe",              label: "Divisional Secretariat"       },
};

/* ── Status badge ─────────────────────────────────────────────── */
const STATUS_STYLES: Record<Status, { bg: string; color: string; border: string; label: string; Icon: React.ElementType }> = {
  pending:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a", label: "Pending",  Icon: Clock        },
  approved: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", label: "Approved", Icon: CheckCircle2 },
  rejected: { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3", label: "Rejected", Icon: XCircle      },
};

const StatusBadge = ({ status }: { status: Status }) => {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      <s.Icon size={9} /> {s.label}
    </span>
  );
};

/* ── Document thumbnail + zoom lightbox ───────────────────────── */
function DocThumbnail({ src, caption, onOpen }: { src: string; caption: string; onOpen: () => void }) {
  const [errored, setErrored] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={errored}
      className="group relative rounded-xl overflow-hidden text-left"
      style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))", cursor: errored ? "default" : "zoom-in" }}
    >
      {!errored ? (
        <>
          <img
            src={src}
            alt={caption}
            loading="lazy"
            onError={() => setErrored(true)}
            className="w-full h-28 object-cover block"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </>
      ) : (
        <div className="w-full h-28 flex flex-col items-center justify-center gap-1.5 px-2 text-center">
          <ImageOff size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
          <span className="text-[10.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>Document removed after review decision</span>
        </div>
      )}
      <div className="px-2 py-1 text-[10.5px] font-semibold text-center" style={{ background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))" }}>
        {caption}
      </div>
    </button>
  );
}

function DocLightbox({ src, caption, onClose }: { src: string; caption: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-(--z-modal) flex flex-col bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-[13px] font-medium text-white/80">{caption}</span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
        <TransformWrapper>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={src} alt={caption} style={{ maxWidth: "92vw", maxHeight: "82vh", objectFit: "contain" }} />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}

/* ── Detail Drawer ─────────────────────────────────────────────── */
function DetailDrawer({ reg, busy, onClose, onApprove, onReject }: {
  reg: Registration | null; busy: boolean; onClose: () => void;
  onApprove: (reg: Registration) => void; onReject: (reg: Registration, note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [zoomSide, setZoomSide] = useState<"front" | "back" | null>(null);

  if (!reg) return null;
  const roleSt = ROLE_STYLES[reg.role];
  const tableKey = ROLE_TO_TABLE_KEY[reg.role];
  const docUrl = (side: "front" | "back") => `/api/registrations/${reg.id}/document/${side}?role=${tableKey}`;

  return (
    <>
      <div className="fixed inset-0 z-(--z-overlay) bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="fixed inset-y-0 right-0 z-(--z-modal) w-full max-w-md flex flex-col overflow-hidden"
        style={{
          background: "hsl(var(--background))",
          borderLeft: "1px solid hsl(var(--border))",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 100%)`,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>{reg.id}</p>
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: "var(--font-display,'Playfair Display',serif)" }}
            >
              {reg.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.10)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <StatusBadge status={reg.status} />

          {/* Info table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          >
            {[
              { icon: User,       label: "Full Name",   value: reg.name    },
              { icon: User,       label: "සිංහල නම",    value: reg.nameSi  },
              { icon: CreditCard, label: "NIC",         value: reg.nic     },
              { icon: Phone,      label: "Mobile",      value: reg.mobile  },
              { icon: Mail,       label: "Email",       value: reg.email   },
              { icon: MapPin,     label: "District",    value: reg.district},
              { icon: MapPin,     label: "DS Division", value: reg.ds      },
              { icon: MapPin,     label: "GN Division", value: reg.gnDivision !== "—" ? reg.gnDivision : "N/A" },
              { icon: Calendar,   label: "Submitted",   value: reg.submittedAt },
            ].map(({ icon: Icon, label, value }, idx) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: idx < 8 ? "1px solid hsl(var(--border))" : undefined }}
              >
                <Icon size={14} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
                <span className="text-[12px] w-28 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
                <span className="text-[13px] font-medium break-all" style={{ color: "hsl(var(--foreground))" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2">
            <span className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Role:</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
              style={{ background: roleSt.bg, color: roleSt.color, borderColor: roleSt.border }}
            >
              {roleSt.label}
            </span>
          </div>

          {/* Verification document */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
              <span className="text-[12px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Verification Document
              </span>
              {reg.docType && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10.5px] font-bold border"
                  style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))", borderColor: "hsl(var(--border))" }}
                >
                  {DOC_TYPE_LABELS[reg.docType]}
                </span>
              )}
            </div>

            {reg.hasDocFront || reg.hasDocBack ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {reg.hasDocFront && (
                    <DocThumbnail src={docUrl("front")} caption={reg.docType === "PASSPORT" ? "Photo Page" : "Front"} onOpen={() => setZoomSide("front")} />
                  )}
                  {reg.hasDocBack && (
                    <DocThumbnail src={docUrl("back")} caption="Back" onOpen={() => setZoomSide("back")} />
                  )}
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Shown for verification purposes only — this image is permanently deleted once a decision is made.
                </p>
              </>
            ) : (
              <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                No document on file.
              </p>
            )}
          </div>

          {/* Rejection note */}
          {reg.status === "rejected" && reg.note && (
            <div
              className="flex gap-2.5 p-3.5 rounded-xl border"
              style={{ background: "#fff1f2", borderColor: "#fecdd3" }}
            >
              <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12.5px]" style={{ color: "#9f1239" }}>{reg.note}</p>
            </div>
          )}

          {/* Rejection input */}
          {rejecting && (
            <div className="space-y-3">
              <label className="text-[12.5px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Rejection Reason <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Provide a clear reason for rejection..."
                className="w-full rounded-xl px-3 py-2.5 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                style={{
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--input))",
                  color: "hsl(var(--foreground))",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {reg.status === "pending" && (
          <div
            className="px-6 py-4 flex gap-3 shrink-0"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            {!rejecting ? (
              <>
                <button
                  onClick={() => onApprove(reg)}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#059669" }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.background = "#047857"; }}
                  onMouseLeave={e => (e.currentTarget.style.background = "#059669")}
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Approve
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#dc2626" }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.background = "#b91c1c"; }}
                  onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}
                >
                  <XCircle size={15} /> Reject
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setRejecting(false)}
                  disabled={busy}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-60"
                  style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { if (note.trim()) onReject(reg, note.trim()); }}
                  disabled={!note.trim() || busy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#dc2626" }}
                  onMouseEnter={e => { if (note.trim() && !busy) e.currentTarget.style.background = "#b91c1c"; }}
                  onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : null} Confirm Reject
                </button>
              </>
            )}
          </div>
        )}
      </aside>

      {zoomSide && (
        <DocLightbox
          src={docUrl(zoomSide)}
          caption={zoomSide === "front" ? (reg.docType === "PASSPORT" ? "Photo Page" : "Front") : "Back"}
          onClose={() => setZoomSide(null)}
        />
      )}
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
const PER_PAGE = 6;

export default function RegistrationsPage() {
  const [rows, setRows]           = useState<Registration[]>([]);
  const [total, setTotal]         = useState(0);
  const [counts, setCounts]       = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const [search, setSearch]             = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [roleFilter, setRoleFilter]     = useState<Role | "all">("all");
  const [selected, setSelected]         = useState<Registration | null>(null);
  const [page, setPage]                 = useState(1);

  /* debounce search input */
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        role:   UI_ROLE_TO_API[roleFilter],
        search,
        page:   String(page),
        limit:  String(PER_PAGE),
      });
      const res  = await fetch(`/api/registrations?${params.toString()}`);
      const json = await res.json() as { ok: boolean; message?: string; data?: ApiRow[]; total?: number };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Failed to load registrations.");
        setRows([]); setTotal(0);
        return;
      }
      setRows((json.data ?? []).map(mapRow));
      setTotal(json.total ?? 0);
    } catch {
      setError("Network error while loading registrations.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, search, page]);

  const fetchCounts = useCallback(async () => {
    try {
      const res  = await fetch(`/api/registrations?countsOnly=true`);
      const json = await res.json() as { ok: boolean; counts?: typeof counts };
      if (json.ok && json.counts) setCounts(json.counts);
    } catch {
      // non-critical — leave previous counts in place
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const runAction = async (reg: Registration, action: "approve" | "reject", rejectionNote?: string) => {
    setActionBusy(true);
    setError("");
    try {
      const res  = await fetch(`/api/registrations/${reg.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, role: ROLE_TO_TABLE_KEY[reg.role], rejectionNote }),
      });
      const json = await res.json() as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? `Failed to ${action} registration.`);
        return;
      }
      setSelected(null);
      await Promise.all([fetchList(), fetchCounts()]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleApprove = (reg: Registration) => runAction(reg, "approve");
  const handleReject  = (reg: Registration, note: string) => runAction(reg, "reject", note);

  const statCards = [
    { label: "Total",    value: counts.total,    bg: "hsl(var(--card))",   border: "hsl(var(--border))",   valueColor: "hsl(var(--foreground))" },
    { label: "Pending",  value: counts.pending,  bg: "#fffbeb",            border: "#fde68a",              valueColor: "#b45309" },
    { label: "Approved", value: counts.approved, bg: "#ecfdf5",            border: "#a7f3d0",              valueColor: "#065f46" },
    { label: "Rejected", value: counts.rejected, bg: "#fff1f2",            border: "#fecdd3",              valueColor: "#9f1239" },
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
            Registrations
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Review and approve user registration requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchList(); fetchCounts(); }}
            className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium rounded-xl transition-colors"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
            onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
            onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--card))")}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
          style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
        >
          <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
          <span className="text-[13px]" style={{ color: "#9f1239" }}>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
              {s.label}
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ fontVariantNumeric: "tabular-nums", color: s.valueColor }}
            >
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, NIC, email, district..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            style={{
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className="px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-colors"
              style={statusFilter === s
                ? { background: NAVY, color: "#fff", border: "1px solid transparent" }
                : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
              }
              onMouseEnter={e => { if (statusFilter !== s) e.currentTarget.style.color = "hsl(var(--foreground))"; }}
              onMouseLeave={e => { if (statusFilter !== s) e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as Role | "all"); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
          >
            <option value="all">All Roles</option>
            <option value="economic-development-officer">Economic Development Officer</option>
            <option value="divisional-secretariat">Divisional Secretariat</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "hsl(var(--muted-foreground))" }} />
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
                {["Registration ID", "Applicant", "Role", "Location", "Submitted", "Status", "Actions"].map(h => (
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
            <tbody style={{ borderTop: 0 }}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading registrations…</span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-sm"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    No registrations found.
                  </td>
                </tr>
              ) : rows.map((r, idx) => {
                const roleSt = ROLE_STYLES[r.role];
                return (
                  <tr
                    key={r.id}
                    style={{ borderBottom: idx < rows.length - 1 ? "1px solid hsl(var(--border))" : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted))")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-5 py-3.5 font-mono text-[11px] whitespace-nowrap max-w-32 truncate" style={{ color: "hsl(var(--muted-foreground))" }} title={r.id}>
                      {r.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                          style={{ background: NAVY }}
                        >
                          {r.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold truncate max-w-40" style={{ color: "hsl(var(--foreground))" }}>{r.name}</p>
                          <p className="text-[11px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{r.nic}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                        style={{ background: roleSt.bg, color: roleSt.color, borderColor: roleSt.border }}
                      >
                        {roleSt.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px]" style={{ color: "hsl(var(--foreground))" }}>{r.district}</p>
                      <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{r.ds}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {r.submittedAt}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelected(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                          style={{ background: "rgba(14,43,78,0.08)", color: NAVY }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,43,78,0.15)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,43,78,0.08)")}
                        >
                          <Eye size={12} /> View
                        </button>
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(r)}
                              disabled={actionBusy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-60"
                              style={{ background: "#ecfdf5", color: "#065f46" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#d1fae5")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#ecfdf5")}
                            >
                              <CheckCircle2 size={12} />
                            </button>
                            <button
                              onClick={() => setSelected(r)}
                              disabled={actionBusy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-60"
                              style={{ background: "#fff1f2", color: "#9f1239" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#ffe4e6")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#fff1f2")}
                            >
                              <XCircle size={12} />
                            </button>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              Showing {total === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                onMouseEnter={e => { if (page > 1) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors"
                  style={n === page
                    ? { background: NAVY, color: "#fff" }
                    : { border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", background: "transparent" }
                  }
                  onMouseEnter={e => { if (n !== page) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                  onMouseLeave={e => { if (n !== page) e.currentTarget.style.background = "transparent"; }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.background = "hsl(var(--muted))"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DetailDrawer reg={selected} busy={actionBusy} onClose={() => setSelected(null)} onApprove={handleApprove} onReject={handleReject} />
    </div>
  );
}
