// next.config.mjs
// VERSIÓN: 12.0 (Offline-First PWA: Fallbacks & Media Caching)

import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Standalone: Vital para Vercel
  output: 'standalone',

  // 2. Optimizaciones de Build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 3. Imágenes: Dominios permitidos
  images: {
    unoptimized: true, 
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // 4. Webpack Defensivo: Bloqueo de CSS fantasma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
      config.resolve.alias['/var/task/.next/browser/default-stylesheet.css'] = false;
    }
    return config;
  },

  // 5. Seguridad: Headers HTTP
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

  // 6. Rewrites para PostHog (EU Region)
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },

  skipTrailingSlashRedirect: true,
};

// 7. Configuración PWA (OFFLINE MODE)
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // Exclusiones para no confundir a Vercel
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  
  // [NUEVO]: Estrategia de Fallback. Si no hay red y la página falla, carga esto.
  fallbacks: {
    document: '/~offline', 
  },

  runtimeCaching: [
    // A. Caché de Audios (Supabase Storage) - VITAL PARA DESCARGAS
    {
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: {
          maxEntries: 200, // Guardamos hasta 200 audios/imágenes
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Días
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // B. Caché explícita para la página offline (asegurar que siempre esté disponible)
    {
        urlPattern: /\/~offline$/,
        handler: 'NetworkFirst',
        options: {
             cacheName: 'offline-page-cache',
        }
    },
    // C. Resto de estrategias por defecto (Google Fonts, CSS, etc.)
    ...defaultRuntimeCaching,
  ],
};

const withPwaPlugin = withPWA(pwaConfig);

// CONFIGURACIÓN SENTRY (Limpia de opciones deprecadas)
export default withSentryConfig(withPwaPlugin(nextConfig), {
  org: 'nicepod',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  
  // Nota: 'tunnelRoute' eliminado para evitar errores 400 en consola.
  // Nota: 'disableLogger' y 'automaticVercelMonitors' eliminados por deprecación.
});