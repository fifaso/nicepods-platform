// next.config.mjs
// VERSIÓN: 28.0 (Madrid Resonance - Loose ESM Resolution Fix)

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // [SOLUCIÓN MAESTRA 1]: Transpilación forzada
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  experimental: {
    // [SOLUCIÓN MAESTRA 2]: Relaja la resolución de módulos ESM. 
    // Esto soluciona el error "Package path . is not exported".
    esmExternals: 'loose',
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.github.dev", "*.gitpod.io", "*.app.github.dev"]
    }
  },

  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    return config;
  },

  skipTrailingSlashRedirect: true,
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withSentryConfig(withPWA(nextConfig), {
  org: 'nicepod',
  project: 'javascript-nextjs',
  silent: true,
  hideSourceMaps: true,
});