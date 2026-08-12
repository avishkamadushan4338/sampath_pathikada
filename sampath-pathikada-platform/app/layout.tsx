import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Providers from "./components/Providers";
import "./globals.css";

/** Every font here is vendored locally (files originally fetched from fonts.gstatic.com) instead
 *  of next/font/google — the Docker build has repeatedly failed to reach Google's font CDN for
 *  one font or another (first Yaldevi, then Inter), failing the whole build each time.
 *  next/font/local reads the files straight from disk, so the build no longer depends on that
 *  network call succeeding for any of them. Weight/style lists mirror what next/font/google was
 *  previously configured to fetch, unchanged, to avoid dropping a weight some page still uses. */
const inter = localFont({
  src: [
    { path: "./fonts/inter/Inter-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/inter/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter/Inter-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/inter/Inter-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans/DMSans-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/dm-sans/DMSans-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/dm-sans/DMSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-sans/DMSans-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/dm-sans/DMSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/dm-sans/DMSans-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/dm-sans/DMSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/dm-sans/DMSans-SemiBoldItalic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/dm-sans/DMSans-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/dm-sans/DMSans-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = localFont({
  src: [
    { path: "./fonts/playfair-display/PlayfairDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/playfair-display/PlayfairDisplay-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/playfair-display/PlayfairDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/playfair-display/PlayfairDisplay-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/playfair-display/PlayfairDisplay-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/playfair-display/PlayfairDisplay-SemiBoldItalic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/playfair-display/PlayfairDisplay-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/playfair-display/PlayfairDisplay-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "./fonts/playfair-display/PlayfairDisplay-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/playfair-display/PlayfairDisplay-ExtraBoldItalic.woff2", weight: "800", style: "italic" },
    { path: "./fonts/playfair-display/PlayfairDisplay-Black.woff2", weight: "900", style: "normal" },
    { path: "./fonts/playfair-display/PlayfairDisplay-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const cormorantGaramond = localFont({
  src: [
    { path: "./fonts/cormorant-garamond/CormorantGaramond-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond/CormorantGaramond-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-garamond/CormorantGaramond-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond/CormorantGaramond-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/cormorant-garamond/CormorantGaramond-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond/CormorantGaramond-SemiBoldItalic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/cormorant-garamond/CormorantGaramond-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cormorant-garamond/CormorantGaramond-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const notoSansSinhala = localFont({
  src: [
    { path: "./fonts/noto-sans-sinhala/NotoSansSinhala-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/noto-sans-sinhala/NotoSansSinhala-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-sinhala/NotoSansSinhala-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/noto-sans-sinhala/NotoSansSinhala-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/noto-sans-sinhala/NotoSansSinhala-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/noto-sans-sinhala/NotoSansSinhala-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/noto-sans-sinhala/NotoSansSinhala-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-noto-sans-sinhala",
  display: "swap",
});

const notoSerifSinhala = localFont({
  src: [
    { path: "./fonts/noto-serif-sinhala/NotoSerifSinhala-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-serif-sinhala/NotoSerifSinhala-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/noto-serif-sinhala/NotoSerifSinhala-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/noto-serif-sinhala/NotoSerifSinhala-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/noto-serif-sinhala/NotoSerifSinhala-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-noto-serif-sinhala",
  display: "swap",
});

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
