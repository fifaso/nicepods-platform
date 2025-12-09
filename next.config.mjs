// next.config.mjs
// VERSIÓN: 6.0 (Rescue Mode: PWA Disabled + CSS Ignore)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones estándar
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Standalone ayuda a Vercel a trazar archivos correctamente
  output: 'standalone',

  images: {
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

  // CONFIGURACIÓN DE WEBPACK BLINDADA
  webpack: (config, { isServer }) => {
    // 1. Ignoramos dependencias de sistema comunes que rompen Server Components
    if (isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }

    // 2. [PARCHE ESPECÍFICO]: Ignoramos el archivo fantasma que causa el error 500
    // Esto le dice a Webpack: "Si alguien pide este CSS, dale un objeto vacío".
    config.resolve.alias['/var/task/.next/browser/default-stylesheet.css'] = false;
    
    return config;
  },

  // Marcamos paquetes externos para evitar que Webpack intente empaquetarlos
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'pdfjs-dist', 'sharp'],
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
};

// [DESACTIVACIÓN TEMPORAL DE PWA]
// Estamos exportando la config directa sin el wrapper de PWA.
// Esto aísla el problema. Si la web carga, confirmamos que next-pwa era el culpable.
export default nextConfig; 

/* 
// Configuración PWA original (Guardada para referencia)
import withPWA from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache.js';

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [ ... ],
};
// export default withPWA(pwaConfig)(nextConfig);
*/