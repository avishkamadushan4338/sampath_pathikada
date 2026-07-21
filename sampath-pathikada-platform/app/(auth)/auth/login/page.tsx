"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Clock, Home } from "lucide-react";

const GOLD      = "#C8A34D";
const DEEP_GOLD = "#A67C00";
const CRIMSON   = "#6B0F1A";
const CHARCOAL  = "#111111";
const ease      = [0.16, 1, 0.3, 1] as const;

/* ── Input ───────────────────────────────────────────────────────────────── */
function PremiumInput({
  id, label, type, value, onChange, icon, autoComplete, delay,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode;
  autoComplete?: string; delay: number;
}) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPwd ? "text" : "password") : type;
  const lifted     = focused || value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      {/* outer wrapper — sets border/bg, uses flex column */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        height: "clamp(58px,8vh,72px)",
        borderRadius: 11,
        border: `1.5px solid ${focused ? GOLD : "rgba(200,163,77,0.28)"}`,
        background: focused ? "#FFFDF8" : "#FAF8F3",
        boxShadow: focused ? "0 0 0 3px rgba(200,163,77,0.10)" : "none",
        transition: "border-color .2s, box-shadow .2s, background .2s",
        padding: "0 42px 0 42px",
        overflow: "hidden",
      }}>
        {/* icon — absolute, centered vertically */}
        <div style={{
          position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
          display: "flex", pointerEvents: "none", zIndex: 1,
          color: focused ? GOLD : "rgba(17,17,17,0.28)", transition: "color .2s",
        }}>
          {icon}
        </div>

        {/* label — slides up when lifted */}
        <label htmlFor={id} style={{
          display: "block",
          fontSize: lifted ? 11 : 16,
          fontWeight: lifted ? 600 : 400,
          lineHeight: 1,
          letterSpacing: lifted ? "0.07em" : "0em",
          color: focused ? GOLD : lifted ? "rgba(17,17,17,0.45)" : "rgba(17,17,17,0.34)",
          fontFamily: "'Inter',system-ui,sans-serif",
          pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
          marginBottom: lifted ? 3 : 0,
          marginTop: lifted ? 0 : 0,
          transition: "font-size .15s ease, color .15s ease, margin .15s ease, letter-spacing .15s ease",
        }}>
          {lifted ? label : ""}
        </label>

        {/* real placeholder when not lifted */}
        {!lifted && (
          <div style={{
            position: "absolute", left: 42, top: "50%", transform: "translateY(-50%)",
            fontSize: 16, fontWeight: 400,
            color: "rgba(17,17,17,0.34)",
            fontFamily: "'Inter',system-ui,sans-serif",
            pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
          }}>
            {label}
          </div>
        )}

        {/* input */}
        <input
          id={id} type={inputType} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          placeholder=""
          style={{
            display: "block",
            width: "100%",
            paddingRight: isPassword ? 30 : 0,
            fontSize: 16,
            fontFamily: "'Inter',system-ui,sans-serif",
            fontWeight: 500, color: CHARCOAL, caretColor: GOLD,
            background: "transparent", border: "none", outline: "none",
            boxShadow: "none", padding: 0,
            lineHeight: 1.2,
          }}
        />

        {/* eye toggle */}
        {isPassword && (
          <button type="button" tabIndex={-1}
            onClick={() => setShowPwd(p => !p)}
            aria-label={showPwd ? "Hide" : "Show"}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              display: "flex", background: "none", border: "none",
              padding: 0, cursor: "pointer", zIndex: 1,
              color: focused ? GOLD : "rgba(17,17,17,0.28)", transition: "color .2s",
            }}
          >
            {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [pendingReview, setPendingReview] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Please enter your credentials."); return; }
    setError(""); setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.pending) {
          setPendingMessage(data.message ?? "Your registration is still under review by a Super Admin.");
          setPendingReview(true);
          setLoading(false);
          return;
        }
        setError(data.message ?? "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      router.push(data.redirectTo ?? "/super-admin/dashboard");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    /*
      Root: position fixed, 100dvh × 100dvw — nothing can scroll out.
      Grid rows: 2px top-rule | 1fr main | auto footer
      Main on mobile : single column, branding + card stacked, both scroll-free
      Main on lg+    : two columns 52/48, each filling the 1fr row
    */
    <div style={{
      position: "fixed", inset: 0,
      display: "grid",
      gridTemplateRows: "2px 1fr auto",
      background: "linear-gradient(150deg,#FEFCF7 0%,#FAF8F3 55%,#F2EDE1 100%)",
      overflow: "hidden",
    }}>

      {/* ── static bg accents (no filter, no GPU layer) ── */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", left:"-10%", top:"-8%", width:"40vmax", height:"40vmax", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(200,163,77,0.12) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", right:"-8%", top:"-6%", width:"35vmax", height:"35vmax", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(200,163,77,0.09) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", left:"-6%", bottom:"-8%", width:"32vmax", height:"32vmax", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(200,163,77,0.09) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse 70% 60% at 50% 46%,rgba(200,163,77,0.05) 0%,transparent 70%)" }}/>
        {/* geometric tile */}
        <div style={{ position:"absolute", inset:0, opacity:0.016,
          backgroundImage:`url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C8A34D' stroke-width='0.4'%3E%3Crect x='15' y='15' width='50' height='50' rx='2'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Cline x1='15' y1='40' x2='36' y2='40'/%3E%3Cline x1='44' y1='40' x2='65' y2='40'/%3E%3Cline x1='40' y1='15' x2='40' y2='36'/%3E%3Cline x1='40' y1='44' x2='40' y2='65'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize:"80px 80px" }}/>
      </div>

      {/* ── top gold rule (grid row 0) ── */}
      <motion.div
        initial={{ scaleX:0, opacity:0 }} animate={{ scaleX:1, opacity:1 }}
        transition={{ duration:1.6, ease:"easeOut" }}
        style={{ background:`linear-gradient(90deg,transparent,${DEEP_GOLD} 20%,${GOLD} 50%,${DEEP_GOLD} 80%,transparent)`, zIndex:10 }}
      />

      {/* ════════════════ MAIN (grid row 1) ════════════════ */}
      <main style={{
        position: "relative", zIndex: 1,
        display: "grid",
        /* mobile: single col | lg: 52% divider 48% */
        gridTemplateColumns: "1fr",
        gridTemplateRows: "auto auto",
        overflow: "hidden",
        alignContent: "center",
      }}
        className="lg:grid! lg:grid-cols-[52%_1px_48%]! lg:grid-rows-[1fr]!"
      >

        {/* ── BRANDING (left on lg, top on mobile) ── */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          /* clamp padding so nothing overflows at any size */
          padding: "clamp(10px,2vh,32px) clamp(20px,5vw,80px) clamp(4px,0.8vh,12px)",
          gap: "clamp(6px,1.2vh,14px)",
          overflow: "hidden",
        }}
          className="lg:items-start"
        >
          {/* logos */}
          <motion.div
            initial={{ opacity:0, y:18, scale:0.95 }}
            animate={{ opacity:1, y:0,  scale:1 }}
            transition={{ duration:1.0, delay:0.15, ease }}
            style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              gap:"clamp(10px,2.2vw,28px)", flexWrap:"wrap",
            }}
            className="lg:justify-start"
          >
            {/* globe ring */}
            <div style={{
              flexShrink:0,
              width:"clamp(64px,9vw,100px)", height:"clamp(64px,9vw,100px)",
              borderRadius:"50%",
              background:"radial-gradient(circle at 35% 35%,rgba(255,255,255,0.92) 0%,rgba(250,248,243,0.70) 100%)",
              border:"1.5px solid rgba(200,163,77,0.44)",
              boxShadow:"0 0 0 5px rgba(200,163,77,0.06),0 0 0 11px rgba(200,163,77,0.025),0 8px 24px rgba(166,124,0,0.12),inset 0 1px 0 rgba(255,255,255,0.85)",
              display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
            }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%",
                background:"conic-gradient(from 130deg,transparent 40%,rgba(200,163,77,0.26) 55%,transparent 70%)" }}/>
              <Image src="/app.png" alt="Southern Provincial Council"
                width={90} height={90} priority quality={100}
                style={{
                  width:"clamp(40px,5.5vw,68px)", height:"clamp(40px,5.5vw,68px)",
                  objectFit:"contain", position:"relative", zIndex:1,
                  filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.10))",
                }}
              />
            </div>

            {/* vertical divider */}
            <div style={{
              width:1, height:"clamp(46px,7vw,76px)", flexShrink:0,
              background:"linear-gradient(to bottom,transparent,rgba(200,163,77,0.50),transparent)",
            }}/>

            {/* sp-logo */}
            <Image src="/sp-logo.png" alt="Southern Province Planning Secretariat"
              width={380} height={58} priority quality={100}
              style={{
                width:"clamp(250px,55vw,540px)", height:"auto",
                objectFit:"contain", flexShrink:0,
              }}
            />
          </motion.div>

          {/* gold rule */}
          <motion.div
            initial={{ scaleX:0, opacity:0 }} animate={{ scaleX:1, opacity:1 }}
            transition={{ duration:0.9, delay:0.42, ease:"easeOut" }}
            style={{
              width:"clamp(40px,7vw,80px)", height:1,
              background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
              transformOrigin:"center",
            }}
          />

          {/* system name */}
          <motion.h1
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8, delay:0.54, ease }}
            style={{
              fontFamily:"'Playfair Display','Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(1.6rem,5.5vw,4.4rem)",
              fontWeight:900, lineHeight:0.92,
              letterSpacing:"-0.04em", whiteSpace:"nowrap", margin:0,
              textAlign:"center",
            }}
            className="lg:text-left"
          >
            <span style={{ color:CRIMSON }}>Sampath</span>{" "}
            <span style={{ color:"#8B6400" }}>Pathikada</span>
          </motion.h1>

          {/* subtitle + sinhala */}
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8, delay:0.66, ease }}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"clamp(3px,0.8vh,8px)" }}
            className="lg:items-start"
          >
            <p style={{
              fontFamily:"'Inter',system-ui,sans-serif",
              fontSize:"clamp(0.66rem,1.6vw,0.90rem)",
              fontWeight:600, letterSpacing:"0.20em",
              color:"rgba(61,46,0,0.68)", textTransform:"uppercase", margin:0,
            }}>
              Digital Governance Platform
            </p>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:"clamp(18px,2.8vw,44px)", height:1, background:"linear-gradient(to right,transparent,rgba(200,163,77,0.40))" }}/>
              <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(200,163,77,0.50)" }}/>
              <div style={{ width:"clamp(18px,2.8vw,44px)", height:1, background:"linear-gradient(to left,transparent,rgba(200,163,77,0.40))" }}/>
            </div>

            <p lang="si" style={{
              fontFamily:"'Yaldevi','Noto Sans Sinhala',sans-serif",
              fontSize:"clamp(0.95rem,3vw,1.8rem)",
              fontWeight:700, letterSpacing:"0.04em", color:"#8B6400",
              margin:0, whiteSpace:"nowrap", textAlign:"center",
            }}
              className="lg:text-left"
            >
              සම්පත් පැතිකඩ
              <span style={{ color:"#A67C00", margin:"0 0.4em", fontWeight:300, opacity:0.5 }}>|</span>
              <span style={{ color:CRIMSON }}>දකුණු පළාත</span>
            </p>
          </motion.div>

        </div>

        {/* ── vertical divider (lg only) ── */}
        <motion.div
          className="hidden lg:block"
          initial={{ scaleY:0, opacity:0 }} animate={{ scaleY:1, opacity:1 }}
          transition={{ duration:1.1, delay:0.3, ease:"easeOut" }}
          style={{
            background:"linear-gradient(to bottom,transparent,rgba(200,163,77,0.24),transparent)",
            margin:"28px 0",
          }}
        />

        {/* ── LOGIN CARD (right on lg, bottom on mobile) ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"clamp(8px,1.5vh,24px) clamp(12px,3vw,36px)",
          overflow:"hidden",
        }}
          className="lg:pb-0! lg:pt-0! pt-0!"
        >
          <motion.div
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8, delay:0.45, ease }}
            style={{ width:"min(90vw,640px)" }}
          >
            {/* card */}
            <div style={{
              borderRadius: 20,
              background: "#FEFCF8",
              border: "1px solid rgba(200,163,77,0.18)",
              boxShadow: "0 16px 56px rgba(0,0,0,0.08),0 4px 16px rgba(166,124,0,0.06),inset 0 1px 0 rgba(255,255,255,1)",
              isolation: "isolate",
            }}>
              {/* gold top edge */}
              <div style={{ height:2, borderRadius:"20px 20px 0 0",
                background:`linear-gradient(90deg,transparent 10%,${GOLD}55 50%,transparent 90%)` }}/>

              <div style={{ padding:"clamp(22px,5vh,52px) clamp(22px,5vw,52px)" }}>

              {pendingReview ? (
                /* ── Under review state ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease }}
                  style={{ textAlign: "center", padding: "clamp(10px,2vh,20px) 0" }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.1 }}
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: `linear-gradient(145deg,${GOLD},${DEEP_GOLD})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto clamp(16px,2.5vh,22px)",
                      boxShadow: "0 8px 32px rgba(166,124,0,0.30),0 0 0 8px rgba(200,163,77,0.10)",
                    }}
                  >
                    <Clock size={34} color="#fff" strokeWidth={2.4} />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    style={{
                      margin: "0 0 10px",
                      fontFamily: "'Playfair Display',Georgia,serif",
                      fontSize: "clamp(1.3rem,4vw,1.75rem)",
                      fontWeight: 800, letterSpacing: "-0.03em",
                      color: CHARCOAL,
                    }}
                  >
                    Account Under Review
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    style={{
                      margin: "0 0 clamp(20px,3.2vh,30px)",
                      fontSize: "0.9rem",
                      color: "rgba(17,17,17,0.52)",
                      lineHeight: 1.7,
                      fontFamily: "'Inter',system-ui,sans-serif",
                    }}
                  >
                    {pendingMessage}
                  </motion.p>

                  <motion.button
                    type="button"
                    onClick={() => router.push("/")}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.40 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: "100%", height: "clamp(44px,6vh,56px)",
                      borderRadius: 11, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      background: "linear-gradient(160deg,#D4AA55 0%,#C8A34D 40%,#A67C00 100%)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      boxShadow: "0 8px 28px rgba(166,124,0,0.28),0 3px 8px rgba(166,124,0,0.16)",
                      fontFamily: "'Inter',system-ui,sans-serif",
                      fontSize: "0.85rem", fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#fff", textTransform: "uppercase",
                    }}
                  >
                    <Home size={14} color="#fff" strokeWidth={2.5} />
                    Back to Home
                  </motion.button>
                </motion.div>
              ) : (
              <>
                {/* card header */}
                <motion.div
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.6, delay:0.60, ease }}
                  style={{ marginBottom:"clamp(14px,2.2vh,22px)" }}
                >
                  <h2
                    className="text-[1.4rem] md:text-[2rem] lg:text-[2.2rem]"
                    style={{
                      fontFamily:"'Playfair Display',Georgia,serif",
                      fontWeight:800, color:CHARCOAL,
                      lineHeight:1.1, letterSpacing:"-0.03em",
                      margin:"0 0 4px",
                    }}>
                    Sign In
                  </h2>
                  <p
                    className="text-[0.82rem] md:text-[1rem] lg:text-[1rem]"
                    style={{
                      fontFamily:"'Inter',system-ui,sans-serif",
                      color:"rgba(17,17,17,0.44)", margin:0,
                    }}>
                    Sign in to access the governance platform.
                  </p>
                </motion.div>

                {/* error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity:0, height:0, marginBottom:0 }}
                      animate={{ opacity:1, height:"auto", marginBottom:12 }}
                      exit={{ opacity:0, height:0, marginBottom:0 }}
                      transition={{ duration:0.25 }}
                      style={{
                        padding:"9px 13px", borderRadius:9,
                        background:"rgba(220,38,38,0.06)",
                        border:"1px solid rgba(220,38,38,0.16)",
                        display:"flex", alignItems:"center", gap:8,
                      }}
                    >
                      <div style={{ width:5, height:5, borderRadius:"50%", background:"#EF4444", flexShrink:0 }}/>
                      <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"0.78rem", color:"#B91C1C", fontWeight:500 }}>
                        {error}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* form */}
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display:"flex", flexDirection:"column", gap:"clamp(10px,1.6vh,18px)", marginBottom:"clamp(12px,1.8vh,20px)" }}>
                    <PremiumInput
                      id="username" label="Email Address"
                      type="email" value={username} onChange={setUsername}
                      autoComplete="email" delay={0.70}
                      icon={
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      }
                    />
                    <PremiumInput
                      id="password" label="Password"
                      type="password" value={password} onChange={setPassword}
                      autoComplete="current-password" delay={0.78}
                      icon={
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="8" cy="11" r="1" fill="currentColor"/>
                        </svg>
                      }
                    />
                  </div>

                  {/* remember + forgot */}
                  <motion.div
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ duration:0.5, delay:0.86 }}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"clamp(12px,2vh,20px)" }}
                  >
                    <button type="button" onClick={() => setRemember(r => !r)}
                      style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", padding:0, cursor:"pointer" }}
                    >
                      <div style={{
                        width:16, height:16, borderRadius:4, flexShrink:0,
                        border: remember ? "none" : "1.5px solid rgba(200,163,77,0.38)",
                        background: remember ? `linear-gradient(135deg,${GOLD},${DEEP_GOLD})` : "#fff",
                        boxShadow: remember ? "0 2px 6px rgba(200,163,77,0.28)" : "none",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"all .18s ease",
                      }}>
                        <AnimatePresence>
                          {remember && (
                            <motion.svg
                              initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
                              exit={{ scale:0, opacity:0 }} transition={{ duration:0.15 }}
                              width="9" height="9" viewBox="0 0 10 10" fill="none"
                            >
                              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </div>
                      <span className="text-[0.75rem] md:text-[0.95rem]" style={{ fontFamily:"'Inter',system-ui,sans-serif", color:"rgba(17,17,17,0.50)", fontWeight:500 }}>
                        Remember this device
                      </span>
                    </button>

                    <Link href="/auth/forgot-password"
                      className="text-[0.75rem] md:text-[0.95rem]"
                      style={{ fontFamily:"'Inter',system-ui,sans-serif", color:DEEP_GOLD, fontWeight:600, textDecoration:"none" }}
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  {/* register link */}
                  <motion.p
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ duration:0.5, delay:0.90 }}
                    style={{ textAlign:"center", marginBottom:"clamp(10px,1.5vh,16px)", fontFamily:"'Inter',system-ui,sans-serif", fontSize:"0.82rem", color:"rgba(17,17,17,0.42)" }}
                  >
                    {"Don't have an account? "}
                    <Link href="/auth/register" style={{ color:DEEP_GOLD, fontWeight:700, textDecoration:"none" }}>
                      Register here
                    </Link>
                  </motion.p>

                  {/* submit */}
                  <motion.div
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.6, delay:0.94, ease }}
                    whileHover={{ y:-2, scale:1.012 }}
                    whileTap={{ scale:0.98 }}
                  >
                    <button
                      type="submit" disabled={loading}
                      className="group"
                      style={{
                        position:"relative", width:"100%",
                        height:"clamp(44px,6.5vh,64px)",
                        borderRadius:12,
                        background:"linear-gradient(160deg,#D4AA55 0%,#C8A34D 40%,#A67C00 100%)",
                        border:"1px solid rgba(255,255,255,0.18)",
                        boxShadow:"0 0 0 1px rgba(255,255,255,0.12) inset,0 1px 0 rgba(255,255,255,0.20) inset,0 10px 30px rgba(166,124,0,0.32),0 3px 10px rgba(166,124,0,0.22)",
                        cursor: loading ? "wait" : "pointer",
                        overflow:"hidden",
                      }}
                    >
                      <span className="pointer-events-none absolute -inset-full top-0 h-full w-1/2 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[350%] transition-all duration-700"
                        style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)" }}/>
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-px"
                        style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.36),transparent)" }}/>

                      <span style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                        {loading ? (
                          <>
                            <motion.div
                              style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff" }}
                              animate={{ rotate:360 }} transition={{ duration:0.75, repeat:Infinity, ease:"linear" }}
                            />
                            <span className="text-[0.75rem] md:text-[0.95rem]" style={{ fontFamily:"'Inter',system-ui,sans-serif", fontWeight:700, letterSpacing:"0.10em", color:"#fff", textTransform:"uppercase" }}>
                              Authenticating…
                            </span>
                          </>
                        ) : (
                          <>
                            <Lock size={13} color="#fff" strokeWidth={2.5}/>
                            <span className="text-[0.75rem] md:text-[0.95rem]" style={{ fontFamily:"'Inter',system-ui,sans-serif", fontWeight:700, letterSpacing:"0.10em", color:"#fff", textTransform:"uppercase" }}>
                              Sign In Securely
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                </form>
              </>
              )}

              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── footer (grid row 2) ── */}
      <motion.footer
        initial={{ opacity:0 }} animate={{ opacity:1 }}
        transition={{ duration:0.8, delay:1.1 }}
        style={{
          position:"relative", zIndex:1,
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"6px 16px",
          borderTop:"1px solid rgba(200,163,77,0.12)",
          background:"rgba(254,252,248,0.80)",
        }}
      >
        <p style={{
          fontFamily:"'Inter',system-ui,sans-serif",
          fontSize:"clamp(0.58rem,0.85vw,0.70rem)",
          color:"rgba(17,17,17,0.38)", letterSpacing:"0.03em",
          fontWeight:500, margin:0, textAlign:"center",
        }}>
          Southern Province Planning Secretariat
          <span style={{ margin:"0 7px", color:"rgba(139,100,0,0.30)" }}>·</span>
          © {new Date().getFullYear()} Sampath Pathikada · All rights reserved
        </p>
      </motion.footer>
    </div>
  );
}
