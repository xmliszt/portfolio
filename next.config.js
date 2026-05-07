/** @type {import('next').NextConfig} */

const appSecurityHeaders = [
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "tvstbbuidvwgelgidaqy.supabase.co",
      },
      {
        protocol: "https",
        hostname: "aikluwlsjdrayohixism.supabase.co",
      },
      {
        protocol: "https",
        hostname: "liyuxuan.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: appSecurityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/about#top",
        permanent: true,
      },
    ];
  },
  turbopack: {},
  webpack: (config) => {
    // Velite uses a webpack plugin to run its build step. Turbopack does not use webpack,
    // so skip Velite's webpack hook when running with Turbopack. Set NEXT_TURBOPACK=1 to
    // indicate the dev server is using Turbopack and run `npm run velite:dev` separately.
    if (!process.env.NEXT_TURBOPACK) {
      config.plugins.push(new VeliteWebpackPlugin());
    }
    return config;
  },
};
class VeliteWebpackPlugin {
  static started = false;
  apply(/** @type {import('webpack').Compiler} */ compiler) {
    // executed three times in nextjs
    // twice for the server (nodejs / edge runtime) and once for the client
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = compiler.options.mode === "development";
      const { build } = await import("velite");
      await build({ watch: dev, clean: !dev });
    });
  }
}

module.exports = withPWA(nextConfig);
