// next.config.mjs
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
  
  // 3. Imágenes: Optimización en origen (Ahorro de costes)
  images: {
    unoptimized: true, 
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // 4. Webpack Defensivo
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

  // 6. Rewrites for PostHog ingestion endpoints (EU Region)
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

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

// 7. Configuración PWA
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  
  runtimeCaching: [
    {
      // ESTRATEGIA DE AHORRO: Cachear todo lo que venga de Supabase Storage
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    ...defaultRuntimeCaching,
  ],
};

const withPwaPlugin = withPWA(pwaConfig);

// CONFIGURACIÓN SENTRY LIMPIA (Sin opciones deprecadas)
export default withSentryConfig(withPwaPlugin(nextConfig), {
  // Opciones del Plugin (Build time)
  org: 'nicepod',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  
  // [LIMPIEZA]: Eliminados 'disableLogger' y 'automaticVercelMonitors' 
  // para evitar warnings de deprecación.
  
  // Habilita sourcemaps ocultos para producción
  hideSourceMaps: true,
});