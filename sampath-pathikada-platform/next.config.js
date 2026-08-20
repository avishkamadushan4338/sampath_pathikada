// Next.js itself injects an inline bootstrap script + inline styles for hydration/streaming,
// so 'unsafe-inline' is required for script-src/style-src here (no nonce plumbing exists in
// this app). This still blocks the two things that matter most for an app with zero known
// HTML-injection sinks: loading script/style/frames from anywhere other than this origin.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Only meaningful over HTTPS (production); harmless no-op over local HTTP dev.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  // A stray package-lock.json one directory up (outside this app) makes Next.js infer
  // the wrong workspace root and walk the file tracer outside the project — pin it
  // explicitly to this directory.
  outputFileTracingRoot: __dirname,
  images: {
    // next/image's quality prop must be declared here starting in Next.js 16
    // (an error already in 15.5, not just a deprecation warning — confirmed by
    // running the app: any quality value not listed here 500s the page).
    // 75 is next/image's own default; 90 and 100 are used across the (auth)
    // pages and LandingClient.tsx for logo/hero images — grep for
    // `quality={` under app/ and components/ before removing either value.
    qualities: [75, 90, 100],
  },
  experimental: {
    // These icon/utility packages use barrel files; without this Turbopack/webpack
    // has to process the whole package on every import instead of just the used exports,
    // which slows dev compiles and bloats client bundles.
    optimizePackageImports: [
      "react-icons",
      "@tabler/icons-react",
      "@phosphor-icons/react",
      "@iconify/react",
      "date-fns",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

module.exports = nextConfig;
