// next.config.mjs
// VERSIÓN: 26.0 (Madrid Resonance - Final Vercel Shield)

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Forzamos la transpilación
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.github.dev", "*.gitpod.io", "*.app.github.dev"]
    }
  },

  webpack: (config, { isServer }) => {
    config.infrastructureLogging = { level: 'error' };

    // [EL FIX MAESTRO]: Redirigimos CUALQUIER intento de importar react-map-gl
    // directamente al archivo de distribución, saltándonos el package.json roto.
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-map-gl': path.resolve(__dirname, 'node_modules/react-map-gl/dist/es5/index.js'),
    };

    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false };
    }

    return config;
  },

  images: { unoptimized: true, remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }] },
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