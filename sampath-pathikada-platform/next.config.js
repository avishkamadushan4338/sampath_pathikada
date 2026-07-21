/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
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
};

module.exports = nextConfig;
