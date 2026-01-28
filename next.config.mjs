// next.config.mjs
// VERSIÓN: 20.0 (Silent Mode: Sentry Fix & Webpack Quiet)

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ['react-map-gl'],

  // [FIX]: Silenciar el warning de Cross Origin ampliando los orígenes
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.github.dev", "*.gitpod.io", "*.app.github.dev"]
    }
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  webpack: (config, { isServer }) => {
    // [FIX]: Silenciar warnings de "Serializing big strings"
    config.infrastructureLogging = {
      level: 'error',
    };

    if (isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      { source: '/ingest/static/:path*', destination: 'https://eu-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/:path*', destination: 'https://eu.i.posthog.com/:path*' },
    ];
  },

  skipTrailingSlashRedirect: true,
};

// --- CONFIGURACIÓN PWA ---
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Esto evita logs de PWA en dev
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true, // Silencia logs de Workbox
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'supabase-media-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 365
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

// --- EXPORTACIÓN FINAL ---
export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    silent: true,
    widenClientFileUpload: true,

    // [FIX CRÍTICO]: Eliminamos 'disableLogger' y otras opciones obsoletas.
    // Solo dejamos hideSourceMaps que es seguro.
    hideSourceMaps: true,
  }
);