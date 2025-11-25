// next.config.mjs
// VERSIÓN OPTIMIZADA: Se activa la Optimización de Imágenes de Next.js para reducir el peso de carga.

import withPWA from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // [MODIFICACIÓN QUIRÚRGICA]: Eliminada la línea 'unoptimized: true'.
    // Esto habilita automáticamente la conversión a WebP y el redimensionado en servidor.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

// Configuración avanzada de la PWA
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // Definimos las reglas de caché (El Portero).
  runtimeCaching: [
    // ESTRATEGIA CRÍTICA: Imágenes y Audio de Supabase
    {
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

export default withPwaPlugin(nextConfig);