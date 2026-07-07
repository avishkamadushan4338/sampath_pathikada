"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Eye, EyeOff, ChevronDown, ArrowLeft, Check,
  Globe, Shield, Building2, MapPin, User, Lock,
  Phone, Mail, CreditCard, IdCard, Users, Search, X,
  UploadCloud, FileImage, ShieldCheck, Trash2,
} from "lucide-react";
import {
  DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS,
  type Locale, type UserType,
} from "@/lib/registration-data";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const GOLD      = "#C8A34D";
const DEEP_GOLD = "#A67C00";
const CRIMSON   = "#6B0F1A";
const CHARCOAL  = "#111111";
const ease      = [0.16, 1, 0.3, 1] as const;

/* ─── Responsive width hook ──────────────────────────────────────────────── */
function useWindowWidth() {
  const [w, setW] = useState(1024);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/* ─── i18n ───────────────────────────────────────────────────────────────── */
const STRINGS = {
  en: {
    stepLabels: ["Language", "Role", "Location", "Personal Info", "Verification"],
    langTitle: "Choose Your Language",
    langSub: "Select your preferred language to continue",
    roleTitle: "Select Your Role",
    roleSub: "Choose the position that matches your official designation",
    gnLabel: "Economic Development Officer", gnSub: "Village-level administrative officer",
    rsLabel: "Regional Secretary",       rsSub: "Divisional Secretariat representative",
    locTitle: "Location Details",        locSub: "Select your administrative area",
    district: "District",                selectDistrict: "Select District",
    ds: "Divisional Secretariat",        selectDs: "Select Divisional Secretariat",
    gn: "Grama Niladari Division",       selectGn: "Select GN Division",
    localGovt: "Local Government Body / Area",
    electoral: "Electoral Constituency (Electoral Seat)",
    farmers: "Farmers' Service Center",
    eduZone: "Education Zone",
    eduDiv: "Education Division",
    mahaweli: "Mahaweli Division – Hambantota",
    selectOpt: "Select option",
    personalTitle: "Personal Information", personalSub: "Enter your official personal details",
    firstName: "First Name",    lastName: "Last Name",
    fullName: "Full Name (as in NIC)",   nic: "NIC Number",
    mobile: "Mobile Number",    email: "Email Address",
    password: "Password",       confirmPwd: "Confirm Password",
    next: "Continue",           back: "Back",
    submit: "Create Account",   submitting: "Creating Account…",
    hasAccount: "Already have an account?", signIn: "Sign In",
    pwdHint: "Min 8 chars, include uppercase, number & symbol",
    nicHint: "Format: 123456789V or 200012345678",
    mobileHint: "Format: 07XXXXXXXX",
    verifyTitle: "Identity Verification", verifySub: "Upload a clear photo of your ID document for Super Admin verification",
    docType: "Document Type", selectDocType: "Select document type",
    docNic: "National Identity Card (NIC)", docLicense: "Driving License", docPassport: "Passport",
    docFront: "Front Side", docBack: "Back Side", docFrontPassport: "Photo Page",
    dropHint: "Drag & drop an image, or click to browse", dropActive: "Drop the image here",
    fileTooLarge: "File must be 5MB or smaller", fileWrongType: "Only JPG, PNG, or WEBP images are allowed",
    removeFile: "Remove", privacyNote: "This document is used only to verify your identity. It is permanently deleted from our systems immediately after a Super Admin reviews your application.",
  },
  si: {
    stepLabels: ["භාෂාව", "භූමිකාව", "ස්ථානය", "තොරතුරු", "සත්‍යාපනය"],
    langTitle: "භාෂාව තෝරන්න",
    langSub: "ඉදිරිය සඳහා ඔබේ කැමති භාෂාව තෝරන්න",
    roleTitle: "ඔබේ භූමිකාව තෝරන්න",
    roleSub: "ඔබේ නිල තනතුරට ගැළපෙන භූමිකාව තෝරන්න",
    gnLabel: "ආර්ථික සංවර්ධන නිලධාරී",   gnSub: "ගම් මට්ටමේ පරිපාලන නිලධාරී",
    rsLabel: "ප්‍රාදේශීය ලේකම්",         rsSub: "ප්‍රාදේශීය ලේකම් කාර්යාල නියෝජිතයා",
    locTitle: "ස්ථාන විස්තර",             locSub: "ඔබේ පරිපාලන ප්‍රදේශය තෝරන්න",
    district: "දිස්ත්‍රික්කය",           selectDistrict: "දිස්ත්‍රික්කය තෝරන්න",
    ds: "ප්‍රාදේශීය ලේකම් කාර්යාලය",    selectDs: "ප්‍රාදේශීය ලේකම් කාර්යාලය තෝරන්න",
    gn: "ග්‍රාම නිලධාරී වසම",           selectGn: "ග්‍රාම නිලධාරී වසම තෝරන්න",
    localGovt: "පළාත් පාලන ආයතනය/ බල ප්‍රදේශය",
    electoral: "මැතිවරණ බල ප්‍රදේශය/ප්‍රදේශ (මැතිවරණ ආසනය)",
    farmers: "ගොවිජන සේවා මධ්‍යස්ථානය",
    eduZone: "අධ්‍යාපන කලාපය",
    eduDiv: "අධ්‍යාපන කොට්ඨාසය",
    mahaweli: "මහවැලි කොට්ඨාසය - හම්බන්තොට",
    selectOpt: "විකල්පය තෝරන්න",
    personalTitle: "පෞද්ගලික තොරතුරු",   personalSub: "ඔබේ නිල පෞද්ගලික තොරතුරු ඇතුළත් කරන්න",
    firstName: "මුල් නම",    lastName: "අවසාන නම",
    fullName: "සම්පූර්ණ නම (ජා.හැ.පත අනුව)", nic: "ජාතික හැඳුනුම්පත් අංකය",
    mobile: "ජංගම දුරකථන අංකය", email: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",          confirmPwd: "මුරපදය තහවුරු කරන්න",
    next: "ඉදිරියට",             back: "ආපසු",
    submit: "ගිණුම සාදන්න",      submitting: "ගිණුම සාදමින්…",
    hasAccount: "දැනටමත් ගිණුමක් ඇත?", signIn: "පිවිසෙන්න",
    pwdHint: "අවම අකුරු 8, ලොකු අකුරු, සංඛ්‍යා හා විශේෂ ලකුණු ඇතුළත් කරන්න",
    nicHint: "ආකෘතිය: 123456789V හෝ 200012345678",
    mobileHint: "ආකෘතිය: 07XXXXXXXX",
    verifyTitle: "අනන්‍යතා සත්‍යාපනය", verifySub: "සුපිරි පරිපාලක සත්‍යාපනය සඳහා ඔබේ හැඳුනුම්පත් ලේඛනයේ පැහැදිලි ඡායාරූපයක් උඩුගත කරන්න",
    docType: "ලේඛන වර්ගය", selectDocType: "ලේඛන වර්ගය තෝරන්න",
    docNic: "ජාතික හැඳුනුම්පත (NIC)", docLicense: "රියදුරු බලපත්‍රය", docPassport: "විදේශ ගමන් බලපත්‍රය",
    docFront: "ඉදිරි පැත්ත", docBack: "පසුපස", docFrontPassport: "ඡායාරූප පිටුව",
    dropHint: "රූපයක් ඇද දමන්න, හෝ බ්‍රවුස් කිරීමට ක්ලික් කරන්න", dropActive: "රූපය මෙහි දමන්න",
    fileTooLarge: "ගොනුව 5MB හෝ ඊට අඩු විය යුතුය", fileWrongType: "JPG, PNG, හෝ WEBP රූප පමණක් අවසර ඇත",
    removeFile: "ඉවත් කරන්න", privacyNote: "මෙම ලේඛනය ඔබේ අනන්‍යතාවය තහවුරු කිරීමට පමණක් භාවිතා වේ. සුපිරි පරිපාලක ඔබේ අයදුම්පත සමාලෝචනය කිරීමෙන් වහාම පසු එය අපගේ පද්ධතිවලින් ස්ථිරවම මකා දමනු ලැබේ.",
  },
} as const;

/* ─── Form state ─────────────────────────────────────────────────────────── */
type DocType = "NIC" | "DRIVING_LICENSE" | "PASSPORT" | "";

interface FormData {
  language: Locale | "";
  userType: UserType | "";
  district: string; ds: string; gnDiv: string;
  localGovt: string; electoral: string; farmers: string;
  eduZone: string; eduDiv: string; mahaweli: string;
  firstName: string; lastName: string; fullName: string;
  nic: string; mobile: string; email: string;
  password: string; confirmPwd: string;
  docType: DocType; docFront: File | null; docBack: File | null;
}
type Errors = Partial<Record<keyof FormData, string>>;

const INIT: FormData = {
  language: "", userType: "",
  district: "", ds: "", gnDiv: "",
  localGovt: "", electoral: "", farmers: "",
  eduZone: "", eduDiv: "", mahaweli: "",
  firstName: "", lastName: "", fullName: "",
  nic: "", mobile: "", email: "",
  password: "", confirmPwd: "",
  docType: "", docFront: null, docBack: null,
};

const MAX_DOC_BYTES = 5 * 1024 * 1024;
const ALLOWED_DOC_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ─── Reusable: PremiumInput ─────────────────────────────────────────────── */
function PremiumInput({
  id, label, type = "text", value, onChange, icon,
  autoComplete, hint, error, delay = 0, locale = "en",
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode;
  autoComplete?: string; hint?: string; error?: string;
  delay?: number; locale?: Locale;
}) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isPwd = type === "password";
  const inputType = isPwd ? (showPwd ? "text" : "password") : type;
  const lifted = focused || value.length > 0;
  const si = locale === "si";
  const w = useWindowWidth();
  const isTablet = w >= 640 && w < 1024;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease }}
    >
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          position: "relative",
          borderRadius: 12,
          border: `1.5px solid ${error ? "rgba(239,68,68,0.55)" : focused ? GOLD : "rgba(200,163,77,0.26)"}`,
          background: focused ? "#FFFDF8" : error ? "rgba(254,242,242,0.6)" : "#FAF8F3",
          boxShadow: focused ? `0 0 0 3px rgba(200,163,77,0.10)` : error ? "0 0 0 3px rgba(239,68,68,0.07)" : "none",
          transition: "all .2s ease",
          overflow: "hidden",
          cursor: "text",
        }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 14px", gap: 10, minHeight: 58 }}>
          <div style={{ color: focused ? GOLD : error ? "#EF4444" : "rgba(17,17,17,0.30)", flexShrink: 0, transition: "color .2s" }}>
            {icon}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: isPwd ? 32 : 0 }}>
            <label htmlFor={id} style={{
              display: "block",
              fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
              fontSize: lifted ? (isTablet ? 12 : 10) : (isTablet ? 16 : 15),
              fontWeight: lifted ? 600 : 400,
              letterSpacing: lifted ? "0.07em" : 0,
              color: focused ? GOLD : lifted ? "rgba(17,17,17,0.42)" : "rgba(17,17,17,0.36)",
              transition: "all .15s ease",
              lineHeight: 1,
              marginBottom: lifted ? 3 : 0,
              cursor: "text",
            }}>
              {label}
            </label>
            <input
              ref={inputRef}
              id={id} type={inputType} value={value}
              onChange={e => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete={autoComplete}
              placeholder=""
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: isTablet ? 16 : 15, fontWeight: 500, color: CHARCOAL, caretColor: GOLD,
                fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                lineHeight: 1.3, width: "100%",
                height: lifted ? "auto" : 0,
                overflow: "hidden",
              }}
            />
          </div>
          {isPwd && (
            <button type="button" tabIndex={-1} onClick={() => setShowPwd(p => !p)}
              aria-label={showPwd ? "Hide" : "Show"}
              style={{
                position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", padding: 4, cursor: "pointer",
                color: focused ? GOLD : "rgba(17,17,17,0.28)", transition: "color .2s",
              }}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {(error || hint) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            style={{
              margin: "4px 4px 0",
              fontSize: isTablet ? 13 : 11.5,
              fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
              color: error ? "#DC2626" : "rgba(17,17,17,0.38)",
              lineHeight: 1.4,
            }}
          >
            {error || hint}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Reusable: PremiumSelect ────────────────────────────────────────────── */
function PremiumSelect({
  id, label, value, onChange, options, placeholder,
  icon, error, delay = 0, locale = "en", disabled = false, bilingual = false,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
  options: { id: string; en: string; si: string }[];
  placeholder: string; icon: React.ReactNode;
  error?: string; delay?: number; locale?: Locale; disabled?: boolean; bilingual?: boolean;
}) {
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState("");
  const [pos, setPos]           = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const w = useWindowWidth();
  const isTablet = w >= 640 && w < 1024;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  const si          = locale === "si";
  const hasVal      = value !== "";
  const selectedOpt = options.find(o => o.id === value);
  const showSearch  = options.length > 5;
  const ff          = si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif";

  /* mount + mobile detect */
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  const closeDrop = useCallback(() => { setOpen(false); setSearch(""); }, []);

  const openDrop = () => {
    if (disabled) return;
    reposition();
    setOpen(true);
    setSearch("");
  };

  /* outside click – desktop only */
  useEffect(() => {
    if (!open || isMobile) return;
    const h = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) &&
          !panelRef.current?.contains(e.target as Node)) closeDrop();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, isMobile, closeDrop]);

  /* reposition on scroll / resize – desktop only */
  useEffect(() => {
    if (!open || isMobile) return;
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, isMobile, reposition]);

  /* escape to close */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrop(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, closeDrop]);

  /* body scroll lock on mobile */
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = (open && isMobile) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, isMobile, mounted]);

  /* auto-focus search */
  useEffect(() => {
    if (open && showSearch) setTimeout(() => searchRef.current?.focus(), 80);
  }, [open, showSearch]);

  const filtered = useMemo(() =>
    !search ? options : options.filter(o => {
      const q = search.toLowerCase();
      if (bilingual) return o.en.toLowerCase().includes(q) || o.si.includes(search);
      return (si ? o.si : o.en).toLowerCase().includes(q);
    }),
  [options, search, si, bilingual]);

  /* shared option row */
  const renderOption = (o: { id: string; en: string; si: string }) => {
    const sel = o.id === value;
    const primary   = si ? o.si : o.en;
    const secondary = si ? o.en : o.si;
    return (
      <button
        key={o.id} type="button"
        onClick={() => { onChange(o.id); closeDrop(); }}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : isTablet ? "12px 14px" : "10px 12px",
          minHeight: bilingual ? (isMobile ? 68 : isTablet ? 62 : 54) : (isMobile ? 56 : isTablet ? 52 : 44),
          borderRadius: isMobile ? 14 : isTablet ? 12 : 9,
          border: "none", cursor: "pointer", textAlign: "left",
          background: sel
            ? "linear-gradient(135deg,rgba(200,163,77,0.15),rgba(200,163,77,0.07))"
            : "transparent",
          marginBottom: isMobile ? 2 : 0,
          transition: "background .12s ease",
        }}
        onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = "rgba(200,163,77,0.07)"; }}
        onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = sel ? "linear-gradient(135deg,rgba(200,163,77,0.15),rgba(200,163,77,0.07))" : "transparent"; }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "block",
            fontSize: isMobile ? 16 : isTablet ? 16 : 14,
            fontWeight: sel ? 600 : 400,
            color: sel ? DEEP_GOLD : CHARCOAL,
            fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
            lineHeight: 1.4,
          }}>
            {primary}
          </span>
          {bilingual && (
            <span style={{
              display: "block",
              fontSize: isMobile ? 12 : isTablet ? 12 : 11,
              fontWeight: 400,
              color: sel ? "rgba(166,124,0,0.70)" : "rgba(17,17,17,0.42)",
              fontFamily: si ? "'Inter',system-ui,sans-serif" : "'Yaldevi','Noto Sans Sinhala',sans-serif",
              lineHeight: 1.3, marginTop: 2,
            }}>
              {secondary}
            </span>
          )}
        </div>
        {sel && (
          <div style={{
            width: isMobile ? 24 : isTablet ? 22 : 20, height: isMobile ? 24 : isTablet ? 22 : 20,
            borderRadius: "50%",
            background: `linear-gradient(135deg,${GOLD},${DEEP_GOLD})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginLeft: 10,
            boxShadow: "0 2px 8px rgba(166,124,0,0.28)",
          }}>
            <Check size={isMobile ? 13 : isTablet ? 12 : 11} color="#fff" strokeWidth={3} />
          </div>
        )}
      </button>
    );
  };

  /* shared search bar */
  const renderSearch = () => showSearch && (
    <div style={{ padding: isMobile ? "12px 14px 8px" : "10px 10px 6px" }}>
      <div style={{
        display: "flex", alignItems: "center",
        gap: isMobile ? 10 : 8,
        padding: isMobile ? "11px 14px" : "8px 12px",
        borderRadius: isMobile ? 14 : 9,
        background: "#FAF8F3",
        border: "1.5px solid rgba(200,163,77,0.22)",
      }}>
        <Search size={isMobile ? 16 : isTablet ? 15 : 13} color="rgba(17,17,17,0.38)" style={{ flexShrink: 0 }} />
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={bilingual ? (si ? "සොයන්න / Search…" : "Search / සොයන්න…") : (si ? "සොයන්න…" : "Search…")}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: isMobile ? 15 : isTablet ? 15 : 13,
            color: CHARCOAL, caretColor: GOLD, fontFamily: ff,
          }}
        />
        {search && (
          <button type="button" onClick={() => setSearch("")}
            style={{ background: "none", border: "none", padding: 2, cursor: "pointer", display: "flex", flexShrink: 0 }}>
            <X size={isMobile ? 15 : isTablet ? 14 : 12} color="rgba(17,17,17,0.40)" />
          </button>
        )}
      </div>
    </div>
  );

  const emptyState = (
    <p style={{
      margin: 0, padding: isMobile ? "24px 10px" : "16px 10px",
      textAlign: "center",
      fontSize: isMobile ? 14 : isTablet ? 14 : 13,
      color: "rgba(17,17,17,0.36)", fontFamily: ff,
    }}>
      {si ? "ප්‍රතිඵල නැත" : "No results found"}
    </p>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease }}
    >
      {/* ── Trigger button (same for all screen sizes) ── */}
      <button
        ref={triggerRef} id={id} type="button"
        onClick={openDrop}
        aria-haspopup="listbox" aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 10, padding: "0 14px", minHeight: 58,
          borderRadius: 12, textAlign: "left", outline: "none",
          border: `1.5px solid ${error ? "rgba(239,68,68,0.55)" : open ? GOLD : "rgba(200,163,77,0.26)"}`,
          background: open ? "#FFFDF8" : "#FAF8F3",
          boxShadow: open ? "0 0 0 3px rgba(200,163,77,0.10)" : "none",
          transition: "all .2s ease",
          cursor: disabled ? "default" : "pointer",
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <div style={{ color: open ? GOLD : "rgba(17,17,17,0.32)", transition: "color .2s", flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {hasVal && (
            <span style={{
              display: "block", fontSize: isTablet ? 12 : 10, fontWeight: 600, letterSpacing: "0.07em",
              color: open ? GOLD : "rgba(17,17,17,0.42)", fontFamily: ff,
              lineHeight: 1, marginBottom: 3, transition: "color .2s",
            }}>
              {label}
            </span>
          )}
          <span style={{
            display: "block", fontSize: isTablet ? 16 : 15, fontWeight: hasVal ? 500 : 400,
            color: hasVal ? CHARCOAL : "rgba(17,17,17,0.46)", fontFamily: ff,
            lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {hasVal ? (si ? selectedOpt?.si : selectedOpt?.en) ?? placeholder : placeholder}
          </span>
          {bilingual && hasVal && (
            <span style={{
              display: "block", fontSize: isTablet ? 12 : 11, fontWeight: 400,
              color: "rgba(17,17,17,0.42)",
              fontFamily: si ? "'Inter',system-ui,sans-serif" : "'Yaldevi','Noto Sans Sinhala',sans-serif",
              lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              marginTop: 1,
            }}>
              {si ? selectedOpt?.en : selectedOpt?.si}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ color: open ? GOLD : "rgba(17,17,17,0.32)", flexShrink: 0 }}
        >
          <ChevronDown size={isTablet ? 18 : 15} />
        </motion.div>
      </button>

      {/* ── Validation error ── */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            style={{ margin: "4px 4px 0", fontSize: isTablet ? 13 : 11.5, fontFamily: ff, color: "#DC2626", lineHeight: 1.4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Portal ── */}
      {mounted && createPortal(
        <AnimatePresence>

          {/* ══ MOBILE: backdrop ══ */}
          {open && isMobile && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeDrop}
              style={{
                position: "fixed", inset: 0, zIndex: 9998,
                background: "rgba(0,0,0,0.54)",
                backdropFilter: "blur(3px)",
                WebkitBackdropFilter: "blur(3px)",
              }}
            />
          )}

          {/* ══ MOBILE: bottom sheet ══ */}
          {open && isMobile && (
            <motion.div
              key="sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                zIndex: 9999,
                borderRadius: "24px 24px 0 0",
                background: "#FEFCF8",
                boxShadow: "0 -10px 50px rgba(0,0,0,0.18)",
                border: "1.5px solid rgba(200,163,77,0.24)",
                borderBottom: "none",
                maxHeight: "82dvh",
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Gold top rule */}
              <div style={{ height: 3, borderRadius: "24px 24px 0 0", background: `linear-gradient(90deg,transparent 8%,${GOLD} 50%,transparent 92%)` }} />

              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(200,163,77,0.35)" }} />
              </div>

              {/* Sheet title */}
              <div style={{ padding: "6px 20px 14px", textAlign: "center" }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'Playfair Display',Georgia,serif",
                  fontSize: "1.15rem", fontWeight: 800,
                  color: CHARCOAL, letterSpacing: "-0.02em",
                }}>
                  {label}
                </p>
              </div>

              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(200,163,77,0.28),transparent)`, margin: "0 16px" }} />

              {renderSearch()}

              {/* Options list */}
              <div style={{ overflowY: "auto", flex: 1, padding: "6px 10px 6px" }}>
                {filtered.length === 0 ? emptyState : filtered.map(renderOption)}
              </div>

              {/* Cancel */}
              <div style={{
                padding: "10px 14px",
                paddingBottom: "max(18px,env(safe-area-inset-bottom))" as string,
                borderTop: "1px solid rgba(200,163,77,0.12)",
              }}>
                <button
                  type="button" onClick={closeDrop}
                  style={{
                    width: "100%", height: 52, borderRadius: 14,
                    background: "#FAF8F3",
                    border: "1.5px solid rgba(200,163,77,0.28)",
                    cursor: "pointer",
                    fontFamily: ff, fontSize: 15, fontWeight: 600,
                    color: "rgba(17,17,17,0.58)",
                  }}
                >
                  {si ? "අවලංගු කරන්න" : "Cancel"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ DESKTOP / TABLET: floating dropdown ══ */}
          {open && !isMobile && (
            <motion.div
              key="panel"
              ref={panelRef}
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: pos.top, left: pos.left, width: pos.width,
                zIndex: 9999,
                borderRadius: 14,
                background: "#FEFCF8",
                border: "1.5px solid rgba(200,163,77,0.38)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.14),0 6px 24px rgba(166,124,0,0.12),inset 0 1px 0 rgba(255,255,255,0.95)",
                overflow: "hidden",
              }}
            >
              <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
              {renderSearch()}
              <div style={{ maxHeight: isTablet ? 300 : 240, overflowY: "auto", padding: "4px 6px 8px" }}>
                {filtered.length === 0 ? emptyState : filtered.map(renderOption)}
              </div>
            </motion.div>
          )}

        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

/* ─── Step progress bar ──────────────────────────────────────────────────── */
function StepBar({ step, labels }: { step: number; labels: readonly string[] }) {
  const w = useWindowWidth();
  const isTablet = w >= 640 && w < 1024;
  return (
    <div style={{
      marginBottom: "clamp(18px,3vh,32px)",
      padding: "clamp(12px,2vh,18px) clamp(14px,3vw,22px) clamp(8px,1.5vh,12px)",
      borderRadius: 16,
      background: "linear-gradient(160deg,rgba(255,253,248,0.96) 0%,rgba(250,247,240,0.92) 100%)",
      border: "1px solid rgba(200,163,77,0.16)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92),0 2px 18px rgba(166,124,0,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        {labels.map((lbl, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", flex: i < labels.length - 1 ? 1 : 0 }}>

            {/* ── Step node ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>

              {/* Circle */}
              <div style={{ position: "relative", width: 38, height: 38, flexShrink: 0 }}>
                {/* Pulse ring – active step only */}
                {i === step && (
                  <motion.div
                    style={{
                      position: "absolute", inset: -7, borderRadius: "50%",
                      border: "1.5px solid rgba(200,163,77,0.38)",
                      pointerEvents: "none",
                    }}
                    animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.30, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i < step
                    ? `linear-gradient(145deg,#D4AA55,${DEEP_GOLD})`
                    : i === step
                      ? "linear-gradient(145deg,#FFFDF5,#FFF4D4)"
                      : "#F5F3EE",
                  border: i < step
                    ? "1.5px solid rgba(200,163,77,0.35)"
                    : i === step
                      ? `2px solid ${GOLD}`
                      : "2px solid rgba(200,163,77,0.18)",
                  boxShadow: i < step
                    ? `0 4px 16px rgba(166,124,0,0.32),0 0 0 3px rgba(200,163,77,0.10),inset 0 1px 0 rgba(255,255,255,0.22)`
                    : i === step
                      ? `0 0 0 5px rgba(200,163,77,0.13),0 4px 14px rgba(166,124,0,0.18),inset 0 1px 0 rgba(255,255,255,0.88)`
                      : "inset 0 1px 0 rgba(255,255,255,0.75)",
                  transition: "all .40s ease",
                  position: "relative", zIndex: 1,
                }}>
                  {i < step ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 480, damping: 22 }}
                    >
                      <Check size={16} color="#fff" strokeWidth={2.8} />
                    </motion.div>
                  ) : (
                    <span style={{
                      fontSize: isTablet ? 16 : 14, fontWeight: 800, lineHeight: 1,
                      color: i === step ? GOLD : "rgba(17,17,17,0.20)",
                      fontFamily: "'Inter',system-ui,sans-serif",
                      letterSpacing: "-0.02em",
                    }}>
                      {i + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Label */}
              <span style={{
                fontSize: isTablet ? 11.5 : 9.5, fontWeight: i === step ? 700 : 500,
                color: i === step ? GOLD : i < step ? DEEP_GOLD : "rgba(17,17,17,0.26)",
                fontFamily: "'Inter',system-ui,sans-serif",
                letterSpacing: "0.07em", textTransform: "uppercase",
                whiteSpace: "nowrap", transition: "color .35s ease",
              }}>
                {lbl}
              </span>
            </div>

            {/* ── Animated connector ── */}
            {i < labels.length - 1 && (
              <div style={{
                flex: 1,
                position: "relative",
                height: 2,
                borderRadius: 2,
                background: "rgba(200,163,77,0.13)",
                margin: "18px clamp(5px,1.2vw,10px) 0",
                overflow: "hidden",
              }}>
                <motion.div
                  style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(90deg,${DEEP_GOLD},${GOLD})`,
                    borderRadius: 2,
                    transformOrigin: "left center",
                    boxShadow: "0 0 5px rgba(200,163,77,0.45)",
                  }}
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Language card ──────────────────────────────────────────────────────── */
function LangCard({
  locale, selected, onClick,
}: { locale: Locale; selected: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.button
      type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1, minWidth: 0, cursor: "pointer",
        borderRadius: 16, padding: "clamp(20px,4vh,36px) 16px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        border: `2px solid ${selected ? GOLD : hov ? "rgba(200,163,77,0.40)" : "rgba(200,163,77,0.18)"}`,
        background: selected
          ? "linear-gradient(145deg,#FFFBF0,#FFF8E8)"
          : hov ? "#FEFCF7" : "#FAFAF5",
        boxShadow: selected
          ? `0 0 0 4px rgba(200,163,77,0.14), 0 8px 32px rgba(166,124,0,0.14)`
          : hov ? "0 4px 16px rgba(166,124,0,0.08)" : "none",
        transition: "all .25s ease",
        position: "relative", overflow: "hidden",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          width: 22, height: 22, borderRadius: "50%",
          background: `linear-gradient(135deg,${GOLD},${DEEP_GOLD})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check size={11} color="#fff" strokeWidth={3} />
        </div>
      )}
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: selected ? `linear-gradient(135deg,${GOLD}22,${DEEP_GOLD}18)` : "rgba(200,163,77,0.08)",
        border: `1.5px solid ${selected ? `${GOLD}55` : "rgba(200,163,77,0.18)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .25s ease",
      }}>
        <Globe size={26} color={selected ? GOLD : "rgba(17,17,17,0.30)"} />
      </div>
      {locale === "en" ? (
        <>
          <span style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 800, color: selected ? "#8B6400" : CHARCOAL, letterSpacing: "-0.03em" }}>
            English
          </span>
          <span style={{ fontSize: 12, fontFamily: "'Inter',system-ui,sans-serif", color: "rgba(17,17,17,0.40)", fontWeight: 500 }}>
            Continue in English
          </span>
        </>
      ) : (
        <>
          <span lang="si" style={{ fontSize: "clamp(1.3rem,3.5vw,1.9rem)", fontFamily: "'Yaldevi','Noto Sans Sinhala',sans-serif", fontWeight: 700, color: selected ? "#8B6400" : CHARCOAL, letterSpacing: "0.02em" }}>
            සිංහල
          </span>
          <span lang="si" style={{ fontSize: 12, fontFamily: "'Yaldevi','Noto Sans Sinhala',sans-serif", color: "rgba(17,17,17,0.40)", fontWeight: 500 }}>
            සිංහලෙන් ඉදිරිය
          </span>
        </>
      )}
    </motion.button>
  );
}

/* ─── Role card ──────────────────────────────────────────────────────────── */
const ROLE_META: Record<UserType, { icon: React.ReactNode; color: string; gradient: string }> = {
  economic_development_officer: { icon: <Users size={24} />,  color: "#1B6CA8", gradient: "linear-gradient(145deg,#2580C8,#1B6CA8)" },
  reg_secretary:                { icon: <Shield size={24} />, color: CRIMSON,   gradient: `linear-gradient(145deg,#8B1220,${CRIMSON})` },
};

function RoleCard({
  role, label, sub, selected, onClick, si,
}: {
  role: UserType; label: string; sub: string;
  selected: boolean; onClick: () => void; si: boolean;
}) {
  const [hov, setHov] = useState(false);
  const meta = ROLE_META[role];

  return (
    <motion.button
      type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileTap={{ scale: 0.97 }}
      style={{
        width: "100%", cursor: "pointer", textAlign: "left",
        borderRadius: 16,
        padding: "clamp(14px,2vh,20px) clamp(14px,2.5vw,22px)",
        display: "flex", flexDirection: "row", alignItems: "center", gap: 16,
        border: `1.5px solid ${selected ? GOLD : hov ? "rgba(200,163,77,0.32)" : "rgba(200,163,77,0.16)"}`,
        background: selected
          ? "linear-gradient(160deg,#FFFBF0 0%,#FFF5D6 100%)"
          : hov ? "linear-gradient(160deg,#FEFCF9,#FAF8F2)" : "#FAFAF6",
        boxShadow: selected
          ? `0 0 0 3px rgba(200,163,77,0.14),0 10px 32px rgba(166,124,0,0.14),inset 0 1px 0 rgba(255,255,255,0.92)`
          : hov
            ? `0 4px 20px rgba(166,124,0,0.09),inset 0 1px 0 rgba(255,255,255,0.80)`
            : `inset 0 1px 0 rgba(255,255,255,0.70)`,
        transition: "all .24s ease",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Top shimmer accent */}
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 2,
        background: selected
          ? `linear-gradient(90deg,transparent,${GOLD},transparent)`
          : hov
            ? `linear-gradient(90deg,transparent,rgba(200,163,77,0.30),transparent)`
            : "transparent",
        transition: "background .24s ease",
      }} />

      {/* Selection check */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            style={{
              position: "absolute", top: 10, right: 10,
              width: 22, height: 22, borderRadius: "50%",
              background: `linear-gradient(135deg,${GOLD},${DEEP_GOLD})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(166,124,0,0.30)",
            }}
          >
            <Check size={11} color="#fff" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon */}
      <div style={{
        width: 54, height: 54, borderRadius: 14, flexShrink: 0,
        background: selected ? meta.gradient : hov ? `${meta.color}15` : "rgba(17,17,17,0.05)",
        border: `1px solid ${selected ? "rgba(255,255,255,0.22)" : `${meta.color}22`}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: selected ? "#fff" : hov ? meta.color : "rgba(17,17,17,0.28)",
        boxShadow: selected ? `0 6px 18px ${meta.color}40` : "none",
        transition: "all .24s ease",
      }}>
        {meta.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontWeight: 700,
          fontSize: "clamp(0.84rem,1.8vw,0.98rem)",
          fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
          color: selected ? "#6B4800" : hov ? CHARCOAL : "rgba(17,17,17,0.72)",
          lineHeight: 1.3, transition: "color .24s ease",
        }}>
          {label}
        </p>
        <p style={{
          margin: "3px 0 0", fontWeight: 400,
          fontSize: "clamp(0.72rem,1.4vw,0.82rem)",
          fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
          color: selected ? "rgba(107,72,0,0.62)" : "rgba(17,17,17,0.42)",
          lineHeight: 1.3, transition: "color .24s ease",
        }}>
          {sub}
        </p>
      </div>
    </motion.button>
  );
}

/* ─── Error banner ───────────────────────────────────────────────────────── */
function ErrorBanner({ msg, si }: { msg: string; si: boolean }) {
  const w = useWindowWidth();
  const isTablet = w >= 640 && w < 1024;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: "9px 13px", borderRadius: 10,
        background: "rgba(220,38,38,0.06)",
        border: "1px solid rgba(220,38,38,0.16)",
        display: "flex", alignItems: "center", gap: 8,
      }}
    >
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
      <span style={{
        fontSize: isTablet ? 15 : 13, color: "#B91C1C", fontWeight: 500,
        fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
      }}>
        {msg}
      </span>
    </motion.div>
  );
}

/* ─── Reusable: DocDropzone ──────────────────────────────────────────────── */
function DocDropzone({
  label, file, onSelect, onRemove, error, delay = 0, locale = "en", dropHint, dropActive, removeLabel,
}: {
  label: string; file: File | null;
  onSelect: (f: File) => void; onRemove: () => void;
  error?: string; delay?: number; locale?: Locale;
  dropHint: string; dropActive: string; removeLabel: string;
}) {
  const si = locale === "si";
  const ff = si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif";
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    multiple: false,
    onDrop: (accepted) => { if (accepted[0]) onSelect(accepted[0]); },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease }}
    >
      <p style={{
        margin: "0 0 6px 2px", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
        color: "rgba(17,17,17,0.52)", fontFamily: ff,
      }}>
        {label}
      </p>

      {file && previewUrl ? (
        <div style={{
          position: "relative", borderRadius: 12, overflow: "hidden",
          border: `1.5px solid ${error ? "rgba(239,68,68,0.55)" : "rgba(200,163,77,0.30)"}`,
          background: "#FAF8F3",
        }}>
          <img src={previewUrl} alt={label} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", background: "rgba(255,253,248,0.92)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <FileImage size={14} color={GOLD} style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: 12, color: "rgba(17,17,17,0.62)", fontFamily: ff,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {file.name}
              </span>
            </div>
            <button
              type="button" onClick={onRemove}
              style={{
                display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                background: "none", border: "none", cursor: "pointer",
                color: "#DC2626", fontSize: 12, fontWeight: 600, fontFamily: ff, padding: 4,
              }}
            >
              <Trash2 size={13} /> {removeLabel}
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          style={{
            borderRadius: 12, cursor: "pointer",
            border: `1.5px dashed ${error ? "rgba(239,68,68,0.55)" : isDragActive ? GOLD : "rgba(200,163,77,0.34)"}`,
            background: isDragActive ? "rgba(200,163,77,0.08)" : "#FAF8F3",
            padding: "22px 14px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            transition: "all .2s ease", textAlign: "center",
          }}
        >
          <input {...getInputProps()} />
          <UploadCloud size={22} color={isDragActive ? GOLD : "rgba(17,17,17,0.32)"} />
          <span style={{ fontSize: 12.5, color: "rgba(17,17,17,0.46)", fontFamily: ff, lineHeight: 1.4 }}>
            {isDragActive ? dropActive : dropHint}
          </span>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            style={{ margin: "4px 4px 0", fontSize: 11.5, fontFamily: ff, color: "#DC2626", lineHeight: 1.4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [data, setData]       = useState<FormData>(INIT);
  const [errors, setErrors]   = useState<Errors>({});
  const [banner, setBanner]   = useState("");
  const w = useWindowWidth();
  const isTablet = w >= 640 && w < 1024;
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dir, setDir]             = useState(1);
  const cardRef                   = useRef<HTMLDivElement>(null);

  const locale = (data.language || "en") as Locale;
  const si     = locale === "si";
  const T      = STRINGS[locale];

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => {
    setData(d => {
      const next = { ...d, [k]: v };
      if (k === "district") { next.ds = ""; next.gnDiv = ""; }
      if (k === "ds")       { next.gnDiv = ""; }
      return next;
    });
    setErrors(e => ({ ...e, [k]: undefined }));
    setBanner("");
  }, []);

  const filteredDs  = useMemo(() => DIVISIONAL_SECRETARIATS.filter(ds => ds.districtId === data.district), [data.district]);
  const filteredGns = useMemo(() => GN_DIVISIONS.filter(gn => gn.dsId === data.ds), [data.ds]);

  /* ── Validation ── */
  const validateStep = useCallback((s: number): boolean => {
    const err: Errors = {};

    if (s === 0) {
      if (!data.language) { setBanner(si ? "භාෂාව තෝරන්න" : "Please select a language"); return false; }
    }
    if (s === 1) {
      if (!data.userType) { setBanner(si ? "භූමිකාව තෝරන්න" : "Please select your role"); return false; }
    }
    if (s === 2) {
      if (!data.district) err.district = si ? "දිස්ත්‍රික්කය තෝරන්න" : "Select a district";
      if (!data.ds)       err.ds       = si ? "ප්‍රාදේශීය ලේකම් කාර්යාලය තෝරන්න" : "Select a Divisional Secretariat";
      if (data.userType === "economic_development_officer") {
        if (!data.gnDiv)    err.gnDiv    = si ? "ග්‍රාම නිලධාරී වසම තෝරන්න" : "Select a GN Division";
      }
      if (data.userType === "economic_development_officer") {
        if (!data.localGovt) err.localGovt = si ? "අවශ්‍යයි" : "Required";
        if (!data.electoral) err.electoral = si ? "අවශ්‍යයි" : "Required";
        if (!data.farmers)   err.farmers   = si ? "අවශ්‍යයි" : "Required";
        if (!data.eduZone)   err.eduZone   = si ? "අවශ්‍යයි" : "Required";
        if (!data.eduDiv)    err.eduDiv    = si ? "අවශ්‍යයි" : "Required";
        if (!data.mahaweli)  err.mahaweli  = si ? "අවශ්‍යයි" : "Required";
      }
    }
    if (s === 3) {
      if (!data.firstName.trim() || data.firstName.trim().length < 2)
        err.firstName = si ? "වලංගු නමක් ඇතුළත් කරන්න" : "Enter a valid first name";
      if (!data.lastName.trim() || data.lastName.trim().length < 2)
        err.lastName  = si ? "වලංගු නමක් ඇතුළත් කරන්න" : "Enter a valid last name";
      if (!data.fullName.trim() || data.fullName.trim().length < 4)
        err.fullName  = si ? "සම්පූර්ණ නම ඇතුළත් කරන්න" : "Enter your full name";
      if (!/^([0-9]{9}[VvXx]|[0-9]{12})$/.test(data.nic.trim()))
        err.nic       = si ? "වලංගු ජා.හැ.පත. අංකයක් ඇතුළත් කරන්න" : "Invalid NIC (e.g. 123456789V or 200012345678)";
      if (!/^07[0-9]{8}$/.test(data.mobile.trim()))
        err.mobile    = si ? "වලංගු දුරකථන අංකය (07XXXXXXXX)" : "Invalid mobile (07XXXXXXXX)";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        err.email     = si ? "වලංගු විද්‍යුත් ලිපිනයක් ඇතුළත් කරන්න" : "Enter a valid email address";
      if (data.password.length < 8 || !/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password) || !/[^A-Za-z0-9]/.test(data.password))
        err.password  = si ? "මුරපදය ශක්තිමත් නොවේ" : "Password too weak – need 8+ chars, uppercase, number & symbol";
      if (data.password !== data.confirmPwd)
        err.confirmPwd = si ? "මුරපද නොගැළපේ" : "Passwords do not match";
    }
    if (s === 4) {
      if (!data.docType) {
        (err as any).docType = si ? "ලේඛන වර්ගය තෝරන්න" : "Please select a document type";
      }
      const checkFile = (f: File | null, requiredMsg: string): string | undefined => {
        if (!f) return requiredMsg;
        if (f.size > MAX_DOC_BYTES) return T.fileTooLarge;
        if (!ALLOWED_DOC_TYPES.includes(f.type)) return T.fileWrongType;
        return undefined;
      };
      const frontErr = checkFile(data.docFront, si ? "ඉදිරි පැත්තේ රූපය අවශ්‍යයි" : "Front-side image is required");
      if (frontErr) (err as any).docFront = frontErr;
      if (data.docType !== "PASSPORT") {
        const backErr = checkFile(data.docBack, si ? "පසුපස රූපය අවශ්‍යයි" : "Back-side image is required");
        if (backErr) (err as any).docBack = backErr;
      }
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      setBanner(si ? "කරුණාකර සියලු ක්ෂේත්‍ර සම්පූර්ණ කරන්න" : "Please complete all required fields");
      return false;
    }
    return true;
  }, [data, si]);

  const scrollTop = () => cardRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const next = useCallback(() => {
    if (!validateStep(step)) return;
    setDir(1); setStep(s => s + 1); setBanner(""); setErrors({});
    setTimeout(scrollTop, 80);
  }, [step, validateStep]);

  const back = useCallback(() => {
    setDir(-1); setStep(s => s - 1); setBanner(""); setErrors({});
    setTimeout(scrollTop, 80);
  }, []);

  const submit = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    setBanner("");
    try {
      const roleMap: Record<string, string> = {
        economic_development_officer: "economic-development-officer",
        reg_secretary:                "regional-secretary",
      };
      const fd = new FormData();
      fd.append("firstName",  data.firstName.trim());
      fd.append("lastName",   data.lastName.trim());
      fd.append("name",       data.fullName.trim());
      fd.append("email",      data.email.trim().toLowerCase());
      fd.append("phone",      data.mobile.trim());
      fd.append("nic",        data.nic.trim());
      fd.append("password",   data.password);
      fd.append("role",       roleMap[data.userType as string] ?? "");
      fd.append("district",   data.district);
      fd.append("dsDivision", data.ds);
      if (data.userType === "economic_development_officer") {
        fd.append("gnDivision", data.gnDiv);
        fd.append("localGovt",  data.localGovt.trim());
        fd.append("electoral",  data.electoral.trim());
        fd.append("farmers",    data.farmers.trim());
        fd.append("eduZone",    data.eduZone.trim());
        fd.append("eduDiv",     data.eduDiv.trim());
        fd.append("mahaweli",   data.mahaweli.trim());
      }
      fd.append("docType", data.docType);
      if (data.docFront) fd.append("docFront", data.docFront);
      if (data.docBack)  fd.append("docBack", data.docBack);

      const res  = await fetch("/api/registrations", { method: "POST", body: fd });
      const json = await res.json() as { ok: boolean; message?: string };
      if (!res.ok) {
        setBanner(json.message ?? (si ? "දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න." : "An error occurred. Please try again."));
        return;
      }
      setSubmitted(true);
    } catch {
      setBanner(si ? "සේවා දෝෂයක්. නැවත උත්සාහ කරන්න." : "Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  /* ── Step content ──
     NOTE: called directly as StepContent() (not rendered as <StepContent/>).
     It closes over `step`/`data` and returns JSX for the active step. If it were
     rendered as a JSX component, React would see a new component type on every
     re-render (every keystroke) and remount the subtree, dropping input focus
     after a single character. */
  function StepContent() {
    switch (step) {
      /* ── Step 0: Language ── */
      case 0: return (
        <div>
          <div style={{ marginBottom: "clamp(18px,3vh,28px)" }}>
            <h3 style={{ margin: 0, fontSize: "clamp(1.1rem,3vw,1.5rem)", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.03em" }}>
              {STRINGS.en.langTitle}
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: isTablet ? 15 : 13.5, color: "rgba(17,17,17,0.42)", fontFamily: "'Inter',system-ui,sans-serif" }}>
              {STRINGS.en.langSub}
            </p>
          </div>
          <div style={{ display: "flex", gap: "clamp(10px,2vw,18px)", flexWrap: "wrap" }}>
            <LangCard locale="en" selected={data.language === "en"} onClick={() => set("language", "en")} />
            <LangCard locale="si" selected={data.language === "si"} onClick={() => set("language", "si")} />
          </div>
        </div>
      );

      /* ── Step 1: Role ── */
      case 1: return (
        <div>
          <div style={{ marginBottom: "clamp(16px,2.5vh,26px)" }}>
            {/* Decorative rule */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,transparent,rgba(200,163,77,0.28))" }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(200,163,77,0.48)" }} />
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left,transparent,rgba(200,163,77,0.28))" }} />
            </div>
            <h3 style={{
              margin: 0, fontSize: "clamp(1.35rem,3.5vw,1.9rem)",
              fontFamily: "'Playfair Display',Georgia,serif",
              fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.03em", textAlign: "center",
            }}>
              {T.roleTitle}
            </h3>
            <p style={{
              margin: "8px 0 0", fontSize: "clamp(0.82rem,1.8vw,1rem)", textAlign: "center",
              color: "rgba(17,17,17,0.42)",
              fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
            }}>
              {T.roleSub}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.4vh,12px)" }}>
            {(["economic_development_officer", "reg_secretary"] as UserType[]).map(role => (
              <RoleCard
                key={role} role={role}
                label={role === "economic_development_officer" ? T.gnLabel : T.rsLabel}
                sub={role === "economic_development_officer" ? T.gnSub : T.rsSub}
                selected={data.userType === role}
                onClick={() => set("userType", role)}
                si={si}
              />
            ))}
          </div>
        </div>
      );

      /* ── Step 2: Location ── */
      case 2: return (
        <div>
          <div style={{ marginBottom: "clamp(14px,2.5vh,22px)" }}>
            <h3 style={{
              margin: 0, fontSize: "clamp(1.1rem,3vw,1.5rem)",
              fontFamily: "'Playfair Display',Georgia,serif",
              fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.03em",
            }}>
              {T.locTitle}
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: isTablet ? 15 : 13, color: "rgba(17,17,17,0.42)", fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif" }}>
              {T.locSub}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px,1.8vh,16px)" }}>
            {/* District */}
            <PremiumSelect
              id="district" label={T.district} value={data.district} locale={locale}
              onChange={v => set("district", v)}
              options={DISTRICTS} placeholder={T.selectDistrict}
              icon={<MapPin size={16} />} error={errors.district} delay={0.05}
              bilingual
            />

            {/* DS */}
            <PremiumSelect
              id="ds" label={T.ds} value={data.ds} locale={locale}
              onChange={v => set("ds", v)}
              options={filteredDs} placeholder={T.selectDs}
              icon={<Building2 size={16} />} error={errors.ds}
              disabled={!data.district} delay={0.10}
              bilingual
            />

            {/* GN Division — for Economic Development Officer */}
            {data.userType === "economic_development_officer" && (
              <PremiumSelect
                id="gnDiv" label={T.gn} value={data.gnDiv} locale={locale}
                onChange={v => set("gnDiv", v)}
                options={filteredGns} placeholder={T.selectGn}
                icon={<MapPin size={16} />} error={errors.gnDiv}
                disabled={!data.ds} delay={0.15}
                bilingual
              />
            )}

            {/* Extra Economic Development Officer fields */}
            {data.userType === "economic_development_officer" && (
              <>
                <div style={{
                  padding: "10px 14px 4px", borderRadius: 10,
                  background: "rgba(200,163,77,0.05)",
                  border: "1px solid rgba(200,163,77,0.12)",
                  display: "flex", flexDirection: "column", gap: "clamp(10px,1.8vh,16px)",
                }}>
                  <p style={{
                    margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em",
                    textTransform: "uppercase", color: DEEP_GOLD,
                    fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                  }}>
                    {si ? "ආර්ථික සංවර්ධන නිලධාරී - අතිරේක විස්තර" : "Economic Development Officer – Additional Details"}
                  </p>

                  <PremiumInput id="localGovt" label={T.localGovt} value={data.localGovt} locale={locale}
                    onChange={v => set("localGovt", v)} icon={<Building2 size={16} />}
                    hint={si ? STRINGS.en.localGovt : undefined}
                    error={errors.localGovt} delay={0.20} />

                  <PremiumInput id="electoral" label={T.electoral} value={data.electoral} locale={locale}
                    onChange={v => set("electoral", v)} icon={<MapPin size={16} />}
                    hint={si ? STRINGS.en.electoral : undefined}
                    error={errors.electoral} delay={0.25} />

                  <PremiumInput id="farmers" label={T.farmers} value={data.farmers} locale={locale}
                    onChange={v => set("farmers", v)} icon={<Building2 size={16} />}
                    hint={si ? STRINGS.en.farmers : undefined}
                    error={errors.farmers} delay={0.30} />

                  <PremiumInput id="eduZone" label={T.eduZone} value={data.eduZone} locale={locale}
                    onChange={v => set("eduZone", v)} icon={<Building2 size={16} />}
                    hint={si ? STRINGS.en.eduZone : undefined}
                    error={errors.eduZone} delay={0.35} />

                  <PremiumInput id="eduDiv" label={T.eduDiv} value={data.eduDiv} locale={locale}
                    onChange={v => set("eduDiv", v)} icon={<Building2 size={16} />}
                    hint={si ? STRINGS.en.eduDiv : undefined}
                    error={errors.eduDiv} delay={0.40} />

                  <PremiumInput id="mahaweli" label={T.mahaweli} value={data.mahaweli} locale={locale}
                    onChange={v => set("mahaweli", v)} icon={<Building2 size={16} />}
                    hint={si ? STRINGS.en.mahaweli : undefined}
                    error={errors.mahaweli} delay={0.45} />
                </div>
              </>
            )}
          </div>
        </div>
      );

      /* ── Step 3: Personal info ── */
      case 3: return (
        <div>
          <div style={{ marginBottom: "clamp(14px,2.5vh,22px)" }}>
            <h3 style={{
              margin: 0, fontSize: "clamp(1.1rem,3vw,1.5rem)",
              fontFamily: "'Playfair Display',Georgia,serif",
              fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.03em",
            }}>
              {T.personalTitle}
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: isTablet ? 15 : 13, color: "rgba(17,17,17,0.42)", fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif" }}>
              {T.personalSub}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px,1.8vh,16px)" }}>
            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(8px,1.5vw,14px)" }}>
              <PremiumInput id="firstName" label={T.firstName} value={data.firstName}
                onChange={v => set("firstName", v)} icon={<User size={16} />}
                autoComplete="given-name" error={errors.firstName} delay={0.04} locale={locale} />
              <PremiumInput id="lastName" label={T.lastName} value={data.lastName}
                onChange={v => set("lastName", v)} icon={<User size={16} />}
                autoComplete="family-name" error={errors.lastName} delay={0.08} locale={locale} />
            </div>

            <PremiumInput id="fullName" label={T.fullName} value={data.fullName}
              onChange={v => set("fullName", v)} icon={<IdCard size={16} />}
              autoComplete="name" error={errors.fullName} delay={0.12} locale={locale} />

            <PremiumInput id="nic" label={T.nic} value={data.nic}
              onChange={v => set("nic", v)} icon={<CreditCard size={16} />}
              hint={T.nicHint} error={errors.nic} delay={0.16} locale={locale} />

            <PremiumInput id="mobile" label={T.mobile} value={data.mobile}
              onChange={v => set("mobile", v)} icon={<Phone size={16} />}
              type="tel" autoComplete="tel" hint={T.mobileHint}
              error={errors.mobile} delay={0.20} locale={locale} />

            <PremiumInput id="email" label={T.email} value={data.email}
              onChange={v => set("email", v)} icon={<Mail size={16} />}
              type="email" autoComplete="email"
              error={errors.email} delay={0.24} locale={locale} />

            <PremiumInput id="password" label={T.password} value={data.password}
              onChange={v => set("password", v)} icon={<Lock size={16} />}
              type="password" autoComplete="new-password"
              hint={T.pwdHint} error={errors.password} delay={0.28} locale={locale} />

            <PremiumInput id="confirmPwd" label={T.confirmPwd} value={data.confirmPwd}
              onChange={v => set("confirmPwd", v)} icon={<Lock size={16} />}
              type="password" autoComplete="new-password"
              error={errors.confirmPwd} delay={0.32} locale={locale} />
          </div>
        </div>
      );

      /* ── Step 4: Verification document ── */
      case 4: return (
        <div>
          <div style={{ marginBottom: "clamp(14px,2.5vh,22px)" }}>
            <h3 style={{
              margin: 0, fontSize: "clamp(1.1rem,3vw,1.5rem)",
              fontFamily: "'Playfair Display',Georgia,serif",
              fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.03em",
            }}>
              {T.verifyTitle}
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: isTablet ? 15 : 13, color: "rgba(17,17,17,0.42)", fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif" }}>
              {T.verifySub}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px,1.8vh,16px)" }}>
            <PremiumSelect
              id="docType" label={T.docType} value={data.docType} locale={locale}
              onChange={v => set("docType", v as DocType)}
              options={[
                { id: "NIC",             en: STRINGS.en.docNic,      si: STRINGS.si.docNic },
                { id: "DRIVING_LICENSE", en: STRINGS.en.docLicense,  si: STRINGS.si.docLicense },
                { id: "PASSPORT",        en: STRINGS.en.docPassport, si: STRINGS.si.docPassport },
              ]}
              placeholder={T.selectDocType}
              icon={<ShieldCheck size={16} />} error={(errors as any).docType} delay={0.05}
            />

            <div style={{
              display: "grid",
              gridTemplateColumns: data.docType !== "PASSPORT" ? (w >= 640 ? "1fr 1fr" : "1fr") : "1fr",
              gap: "clamp(8px,1.5vw,14px)",
            }}>
              <DocDropzone
                label={data.docType === "PASSPORT" ? T.docFrontPassport : T.docFront}
                file={data.docFront}
                onSelect={f => set("docFront", f)}
                onRemove={() => set("docFront", null)}
                error={(errors as any).docFront}
                delay={0.10} locale={locale}
                dropHint={T.dropHint} dropActive={T.dropActive} removeLabel={T.removeFile}
              />
              {data.docType !== "PASSPORT" && (
                <DocDropzone
                  label={T.docBack}
                  file={data.docBack}
                  onSelect={f => set("docBack", f)}
                  onRemove={() => set("docBack", null)}
                  error={(errors as any).docBack}
                  delay={0.15} locale={locale}
                  dropHint={T.dropHint} dropActive={T.dropActive} removeLabel={T.removeFile}
                />
              )}
            </div>

            <div style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "12px 14px", borderRadius: 10,
              background: "rgba(27,108,168,0.06)",
              border: "1px solid rgba(27,108,168,0.16)",
            }}>
              <ShieldCheck size={15} color="#1B6CA8" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{
                margin: 0, fontSize: isTablet ? 13 : 11.5, lineHeight: 1.6,
                color: "rgba(17,17,17,0.56)",
                fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
              }}>
                {T.privacyNote}
              </p>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  }

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(150deg,#FEFCF7 0%,#FAF8F3 55%,#F2EDE1 100%)",
      position: "relative",
    }}>

      {/* ── Fixed background accents ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", left: "-10%", top: "-8%", width: "45vmax", height: "45vmax", borderRadius: "50%", background: "radial-gradient(circle,rgba(200,163,77,0.11) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", right: "-8%", bottom: "5%", width: "38vmax", height: "38vmax", borderRadius: "50%", background: "radial-gradient(circle,rgba(200,163,77,0.09) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", left: "40%", bottom: "-10%", width: "32vmax", height: "32vmax", borderRadius: "50%", background: "radial-gradient(circle,rgba(107,15,26,0.05) 0%,transparent 70%)" }} />
        <div style={{
          position: "absolute", inset: 0, opacity: 0.016,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C8A34D' stroke-width='0.4'%3E%3Crect x='15' y='15' width='50' height='50' rx='2'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Cline x1='15' y1='40' x2='36' y2='40'/%3E%3Cline x1='44' y1='40' x2='65' y2='40'/%3E%3Cline x1='40' y1='15' x2='40' y2='36'/%3E%3Cline x1='40' y1='44' x2='40' y2='65'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }} />
      </div>

      {/* ── Gold top bar ── */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        style={{
          position: "sticky", top: 0, left: 0, right: 0, height: 2, zIndex: 50,
          background: `linear-gradient(90deg,transparent,${DEEP_GOLD} 20%,${GOLD} 50%,${DEEP_GOLD} 80%,transparent)`,
        }}
      />

      {/* ── Scrollable container ── */}
      <div ref={cardRef} style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", minHeight: "calc(100dvh - 2px)",
        padding: "clamp(16px,3vh,32px) clamp(12px,4vw,24px) clamp(20px,4vh,40px)",
      }}>

        {/* ── Branding ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          style={{ display: "flex", alignItems: "center", gap: "clamp(10px,2vw,20px)", marginBottom: "clamp(16px,3vh,28px)", flexWrap: "wrap", justifyContent: "center" }}
        >
          <div style={{
            width: "clamp(44px,6.5vw,62px)", height: "clamp(44px,6.5vw,62px)",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%,rgba(255,255,255,0.92) 0%,rgba(250,248,243,0.70) 100%)",
            border: "1.5px solid rgba(200,163,77,0.44)",
            boxShadow: "0 0 0 4px rgba(200,163,77,0.06),0 6px 18px rgba(166,124,0,0.10)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Image src="/app.png" alt="Logo" width={50} height={50} priority quality={90}
              style={{ width: "clamp(28px,4vw,42px)", height: "clamp(28px,4vw,42px)", objectFit: "contain" }} />
          </div>
          <div style={{ width: 1, height: "clamp(30px,4vw,44px)", background: "linear-gradient(to bottom,transparent,rgba(200,163,77,0.40),transparent)", flexShrink: 0 }} />
          <Image src="/sp-logo.png" alt="Southern Province Planning Secretariat"
            width={380} height={58} priority quality={90}
            style={{ width: "clamp(180px,38vw,340px)", height: "auto", objectFit: "contain" }} />
        </motion.div>

        {/* System title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease }}
          style={{ textAlign: "center", marginBottom: "clamp(14px,2.5vh,24px)" }}
        >
          <h1 style={{
            fontFamily: "'Playfair Display','Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(1.5rem,5vw,3rem)",
            fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em",
            margin: "0 0 6px",
          }}>
            <span style={{ color: CRIMSON }}>Sampath</span>{" "}
            <span style={{ color: "#8B6400" }}>Pathikada</span>
          </h1>
          <p lang="si" style={{
            fontFamily: "'Yaldevi','Noto Sans Sinhala',sans-serif",
            fontSize: "clamp(0.75rem,2.2vw,1rem)",
            fontWeight: 600, color: "#8B6400", margin: 0, letterSpacing: "0.02em",
          }}>
            සම්පත් පැතිකඩ <span style={{ color: CRIMSON }}>| දකුණු පළාත</span>
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display','Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(1.1rem,3vw,1.6rem)",
            fontWeight: 800, letterSpacing: "-0.02em",
            color: CHARCOAL, margin: "8px 0 0", lineHeight: 1.1,
          }}>
            {si ? "ලියාපදිංචි වීම" : "Registration"}
          </h2>
        </motion.div>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38, ease }}
          style={{ width: "min(100%,680px)" }}
        >
          <div style={{
            borderRadius: "clamp(16px,2vw,24px)",
            background: "#FEFCF8",
            border: "1px solid rgba(200,163,77,0.18)",
            boxShadow: "0 20px 64px rgba(0,0,0,0.08),0 6px 20px rgba(166,124,0,0.06),inset 0 1px 0 rgba(255,255,255,1)",
            overflow: "hidden",
          }}>
            {/* Card top gradient */}
            <div style={{ height: 2, background: `linear-gradient(90deg,transparent 8%,${GOLD}60 50%,transparent 92%)` }} />

            <div style={{ padding: "clamp(20px,4vw,44px) clamp(18px,5vw,48px) clamp(20px,4vw,36px)" }}>

              {submitted ? (
                /* ── Success state ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease }}
                  style={{ textAlign: "center", padding: "clamp(16px,3vh,32px) 0" }}
                >
                  {/* Animated check circle */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.1 }}
                    style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: "linear-gradient(145deg,#2D9A52,#1B7A3E)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto clamp(16px,2.5vh,24px)",
                      boxShadow: "0 8px 32px rgba(45,154,82,0.30),0 0 0 8px rgba(45,154,82,0.10)",
                    }}
                  >
                    <Check size={38} color="#fff" strokeWidth={2.8} />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    style={{
                      margin: "0 0 10px",
                      fontFamily: "'Playfair Display',Georgia,serif",
                      fontSize: "clamp(1.35rem,4vw,1.85rem)",
                      fontWeight: 800, letterSpacing: "-0.03em",
                      color: CHARCOAL,
                    }}
                  >
                    {si ? "ලියාපදිංචිය සාර්ථකයි!" : "Registration Submitted!"}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    style={{
                      margin: "0 0 clamp(18px,3vh,28px)",
                      fontSize: isTablet ? 16 : 14,
                      color: "rgba(17,17,17,0.52)",
                      lineHeight: 1.7,
                      fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                    }}
                  >
                    {si
                      ? "ඔබේ ලියාපදිංචිය සාර්ථකව ලැබී ඇත. සුපිරි පරිපාලක විසින් සමාලෝචනය කිරීමෙන් පසු ඔබට දැනුම් දෙනු ලැබේ."
                      : "Your registration has been received. You will be notified once a Super Admin reviews and approves your application."}
                  </motion.p>

                  {/* Info box */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.46 }}
                    style={{
                      padding: "14px 18px", borderRadius: 12, marginBottom: "clamp(18px,3vh,28px)",
                      background: "rgba(200,163,77,0.06)",
                      border: "1px solid rgba(200,163,77,0.20)",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: GOLD, flexShrink: 0, marginTop: 6,
                      }} />
                      <p style={{
                        margin: 0, fontSize: isTablet ? 14 : 12.5, lineHeight: 1.65,
                        color: "rgba(17,17,17,0.55)",
                        fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                      }}>
                        {si
                          ? `ලියාපදිංචි ඊමේල් ලිපිනය: ${data.email} — මෙම ලිපිනයට තත්ව යාවත්කාලීනයන් ලැබෙනු ඇත.`
                          : `Registered email: ${data.email} — status updates will be sent to this address.`}
                      </p>
                    </div>
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={() => router.push("/auth/login")}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.54 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: "100%", height: "clamp(44px,6vh,56px)",
                      borderRadius: 11, cursor: "pointer",
                      background: "linear-gradient(160deg,#D4AA55 0%,#C8A34D 40%,#A67C00 100%)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      boxShadow: "0 8px 28px rgba(166,124,0,0.28),0 3px 8px rgba(166,124,0,0.16)",
                      fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                      fontSize: isTablet ? 15 : 14, fontWeight: 700,
                      letterSpacing: si ? "0.02em" : "0.08em",
                      color: "#fff", textTransform: si ? "none" : "uppercase",
                    }}
                  >
                    {si ? "පිවිසීමට යන්න" : "Go to Sign In"}
                  </motion.button>
                </motion.div>
              ) : (
                /* ── Multi-step form ── */
                <>
                  {/* Progress bar */}
                  <StepBar step={step} labels={T.stepLabels} />

                  {/* Error banner */}
                  <AnimatePresence>
                    {banner && <ErrorBanner msg={banner} si={si} />}
                  </AnimatePresence>

                  {/* Animated step content */}
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.32, ease }}
                    >
                      {StepContent()}
                    </motion.div>
                  </AnimatePresence>

                  {/* ── Nav buttons ── */}
                  <div style={{
                    display: "flex", gap: 12,
                    marginTop: "clamp(16px,3vh,28px)",
                    flexDirection: step === 0 ? "row-reverse" : "row",
                  }}>
                    {step > 0 && (
                      <motion.button
                        type="button" onClick={back}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 7,
                          height: "clamp(44px,6vh,56px)",
                          padding: "0 clamp(16px,3vw,24px)",
                          borderRadius: 11,
                          border: "1.5px solid rgba(200,163,77,0.55)",
                          background: "#FAFAF5",
                          cursor: "pointer", flexShrink: 0,
                          fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                          fontSize: isTablet ? 15 : 14, fontWeight: 600, color: "rgba(17,17,17,0.78)",
                          transition: "all .2s ease",
                        }}
                      >
                        <ArrowLeft size={isTablet ? 17 : 15} />
                        {T.back}
                      </motion.button>
                    )}

                    <motion.button
                      type="button"
                      onClick={step < 4 ? next : submit}
                      disabled={loading}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="group"
                      style={{
                        flex: 1, height: "clamp(44px,6vh,56px)",
                        borderRadius: 11, cursor: loading ? "wait" : "pointer",
                        background: "linear-gradient(160deg,#D4AA55 0%,#C8A34D 40%,#A67C00 100%)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.12) inset,0 1px 0 rgba(255,255,255,0.20) inset,0 8px 28px rgba(166,124,0,0.30),0 3px 8px rgba(166,124,0,0.18)",
                        position: "relative", overflow: "hidden",
                      }}
                    >
                      <span className="pointer-events-none absolute -inset-full top-0 h-full w-1/2 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[350%] transition-all duration-700"
                        style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)" }} />
                      <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {loading ? (
                          <>
                            <motion.div
                              style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.30)", borderTopColor: "#fff" }}
                              animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                            />
                            <span style={{ fontFamily: "'Inter',system-ui,sans-serif", fontWeight: 700, fontSize: isTablet ? 15 : 13.5, letterSpacing: "0.08em", color: "#fff", textTransform: "uppercase" }}>
                              {T.submitting}
                            </span>
                          </>
                        ) : (
                          <span style={{
                            fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                            fontWeight: 700, fontSize: isTablet ? 15 : "clamp(12px,1.6vw,14px)",
                            letterSpacing: si ? "0.02em" : "0.08em",
                            color: "#fff", textTransform: si ? "none" : "uppercase",
                          }}>
                            {step < 4 ? T.next : T.submit}
                          </span>
                        )}
                      </span>
                    </motion.button>
                  </div>

                  {/* Sign in link */}
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      textAlign: "center", margin: "clamp(14px,2.5vh,22px) 0 0",
                      fontFamily: si ? "'Yaldevi','Noto Sans Sinhala',sans-serif" : "'Inter',system-ui,sans-serif",
                      fontSize: isTablet ? 15 : 13, color: "rgba(17,17,17,0.42)",
                    }}
                  >
                    {T.hasAccount}{" "}
                    <Link href="/auth/login" style={{ color: DEEP_GOLD, fontWeight: 700, textDecoration: "none" }}>
                      {T.signIn}
                    </Link>
                  </motion.p>
                </>
              )}

            </div>
          </div>
        </motion.div>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: "clamp(16px,3vh,28px)",
            textAlign: "center",
            fontFamily: "'Inter',system-ui,sans-serif",
            fontSize: isTablet ? "0.78rem" : "clamp(0.58rem,0.85vw,0.78rem)",
            color: "rgba(17,17,17,0.32)", letterSpacing: "0.03em",
          }}
        >
          Southern Province Planning Secretariat
          <span style={{ margin: "0 7px", color: "rgba(139,100,0,0.28)" }}>·</span>
          © {new Date().getFullYear()} Sampath Pathikada · All rights reserved
        </motion.footer>
      </div>
    </div>
  );
}
