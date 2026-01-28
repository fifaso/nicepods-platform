// next.config.mjs
// VERSIÓN: 29.0 (Madrid Resonance - Final Production Armor)

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // [ESTRATEGIA MAESTRA]: Evitamos que el servidor toque las librerías de mapas
  serverExternalPackages: ['react-map-gl', 'mapbox-gl'],

  experimental: {
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

    // [FIX]: Forzamos a Webpack a ignorar problemas de resolución en el build
    config.resolve.alias = {
      ...config.resolve.alias,
      "mapbox-gl": "mapbox-gl",
    };

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