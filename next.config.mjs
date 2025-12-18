// next.config.mjs
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
  // Headers y Rewrites se mantienen igual...
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

// 7. Configuración PWA (OFFLINE MODE REFORZADO)
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // [CAMBIO]: Apuntamos a la nueva ruta estándar
  fallbacks: {
    document: '/offline', 
  },
  
  // Cachear assets estáticos de forma agresiva
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,

  runtimeCaching: [
    // A. Caché de Audios (Supabase)
    {
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // B. Caché de la página offline (CRÍTICO)
    {
        urlPattern: /\/offline$/,
        handler: 'NetworkFirst',
        options: {
             cacheName: 'offline-page-cache',
        }
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