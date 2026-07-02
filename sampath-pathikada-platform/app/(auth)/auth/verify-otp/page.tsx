"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

const GOLD      = "#C8A34D";
const DEEP_GOLD = "#A67C00";
const CRIMSON   = "#6B0F1A";
const CHARCOAL  = "#111111";
const ease      = [0.16, 1, 0.3, 1] as const;

const RESEND_SECONDS = 60;

function VerifyOTPContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [otp,     setOtp]     = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [timer,   setTimer]   = useState(RESEND_SECONDS);
  const [sending, setSending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    setError("");
    if (char && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...otp];
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const focusIdx = Math.min(digits.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    setSuccess(true);
    await new Promise(r => setTimeout(r, 1200));
    router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
  };

  const handleResend = async () => {
    if (timer > 0 || sending) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setTimer(RESEND_SECONDS);
    setOtp(Array(6).fill(""));
    setError("");
    inputs.current[0]?.focus();
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "your email";

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
                  background:`linear-gradient(135deg,rgba(200,163,77,0.12),rgba(200,163,77,0.06))`,
                  border:`1.5px solid rgba(200,163,77,0.28)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 4px 20px rgba(200,163,77,0.15)",
                }}>
                  <ShieldCheck size={28} style={{ color:GOLD }} strokeWidth={1.6}/>
                </div>
              </motion.div>

              {/* heading */}
              <motion.div
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:0.6, delay:0.52, ease }}
                style={{ textAlign:"center", marginBottom:"clamp(20px,3vh,30px)" }}
              >
                <h2 style={{
                  fontFamily:"'Playfair Display',Georgia,serif",
                  fontSize:"clamp(1.5rem,3.5vw,2.2rem)",
                  fontWeight:800, color:CHARCOAL,
                  lineHeight:1.1, letterSpacing:"-0.03em", margin:"0 0 10px",
                }}>
                  Verify OTP
                </h2>
                <p style={{
                  fontFamily:"'Inter',system-ui,sans-serif",
                  fontSize:"clamp(0.80rem,1.4vw,0.92rem)",
                  color:"rgba(17,17,17,0.48)", margin:0, lineHeight:1.6,
                }}>
                  We sent a 6-digit code to
                </p>
                <p style={{
                  fontFamily:"'Inter',system-ui,sans-serif",
                  fontSize:"clamp(0.84rem,1.4vw,0.96rem)",
                  fontWeight:700, color:DEEP_GOLD, margin:"4px 0 0",
                }}>
                  {maskedEmail}
                </p>
              </motion.div>

              {/* error / success */}
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
                {success && (
                  <motion.div
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                    style={{
                      padding:"9px 13px", borderRadius:9, marginBottom:14,
                      background:"rgba(34,197,94,0.07)",
                      border:"1px solid rgba(34,197,94,0.20)",
                      display:"flex", alignItems:"center", gap:8,
                    }}
                  >
                    <div style={{ width:5, height:5, borderRadius:"50%", background:"#22C55E", flexShrink:0 }}/>
                    <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"0.80rem", color:"#15803D", fontWeight:500 }}>
                      OTP verified! Redirecting to reset password…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTP boxes */}
              <form onSubmit={handleSubmit} noValidate>
                <motion.div
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.5, delay:0.60, ease }}
                  style={{
                    display:"flex", justifyContent:"center",
                    gap:"clamp(8px,1.8vw,14px)",
                    marginBottom:"clamp(20px,3vh,28px)",
                  }}
                  onPaste={handlePaste}
                >
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={el => { inputs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      initial={{ opacity:0, y:12, scale:0.9 }}
                      animate={{ opacity:1, y:0, scale:1 }}
                      transition={{ duration:0.4, delay:0.62 + i * 0.06, ease }}
                      style={{
                        width:"clamp(44px,10vw,58px)",
                        height:"clamp(52px,11vw,66px)",
                        borderRadius:12,
                        border:`2px solid ${digit ? GOLD : "rgba(200,163,77,0.28)"}`,
                        background: digit ? "#FFFDF6" : "#FAF8F3",
                        boxShadow: digit ? `0 0 0 3px rgba(200,163,77,0.12)` : "none",
                        fontFamily:"'Inter',system-ui,sans-serif",
                        fontSize:"clamp(1.3rem,3vw,1.8rem)",
                        fontWeight:700,
                        color: CRIMSON,
                        textAlign:"center",
                        caretColor:GOLD,
                        outline:"none",
                        transition:"border-color .18s, background .18s, box-shadow .18s",
                        cursor:"text",
                      }}
                      onFocus={e => {
                        (e.target as HTMLInputElement).style.borderColor = GOLD;
                        (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(200,163,77,0.14)";
                        (e.target as HTMLInputElement).style.background = "#FFFDF8";
                      }}
                      onBlur={e => {
                        if (!digit) {
                          (e.target as HTMLInputElement).style.borderColor = "rgba(200,163,77,0.28)";
                          (e.target as HTMLInputElement).style.boxShadow = "none";
                          (e.target as HTMLInputElement).style.background = "#FAF8F3";
                        }
                      }}
                    />
                  ))}
                </motion.div>

                {/* submit */}
                <motion.div
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.6, delay:0.72, ease }}
                >
                  <motion.button
                    type="submit" disabled={loading || success}
                    whileHover={{ y:-2, scale:1.012 }}
                    whileTap={{ scale:0.98 }}
                    transition={{ type:"spring", stiffness:400, damping:22 }}
                    className="group"
                    style={{
                      position:"relative", width:"100%",
                      height:"clamp(48px,6.5vh,60px)",
                      borderRadius:12,
                      background:"linear-gradient(160deg,#D4AA55 0%,#C8A34D 40%,#A67C00 100%)",
                      border:"1px solid rgba(255,255,255,0.18)",
                      boxShadow:"0 0 0 1px rgba(255,255,255,0.12) inset,0 1px 0 rgba(255,255,255,0.20) inset,0 10px 30px rgba(166,124,0,0.32),0 3px 10px rgba(166,124,0,0.22)",
                      cursor: (loading || success) ? "wait" : "pointer",
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
                            Verifying…
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={15} color="#fff" strokeWidth={2.2}/>
                          <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:"clamp(0.78rem,1.4vw,0.92rem)", fontWeight:700, letterSpacing:"0.10em", color:"#fff", textTransform:"uppercase" }}>
                            Verify OTP
                          </span>
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </form>

              {/* resend */}
              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ duration:0.5, delay:0.82 }}
                style={{ textAlign:"center", marginTop:"clamp(14px,2vh,20px)" }}
              >
                {timer > 0 ? (
                  <p style={{
                    fontFamily:"'Inter',system-ui,sans-serif",
                    fontSize:"clamp(0.76rem,1.2vw,0.86rem)",
                    color:"rgba(17,17,17,0.42)", margin:0,
                  }}>
                    Resend OTP in{" "}
                    <span style={{ fontWeight:700, color:DEEP_GOLD }}>
                      {String(Math.floor(timer / 60)).padStart(2,"0")}:{String(timer % 60).padStart(2,"0")}
                    </span>
                  </p>
                ) : (
                  <button type="button" onClick={handleResend} disabled={sending}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:6,
                      fontFamily:"'Inter',system-ui,sans-serif",
                      fontSize:"clamp(0.76rem,1.2vw,0.86rem)",
                      fontWeight:600, color: sending ? "rgba(17,17,17,0.35)" : DEEP_GOLD,
                      background:"none", border:"none", cursor: sending ? "wait" : "pointer", padding:0,
                      transition:"color .2s",
                    }}
                  >
                    {sending
                      ? <motion.div style={{ width:13, height:13, borderRadius:"50%", border:`2px solid rgba(166,124,0,0.3)`, borderTopColor:DEEP_GOLD }} animate={{ rotate:360 }} transition={{ duration:0.75, repeat:Infinity, ease:"linear" }}/>
                      : <RefreshCw size={13} strokeWidth={2.2}/>
                    }
                    {sending ? "Sending…" : "Resend OTP"}
                  </button>
                )}
              </motion.div>

              {/* back */}
              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ duration:0.5, delay:0.90 }}
                style={{ textAlign:"center", marginTop:"clamp(10px,1.5vh,16px)" }}
              >
                <Link href="/auth/login" style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  fontFamily:"'Inter',system-ui,sans-serif",
                  fontSize:"clamp(0.76rem,1.2vw,0.86rem)",
                  fontWeight:600, color:"rgba(17,17,17,0.40)", textDecoration:"none",
                  transition:"color .2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = DEEP_GOLD}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(17,17,17,0.40)"}
                >
                  <ArrowLeft size={13} strokeWidth={2.2}/>
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

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <VerifyOTPContent />
    </Suspense>
  );
}
