import type { Metadata, Viewport } from "next";
import {
  Inter,
  DM_Sans,
  Playfair_Display,
  Cormorant_Garamond,
  Noto_Sans_Sinhala,
  Noto_Serif_Sinhala,
} from "next/font/google";
import localFont from "next/font/local";
import Providers from "./components/Providers";
import "./globals.css";

/** Self-hosted via next/font instead of a Google Fonts <link> — removes the extra DNS/connection
 *  round-trip to fonts.googleapis.com/fonts.gstatic.com, serves font files from this app's own
 *  origin, and automatically generates a size-adjusted fallback font (matching x-height/advance
 *  widths) to minimize layout shift before each webfont loads. Weight lists mirror what the
 *  previous <link> tag requested, unchanged, to avoid dropping a weight some page still uses. */
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-sinhala",
  display: "swap",
});

const notoSerifSinhala = Noto_Serif_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-serif-sinhala",
  display: "swap",
});

/** Vendored locally (files fetched from fonts.gstatic.com, sinhala subset) instead of
 *  next/font/google — the Docker build has intermittently failed to reach Google's font CDN
 *  for this specific font, which fails the whole build. next/font/local reads the files straight
 *  from disk, so the build no longer depends on that network call succeeding. */
const yaldevi = localFont({
  src: [
    { path: "./fonts/yaldevi/Yaldevi-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/yaldevi/Yaldevi-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/yaldevi/Yaldevi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/yaldevi/Yaldevi-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/yaldevi/Yaldevi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-yaldevi",
  display: "swap",
});

const fontVariables = [
  inter.variable,
  dmSans.variable,
  playfairDisplay.variable,
  cormorantGaramond.variable,
  notoSansSinhala.variable,
  notoSerifSinhala.variable,
  yaldevi.variable,
].join(" ");

export const metadata: Metadata = {
  title: {
    default: "Sampath Pathikada | සම්පත් පැතිකඩ",
    template: "%s | Sampath Pathikada",
  },
  description:
    "The official digital platform for Grama Niladhari resource profile collection and development planning across the Southern Province of Sri Lanka.",
  keywords: ["Sampath Pathikada", "Southern Province", "Economic Development Officer", "Sri Lanka", "Development Planning"],
  authors: [{ name: "Southern Province Planning Secretariat" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1C30" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="si" dir="ltr" suppressHydrationWarning className={fontVariables}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
