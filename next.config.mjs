// next.config.mjs
// VERSIÓN: 10.0 (Production Ready: PWA Restored + Standalone + Security)

import withPWA from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Standalone: Vital para que Vercel no pierda archivos en el despliegue
  output: 'standalone',

  // 2. Optimizaciones de Build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 3. Imágenes: Optimización en origen (Ahorro de costes Vercel)
  images: {
    unoptimized: true, 
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // 4. Webpack Defensivo: Mantenemos esto para evitar regresiones
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
      // Parche extra por seguridad contra el archivo fantasma
      config.resolve.alias['/var/task/.next/browser/default-stylesheet.css'] = false;
    }
    return config;
  },

  // 5. Seguridad: Headers HTTP (Anti-Clickjacking, etc.)
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

// 6. Configuración PWA (RESTITUIDA)
// Vital para el caché de audio e imágenes (Ahorro de Egress Supabase)
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  runtimeCaching: [
    {
      // Cacheamos agresivamente todo lo que venga de Supabase Storage
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-media-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Días
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    ...defaultRuntimeCaching,
  ],
};

// Aplicamos el plugin PWA
const withPwaPlugin = withPWA(pwaConfig);

export default withPwaPlugin(nextConfig);