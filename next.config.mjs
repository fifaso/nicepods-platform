// next.config.mjs
// VERSIÓN SEGURIDAD ENTERPRISE: PWA + Ahorro Vercel + Cabeceras de Seguridad HTTP.

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
    // Mantenemos el ahorro de costes de Vercel (imágenes optimizadas en origen)
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  // [NUEVO]: Inyección de Cabeceras de Seguridad
  async headers() {
    return [
      {
        source: '/:path*', // Aplica a todas las rutas de la aplicación
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Evita ataques de Clickjacking (tu web no puede ser puesta en un iframe)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Evita que el navegador adivine tipos de archivo (previene inyección de scripts en imágenes)
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Protege la privacidad del usuario al navegar fuera
          },
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(self), geolocation=()", // Bloquea cámara y geo, permite micro solo al mismo origen
          },
        ],
      },
    ];
  },
};

// Configuración PWA
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