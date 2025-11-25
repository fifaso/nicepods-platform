// next.config.mjs
// VERSIÓN ENTERPRISE PWA: Estrategia 'CacheFirst' para Supabase Storage (Ahorro de Egress).

import withPWA from 'next-pwa';
// [CAMBIO QUIRÚRGICO #1]: Importamos la configuración de caché por defecto para no romper la carga de la app.
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
    unoptimized: true,
    // [CAMBIO QUIRÚRGICO #2]: Aseguramos que Next reconozca el dominio de Supabase explícitamente.
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
  
  // [CAMBIO QUIRÚRGICO #3]: Definimos las reglas de caché (El Portero).
  runtimeCaching: [
    // ESTRATEGIA CRÍTICA: Imágenes y Audio de Supabase
    // Si la URL viene de Supabase Storage, la guardamos en caché por 30 días.
    {
      urlPattern: /^https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst', // Primero Cache, luego Red. (Ahorro máximo de datos)
      options: {
        cacheName: 'supabase-media-cache',
        expiration: {
          maxEntries: 200, // Guardamos hasta 200 archivos
          maxAgeSeconds: 60 * 60 * 24 * 30, // Durante 30 días
        },
        cacheableResponse: {
          statuses: [0, 200], // Solo cacheamos respuestas exitosas
        },
      },
    },
    // Mantenemos las reglas por defecto para el resto de la app (JS, CSS, Google Fonts, etc.)
    ...defaultRuntimeCaching,
  ],
};

const withPwaPlugin = withPWA(pwaConfig);

export default withPwaPlugin(nextConfig);