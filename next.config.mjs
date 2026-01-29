// next.config.mjs
// VERSIÓN: 33.0 (Madrid Resonance - Full Module Resolution Shield)

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

  // [ESTRATEGIA 1]: Obligamos a Next.js a procesar las librerías conflictivas
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  experimental: {
    // [ESTRATEGIA 2]: Relajamos la resolución de módulos ESM
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

    // [EL FIX DEFINITIVO]: Alias de resolución física. 
    // Apuntamos 'react-map-gl' directamente a su archivo de distribución.
    // Esto soluciona el error "Package path . is not exported"
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-map-gl': path.resolve(__dirname, 'node_modules/react-map-gl/dist/esm/index.js'),
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
  disableLogger: true,
});