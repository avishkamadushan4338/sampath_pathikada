"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── Floating particle ──────────────────────────────────────────────────── */
function Particle({ x, y, size, delay, duration }: {
  x: number; y: number; size: number; delay: number; duration: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: `${x}%`, top: `${y}%`, width: size, height: size,
        background: "radial-gradient(circle,rgba(200,163,77,0.50) 0%,transparent 70%)",
      }}
      animate={{ y: [0, -14, 0], opacity: [0.04, 0.09, 0.04] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const PARTICLES = [
  { x: 8,   y: 12,  size: 160, delay: 0,   duration: 14 },
  { x: 78,  y: 8,   size: 200, delay: 2.5, duration: 17 },
  { x: 90,  y: 58,  size: 140, delay: 1,   duration: 13 },
  { x: 4,   y: 75,  size: 180, delay: 3.5, duration: 16 },
  { x: 50,  y: 85,  size: 120, delay: 0.8, duration: 15 },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function LandingClient() {
  return (
    /* ── Full viewport, NO scroll ── */
    <div
      className="relative w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        height: "100dvh",
        background: "linear-gradient(160deg,#FEFCF7 0%,#FAF8F3 50%,#F4F0E8 100%)",
      }}
    >
      {/* geometric tile */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C8A34D' stroke-width='0.5'%3E%3Crect x='20' y='20' width='80' height='80' rx='2'/%3E%3Crect x='35' y='35' width='50' height='50' rx='1'/%3E%3Ccircle cx='60' cy='60' r='6'/%3E%3Cline x1='20' y1='60' x2='35' y2='60'/%3E%3Cline x1='85' y1='60' x2='100' y2='60'/%3E%3Cline x1='60' y1='20' x2='60' y2='35'/%3E%3Cline x1='60' y1='85' x2='60' y2='100'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
          opacity: 0.022,
        }}
      />

      {/* ambient particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* center radial glow */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 46%,rgba(200,163,77,0.07) 0%,transparent 70%)" }} />

      {/* top gold rule */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent 0%,#A67C00 20%,#C8A34D 50%,#A67C00 80%,transparent 100%)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />

      {/* bottom gold rule */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(200,163,77,0.30),transparent)" }} />

      {/* ════════════════════════════════════════════════
          CENTRE CONTENT — fits 100dvh on all devices
      ════════════════════════════════════════════════ */}
      <main className="relative z-10 flex flex-col items-center text-center w-full px-4 sm:px-8"
        style={{ gap: "clamp(10px,2.2vh,28px)" }}
      >

        {/* ── LOGOS ROW ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease }}
          className="flex items-center justify-center"
          style={{ gap: "clamp(12px,3vw,40px)" }}
        >
          {/* glass ring — app.png */}
          <div
            className="relative shrink-0 flex items-center justify-center"
            style={{
              width: "clamp(72px,10vw,128px)",
              height: "clamp(72px,10vw,128px)",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%,rgba(255,255,255,0.85) 0%,rgba(250,248,243,0.60) 100%)",
              border: "1.5px solid rgba(200,163,77,0.45)",
              boxShadow: [
                "0 0 0 5px rgba(200,163,77,0.06)",
                "0 0 0 11px rgba(200,163,77,0.03)",
                "0 12px 36px rgba(166,124,0,0.14)",
                "0 3px 10px rgba(0,0,0,0.06)",
                "inset 0 1px 0 rgba(255,255,255,0.80)",
              ].join(","),
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full"
              style={{ background: "conic-gradient(from 130deg,transparent 40%,rgba(200,163,77,0.28) 55%,transparent 70%)" }} />
            <Image
              src="/app.png"
              alt="Southern Provincial Council"
              width={128} height={128}
              priority quality={100}
              className="relative z-10 object-contain"
              style={{
                width: "clamp(46px,6.5vw,84px)",
                height: "clamp(46px,6.5vw,84px)",
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
              }}
            />
          </div>

          {/* vertical divider */}
          <div className="shrink-0 w-px"
            style={{
              height: "clamp(52px,8vw,96px)",
              background: "linear-gradient(to bottom,transparent,rgba(200,163,77,0.50),transparent)",
            }} />

          {/* sp-logo */}
          <Image
            src="/sp-logo.png"
            alt="Southern Province Planning Secretariat"
            width={420} height={64}
            priority quality={100}
            className="shrink-0 object-contain"
            style={{ width: "clamp(300px,64vw,780px)", height: "auto" }}
          />
        </motion.div>

        {/* thin gold rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.4, ease: "easeOut" }}
          className="mx-auto"
          style={{
            width: "clamp(80px,14vw,128px)",
            height: "1px",
            background: "linear-gradient(90deg,transparent,#C8A34D,transparent)",
            transformOrigin: "center",
          }}
        />

        {/* ── SYSTEM NAME ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.50, ease }}
        >
          <h1
            className="leading-[0.90] tracking-[-0.035em] whitespace-nowrap"
            style={{
              fontFamily: "'Playfair Display','Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(2.1rem,8vw,5.6rem)",
              fontWeight: 900,
            }}
          >
            <span style={{ color: "#6B0F1A" }}>Sampath</span>{" "}
            <span style={{ color: "#8B6400" }}>Pathikada</span>
          </h1>
        </motion.div>

        {/* ── TAGLINE + SINHALA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.65, ease }}
          className="flex flex-col items-center"
          style={{ gap: "clamp(6px,1.2vh,14px)" }}
        >
          <p
            className="tracking-[0.20em] uppercase font-semibold"
            style={{
              fontFamily: "'Inter',system-ui,sans-serif",
              fontSize: "clamp(0.66rem,2vw,1.1rem)",
              color: "#3D2E00",
            }}
          >
            Digital Governance Platform
          </p>

          {/* flanking lines + Sinhala */}
          <div className="flex flex-col items-center" style={{ gap: "clamp(4px,0.8vh,10px)" }}>
            <div className="flex items-center gap-3">
              <div className="h-px" style={{ width: "clamp(28px,4vw,64px)", background: "linear-gradient(to right,transparent,rgba(200,163,77,0.45))" }} />
              <div className="h-1 w-1 rounded-full" style={{ background: "rgba(200,163,77,0.55)" }} />
              <div className="h-px" style={{ width: "clamp(28px,4vw,64px)", background: "linear-gradient(to left,transparent,rgba(200,163,77,0.45))" }} />
            </div>

            <p
              lang="si"
              className="font-bold text-center whitespace-nowrap"
              style={{
                fontFamily: "'Yaldevi','Noto Sans Sinhala',sans-serif",
                fontSize: "clamp(1.3rem,5vw,2.7rem)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "#8B6400",
              }}
            >
              සම්පත් පැතිකඩ
              <span style={{ color: "#A67C00", margin: "0 0.5em", fontWeight: 300, opacity: 0.6 }}>|</span>
              <span style={{ color: "#6B0F1A" }}>දකුණු පළාත</span>
            </p>

            <div className="flex items-center gap-3">
              <div className="h-px" style={{ width: "clamp(28px,4vw,64px)", background: "linear-gradient(to right,transparent,rgba(200,163,77,0.35))" }} />
              <div className="h-1 w-1 rounded-full" style={{ background: "rgba(200,163,77,0.40)" }} />
              <div className="h-px" style={{ width: "clamp(28px,4vw,64px)", background: "linear-gradient(to left,transparent,rgba(200,163,77,0.35))" }} />
            </div>
          </div>
        </motion.div>

        {/* ── BUTTONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.82, ease }}
          className="flex flex-row items-center"
          style={{ gap: "clamp(12px,2.5vw,28px)" }}
        >
          {/* LOGIN */}
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Link
              href="/auth/login"
              className="group relative inline-flex items-center justify-center gap-2 select-none overflow-hidden"
              style={{
                borderRadius: 14,
                minWidth: "clamp(160px,22vw,280px)",
                padding: "clamp(14px,2.8vh,26px) clamp(36px,5.5vw,72px)",
                background: "linear-gradient(160deg,#7D1220 0%,#6B0F1A 45%,#520B14 100%)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: [
                  "0 0 0 1px rgba(255,255,255,0.10) inset",
                  "0 1px 0 rgba(255,255,255,0.18) inset",
                  "0 -1px 0 rgba(0,0,0,0.25) inset",
                  "0 16px 48px rgba(107,15,26,0.38)",
                  "0 6px 16px rgba(107,15,26,0.28)",
                ].join(","),
                textDecoration: "none",
                transition: "box-shadow 0.4s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = [
                  "0 0 0 1px rgba(255,255,255,0.16) inset",
                  "0 1px 0 rgba(255,255,255,0.24) inset",
                  "0 -1px 0 rgba(0,0,0,0.25) inset",
                  "0 24px 64px rgba(107,15,26,0.52)",
                  "0 10px 28px rgba(107,15,26,0.38)",
                  "0 0 40px rgba(107,15,26,0.18)",
                ].join(",");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = [
                  "0 0 0 1px rgba(255,255,255,0.10) inset",
                  "0 1px 0 rgba(255,255,255,0.18) inset",
                  "0 -1px 0 rgba(0,0,0,0.25) inset",
                  "0 16px 48px rgba(107,15,26,0.38)",
                  "0 6px 16px rgba(107,15,26,0.28)",
                ].join(",");
              }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)" }} />
              <span className="pointer-events-none absolute -inset-full top-0 h-full w-1/2 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[350%] transition-all duration-700"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)" }} />
              <svg className="relative shrink-0 opacity-75 w-3.25 h-3.25 md:w-4.25 md:h-4.25" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="8" rx="2" stroke="white" strokeWidth="1.4"/>
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="1" fill="white"/>
              </svg>
              <span className="relative font-bold tracking-[0.12em] uppercase"
                style={{
                  fontFamily: "'Inter',system-ui,sans-serif",
                  fontSize: "clamp(0.82rem,2vw,1.15rem)",
                  color: "#FFFFFF",
                }}>
                Login
              </span>
            </Link>
          </motion.div>

          {/* REGISTER */}
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center justify-center gap-2 select-none overflow-hidden"
              style={{
                borderRadius: 14,
                minWidth: "clamp(160px,22vw,280px)",
                padding: "clamp(14px,2.8vh,26px) clamp(36px,5.5vw,72px)",
                background: "linear-gradient(160deg,#D4AA55 0%,#C8A34D 40%,#A67C00 100%)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: [
                  "0 0 0 1px rgba(255,255,255,0.14) inset",
                  "0 1px 0 rgba(255,255,255,0.22) inset",
                  "0 -1px 0 rgba(0,0,0,0.18) inset",
                  "0 16px 48px rgba(166,124,0,0.34)",
                  "0 6px 16px rgba(166,124,0,0.24)",
                ].join(","),
                textDecoration: "none",
                transition: "box-shadow 0.4s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = [
                  "0 0 0 1px rgba(255,255,255,0.20) inset",
                  "0 1px 0 rgba(255,255,255,0.28) inset",
                  "0 -1px 0 rgba(0,0,0,0.18) inset",
                  "0 24px 64px rgba(166,124,0,0.48)",
                  "0 10px 28px rgba(166,124,0,0.34)",
                  "0 0 40px rgba(166,124,0,0.16)",
                ].join(",");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = [
                  "0 0 0 1px rgba(255,255,255,0.14) inset",
                  "0 1px 0 rgba(255,255,255,0.22) inset",
                  "0 -1px 0 rgba(0,0,0,0.18) inset",
                  "0 16px 48px rgba(166,124,0,0.34)",
                  "0 6px 16px rgba(166,124,0,0.24)",
                ].join(",");
              }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.40),transparent)" }} />
              <span className="pointer-events-none absolute -inset-full top-0 h-full w-1/2 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[350%] transition-all duration-700"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)" }} />
              <svg className="relative shrink-0 opacity-90 w-3.25 h-3.25 md:w-4.25 md:h-4.25" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="white" strokeWidth="1.4"/>
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="12" y1="2" x2="12" y2="5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="10.5" y1="3.5" x2="13.5" y2="3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="relative font-bold tracking-[0.12em] uppercase"
                style={{
                  fontFamily: "'Inter',system-ui,sans-serif",
                  fontSize: "clamp(0.82rem,2vw,1.15rem)",
                  color: "#FFFFFF",
                }}>
                Register
              </span>
            </Link>
          </motion.div>
        </motion.div>

      </main>

      {/* ── FOOTER — pinned to bottom ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 1.1 }}
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-4 pt-3"
        style={{ borderTop: "1px solid rgba(200,163,77,0.18)" }}
      >
        <p
          className="text-center px-4"
          style={{
            fontFamily: "'Inter',system-ui,sans-serif",
            fontSize: "clamp(0.70rem,1.1vw,0.80rem)",
            color: "rgba(17,17,17,0.60)",
            letterSpacing: "0.03em",
            fontWeight: 500,
          }}
        >
          Southern Province Planning Secretariat
          <span className="mx-2" style={{ color: "rgba(139,100,0,0.38)" }}>·</span>
          © {new Date().getFullYear()} Sampath Pathikada · All rights reserved
        </p>
      </motion.footer>
    </div>
  );
}
