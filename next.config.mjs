// next.config.mjs
// VERSIÓN: 17.0 (Offline-First: Manual Registration & Aggressive Caching)

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
      config.resolve.alias['/var/task/.next/browser/default-stylesheet.css'] = false;
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

// 7. Configuración PWA
const pwaConfig = {
  dest: 'public',
  register: false, // Registro manual vía componente para mayor control
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // Desactivar preload mejora la estabilidad del fallback en ciertos navegadores móviles
  navigationPreload: false,

  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  
  // El Búnker: Si falla la navegación, usa esta página
  fallbacks: {
    document: '/offline', 
  },

  runtimeCaching: [
    // A. Caché de Audios (Supabase) - PRIORIDAD MÁXIMA
    {
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 año
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // B. Caché de la Página Offline
    // Aseguramos que la ruta /offline siempre se sirva desde caché si es posible
    {
        urlPattern: ({ url }) => url.pathname === '/offline',
        handler: 'CacheFirst',
        options: {
             cacheName: 'offline-page-cache',
             expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
        }
    },
    // C. Assets Estáticos de Next.js (JS/CSS chunks)
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 * 30 },
      },
    },
    // D. Imágenes
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