// next.config.mjs
// VERSIÓN: 11.0 (Production: PWA Restored + Safety Excludes + Standalone)

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

  // 4. Webpack Defensivo: Mantenemos el bloqueo del CSS fantasma por si acaso
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
};

// 6. Configuración PWA (RESTITUIDA Y BLINDADA)
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // [MEJORA DE SEGURIDAD]: Excluir archivos de servidor que confunden a Vercel
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  
  runtimeCaching: [
    {
      // ESTRATEGIA DE AHORRO: Cachear todo lo que venga de Supabase Storage
      // Esto intercepta las imágenes y los audios MP3.
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: {
          maxEntries: 200, // Guardamos hasta 200 archivos
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Días de vida en el celular del usuario
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Mantenemos el caché por defecto para Google Fonts, CSS, etc.
    ...defaultRuntimeCaching,
  ],
};

const withPwaPlugin = withPWA(pwaConfig);

export default withPwaPlugin(nextConfig);