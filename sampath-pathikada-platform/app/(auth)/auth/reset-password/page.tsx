"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";

const GOLD      = "#C8A34D";
const DEEP_GOLD = "#A67C00";
const CHARCOAL  = "#111111";
const ease      = [0.16, 1, 0.3, 1] as const;

function PasswordInput({
  id, label, value, onChange, delay,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; delay: number;
}) {
  const [focused,  setFocused]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <motion.div
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5, delay, ease }}
    >
      <div style={{
        display:"flex", flexDirection:"column", justifyContent:"center",
        position:"relative", height:"clamp(58px,8vh,68px)",
        borderRadius:11,
        border:`1.5px solid ${focused ? GOLD : "rgba(200,163,77,0.28)"}`,
        background: focused ? "#FFFDF8" : "#FAF8F3",
        boxShadow: focused ? "0 0 0 3px rgba(200,163,77,0.10)" : "none",
        transition:"border-color .2s, box-shadow .2s, background .2s",
        padding:"0 44px 0 42px",
      }}>
        {/* lock icon */}
        <div style={{
          position:"absolute", left:13, top:"50%", transform:"translateY(-50%)",
          display:"flex", pointerEvents:"none", zIndex:1,
          color: focused ? GOLD : "rgba(17,17,17,0.28)", transition:"color .2s",
        }}>
          <KeyRound size={16} strokeWidth={1.8}/>
        </div>

        {/* floating label */}
        {lifted && (
          <label htmlFor={id} style={{
            display:"block", fontSize:11, fontWeight:600, lineHeight:1,
            letterSpacing:"0.07em",
            color: focused ? GOLD : "rgba(17,17,17,0.45)",
            fontFamily:"'Inter',system-ui,sans-serif",
            pointerEvents:"none", userSelect:"none", marginBottom:3,
            transition:"color .15s ease",
          }}>
            {label}
          </label>
        )}
        {!lifted && (
          <div style={{
            position:"absolute", left:44, top:"50%", transform:"translateY(-50%)",
            fontSize:15, fontWeight:400, color:"rgba(17,17,17,0.34)",
            fontFamily:"'Inter',system-ui,sans-serif",
            pointerEvents:"none", userSelect:"none",
          }}>
            {label}
          </div>
        )}

        <input
          id={id} type={showPwd ? "text" : "password"} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="new-password"
          style={{
            display:"block", width:"100%", fontSize:15,
            fontFamily:"'Inter',system-ui,sans-serif",
            fontWeight:500, color:CHARCOAL, caretColor:GOLD,
            background:"transparent", border:"none", outline:"none",
            boxShadow:"none", padding:"0 28px 0 0", lineHeight:1.2,
          }}
        />

        {/* eye toggle */}
        <button type="button" tabIndex={-1}
          onClick={() => setShowPwd(p => !p)}
          aria-label={showPwd ? "Hide" : "Show"}
          style={{
            position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
            display:"flex", background:"none", border:"none",
            padding:0, cursor:"pointer", zIndex:1,
            color: focused ? GOLD : "rgba(17,17,17,0.28)", transition:"color .2s",
          }}
        >
          {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
        </button>
      </div>
    </motion.div>
  );
}

/* strength bar */
function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
      style={{ overflow:"hidden" }}
    >
      <div style={{ display:"flex", gap:4, marginBottom:4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex:1, height:3, borderRadius:99,
            background: i < score ? colors[score - 1] : "rgba(17,17,17,0.10)",
            transition:"background .3s ease",
          }}/>
        ))}
      </div>
      <p style={{
        fontFamily:"'Inter',system-ui,sans-serif",
        fontSize:11, fontWeight:600,
        color: colors[score - 1] ?? "rgba(17,17,17,0.35)",
        margin:0, letterSpacing:"0.04em",
      }}>
        {labels[score - 1] ?? ""}
      </p>
    </motion.div>
  );
}

function ResetPasswordContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [newPwd,    setNewPwd]    = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    if (newPwd !== confirmPwd) {
      setError("Passwords do not match."); return;
    }
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);
    await new Promise(r => setTimeout(r, 1800));
    router.push("/auth/login");
  };

  return (
    <div style={{
      position:"fixed", inset:0,
      display:"grid", gridTemplateRows:"2px 1fr auto",
      background:"linear-gradient(150deg,#FEFCF7 0%,#FAF8F3 55%,#F2EDE1 100%)",
      overflow:"hidden",
    }}>

      {/* bg accents */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", left:"-10%", top:"-8%", width:"40vmax", height:"40vmax", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(200,163,77,0.12) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", right:"-8%", bottom:"-6%", width:"35vmax", height:"35vmax", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(200,163,77,0.09) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse 70% 60% at 50% 46%,rgba(200,163,77,0.05) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", inset:0, opacity:0.016,
          backgroundImage:`url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C8A34D' stroke-width='0.4'%3E%3Crect x='15' y='15' width='50' height='50' rx='2'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Cline x1='15' y1='40' x2='36' y2='40'/%3E%3Cline x1='44' y1='40' x2='65' y2='40'/%3E%3Cline x1='40' y1='15' x2='40' y2='36'/%3E%3Cline x1='40' y1='44' x2='40' y2='65'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize:"80px 80px" }}/>
      </div>

      {/* top gold rule */}
      <motion.div
        initial={{ scaleX:0, opacity:0 }} animate={{ scaleX:1, opacity:1 }}
        transition={{ duration:1.6, ease:"easeOut" }}
        style={{ background:`linear-gradient(90deg,transparent,${DEEP_GOLD} 20%,${GOLD} 50%,${DEEP_GOLD} 80%,transparent)`, zIndex:10 }}
      />

      {/* main */}
      <main style={{
        position:"relative", zIndex:1,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"clamp(16px,3vh,40px) clamp(16px,4vw,40px)",
        gap:"clamp(20px,3vh,36px)",
        overflow:"hidden",
      }}>

        {/* logos */}
        <motion.div
          initial={{ opacity:0, y:18, scale:0.95 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:1.0, delay:0.1, ease }}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(10px,2.2vw,28px)" }}
        >
          <div style={{
            flexShrink:0,
            width:"clamp(52px,7vw,82px)", height:"clamp(52px,7vw,82px)",
            borderRadius:"50%",
            background:"radial-gradient(circle at 35% 35%,rgba(255,255,255,0.92) 0%,rgba(250,248,243,0.70) 100%)",
            border:"1.5px solid rgba(200,163,77,0.44)",
            boxShadow:"0 0 0 5px rgba(200,163,77,0.06),0 8px 24px rgba(166,124,0,0.12),inset 0 1px 0 rgba(255,255,255,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
          }}>
            <Image src="/app.png" alt="Southern Provincial Council"
              width={82} height={82} priority quality={100}
              style={{ width:"clamp(32px,4.5vw,52px)", height:"clamp(32px,4.5vw,52px)", objectFit:"contain", position:"relative", zIndex:1 }}
            />
          </div>
          <div style={{ width:1, height:"clamp(36px,5vw,60px)", background:"linear-gradient(to bottom,transparent,rgba(200,163,77,0.50),transparent)", flexShrink:0 }}/>
          <Image src="/sp-logo.png" alt="Southern Province Planning Secretariat"
            width={380} height={58} priority quality={100}
            style={{ width:"clamp(160px,30vw,360px)", height:"auto", objectFit:"contain", flexShrink:0 }}
          />
        </motion.div>

        {/* card */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8, delay:0.35, ease }}
          style={{ width:"100%", maxWidth:"min(90vw,520px)" }}
        >
          <div style={{
            borderRadius:20,
            background:"#FEFCF8",
            border:"1px solid rgba(200,163,77,0.18)",
            boxShadow:"0 16px 56px rgba(0,0,0,0.08),0 4px 16px rgba(166,124,0,0.06),inset 0 1px 0 rgba(255,255,255,1)",
            isolation:"isolate",
          }}>
            <div style={{ height:2, borderRadius:"20px 20px 0 0",
              background:`linear-gradient(90deg,transparent 10%,${GOLD}55 50%,transparent 90%)` }}/>

            <div style={{ padding:"clamp(24px,4vh,40px) clamp(24px,4vw,40px)" }}>

              {/* icon */}
              <motion.div
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                transition={{ duration:0.6, delay:0.45, ease }}
                style={{ display:"flex", justifyContent:"center", marginBottom:"clamp(14px,2.2vh,22px)" }}
              >
                <div style={{
                  width:64, height:64, borderRadius:"50%",
                  background:"linear-gradient(135deg,rgba(200,163,77,0.12),rgba(200,163,77,0.06))",
                  border:"1.5px solid rgba(200,163,77,0.28)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 4px 20px rgba(200,163,77,0.15)",
                }}>
                  <KeyRound size={28} style={{ color:GOLD }} strokeWidth={1.6}/>
                </div>
              </motion.div>

              {/* heading */}
              <motion.div
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:0.6, delay:0.52, ease }}
                style={{ textAlign:"center", marginBottom:"clamp(20px,3vh,28px)" }}
              >
                <h2 style={{
                  fontFamily:"'Playfair Display',Georgia,serif",
                  fontSize:"clamp(1.5rem,3.5vw,2.2rem)",
                  fontWeight:800, color:CHARCOAL,
                  lineHeight:1.1, letterSpacing:"-0.03em", margin:"0 0 8px",
                }}>
                  Reset Password
                </h2>
                <p style={{
                  fontFamily:"'Inter',system-ui,sans-serif",
                  fontSize:"clamp(0.80rem,1.4vw,0.92rem)",
                  color:"rgba(17,17,17,0.48)", margin:0, lineHeight:1.6,
                }}>
                  {email ? `Create a new password for ${email}` : "Create a strong new password for your account."}
                </p>
              </motion.div>

              {/* success banner */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                    exit={{ opacity:0 }} transition={{ duration:0.3 }}
                    style={{
                      padding:"14px 16px", borderRadius:12, marginBottom:20,
                      background:"rgba(34,197,94,0.07)",
                      border:"1px solid rgba(34,197,94,0.22)",
                      display:"flex", alignItems:"center", gap:10,
                    }}
                  >
                    <CheckCircle2 size={20} style={{ color:"#22C55E", flexShrink:0 }}/>
                    <div>
                      <p style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"0.86rem", fontWeight:700, color:"#15803D", margin:"0 0 2px" }}>
                        Password reset successful!
                      </p>
                      <p style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"0.78rem", color:"#166534", margin:0 }}>
                        Redirecting you to Sign In…
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                    exit={{ opacity:0, height:0 }} transition={{ duration:0.22 }}
                    style={{
                      padding:"9px 13px", borderRadius:9, marginBottom:14,
                      background:"rgba(220,38,38,0.06)",
                      border:"1px solid rgba(220,38,38,0.16)",
                      display:"flex", alignItems:"center", gap:8,
                    }}
                  >
                    <div style={{ width:5, height:5, borderRadius:"50%", background:"#EF4444", flexShrink:0 }}/>
                    <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"0.80rem", color:"#B91C1C", fontWeight:500 }}>
                      {error}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* form */}
              {!success && (
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display:"flex", flexDirection:"column", gap:"clamp(10px,1.6vh,16px)", marginBottom:"clamp(8px,1.2vh,14px)" }}>
                    <PasswordInput
                      id="new-password" label="New Password"
                      value={newPwd} onChange={setNewPwd} delay={0.60}
                    />

                    {/* strength indicator */}
                    {newPwd && (
                      <div style={{ padding:"0 2px" }}>
                        <StrengthBar password={newPwd}/>
                      </div>
                    )}

                    <PasswordInput
                      id="confirm-password" label="Confirm New Password"
                      value={confirmPwd} onChange={v => { setConfirmPwd(v); setError(""); }} delay={0.68}
                    />

                    {/* match indicator */}
                    <AnimatePresence>
                      {confirmPwd && newPwd && (
                        <motion.p
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          style={{
                            fontFamily:"'Inter',system-ui,sans-serif", fontSize:11,
                            fontWeight:600, margin:"0 2px",
                            color: newPwd === confirmPwd ? "#22C55E" : "#EF4444",
                          }}
                        >
                          {newPwd === confirmPwd ? "✓ Passwords match" : "✗ Passwords do not match"}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* submit */}
                  <motion.div
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.6, delay:0.78, ease }}
                    whileHover={{ y:-2, scale:1.012 }}
                    whileTap={{ scale:0.98 }}
                  >
                    <button
                      type="submit" disabled={loading}
                      className="group"
                      style={{
                        position:"relative", width:"100%",
                        height:"clamp(48px,6.5vh,60px)",
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
                              style={{ width:15, height:15, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff" }}
                              animate={{ rotate:360 }} transition={{ duration:0.75, repeat:Infinity, ease:"linear" }}
                            />
                            <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"clamp(0.78rem,1.4vw,0.92rem)", fontWeight:700, letterSpacing:"0.10em", color:"#fff", textTransform:"uppercase" }}>
                              Resetting…
                            </span>
                          </>
                        ) : (
                          <>
                            <KeyRound size={15} color="#fff" strokeWidth={2.2}/>
                            <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"clamp(0.78rem,1.4vw,0.92rem)", fontWeight:700, letterSpacing:"0.10em", color:"#fff", textTransform:"uppercase" }}>
                              Reset Password
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                </form>
              )}

              {/* back to sign in */}
              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ duration:0.5, delay:0.88 }}
                style={{ textAlign:"center", marginTop:"clamp(16px,2.5vh,24px)" }}
              >
                <Link href="/auth/login" style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  fontFamily:"'Inter',system-ui,sans-serif",
                  fontSize:"clamp(0.78rem,1.3vw,0.90rem)",
                  fontWeight:600, color:DEEP_GOLD, textDecoration:"none",
                  transition:"opacity .2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.70"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                >
                  <ArrowLeft size={14} strokeWidth={2.2}/>
                  Back to Sign In
                </Link>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </main>

      {/* footer */}
      <motion.footer
        initial={{ opacity:0 }} animate={{ opacity:1 }}
        transition={{ duration:0.8, delay:1.0 }}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
