// next.config.mjs
// VERSIÓN CORREGIDA: Autorización de dominios externos para optimización de imágenes.

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
    // [SOLUCIÓN DEL ERROR 400]: Lista blanca de dominios permitidos para optimización.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Tus carátulas y audios
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Avatares de Google Auth
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // Avatares de GitHub Auth (Prevención)
      },
    ],
  },
};

// Configuración PWA (Sin cambios, sigue funcionando perfecto)
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  runtimeCaching: [
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