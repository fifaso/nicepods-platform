// next.config.mjs
// VERSIÓN: 18.0 (Fix: Bad Precache Response)

import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true, 
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  webpack: (config, { isServer }) => {
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

// 7. Configuración PWA (FIXED)
const pwaConfig = {
  dest: 'public',
  register: false, 
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  navigationPreload: false,

  // [CORRECCIÓN]: Excluir mapas de fuente (.map) del precaché
  // Esto elimina el error "bad-precaching-response: 404"
  buildExcludes: [
    /middleware-manifest\.json$/, 
    /app-build-manifest\.json$/, 
    /\.map$/ 
  ],
  
  fallbacks: {
    document: '/offline', 
  },

  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
        urlPattern: /\/offline$/,
        handler: 'CacheFirst',
        options: {
             cacheName: 'offline-page-cache',
             expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
        }
    },
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 * 30 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    ...defaultRuntimeCaching,
  ],
};

const withPwaPlugin = withPWA(pwaConfig);

export default withSentryConfig(withPwaPlugin(nextConfig), {
  org: 'nicepod',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
});