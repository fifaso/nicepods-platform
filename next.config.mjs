// next.config.mjs
// VERSIÓN: 14.0 (Aggressive App Shell Caching)

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

const pwaConfig = {
  dest: 'public',
  register: false, // Lo hacemos manualmente en el layout
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  
  // [CLAVE] Esto le dice al SW que use /offline cuando falle la navegación
  fallbacks: {
    document: '/offline', 
  },

  // Estrategias de Caché
  runtimeCaching: [
    // 1. Audios (CacheFirst - Inmutable)
    {
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // 2. Página Offline (NetworkFirst - Prioriza red, pero guarda copia)
    {
        urlPattern: ({ url }) => url.pathname === '/offline',
        handler: 'NetworkFirst',
        options: {
             cacheName: 'offline-page-cache',
             expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 },
        }
    },
    // 3. Assets de Next.js (JS/CSS) - StaleWhileRevalidate (Rápido y actualiza en fondo)
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-static-js-assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 }, // 24 hours
      },
    },
    // 4. Imágenes estáticas
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // 5. Resto (API, otras rutas)
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