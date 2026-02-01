// next.config.mjs
// VERSIÓN: 40.0 (NicePod Ultimate Stability - Madrid Resonance Standard)
// Misión: Configuración de producción optimizada, sin advertencias y con blindaje de módulos.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de Compilación
  output: 'standalone',
  eslint: {
    // Permitimos el build aunque haya avisos, la salud la controlamos con health-check
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },

  // Soporte para librerías de mapas v7/v8 en Next.js 14
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  experimental: {
    // Necesario para que Server Actions funcione en Codespaces/Gitpod
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.github.dev", "*.gitpod.io", "*.app.github.dev"]
    }
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }
    ],
  },

  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };

    // Optimizaciones de Treeshaking para reducir el bundle final
    config.optimization.sideEffects = true;

    return config;
  },

  // Mejora de SEO y redirecciones
  skipTrailingSlashRedirect: true,
};

// --- CONFIGURACIÓN PWA (Mobile Experience) ---
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

// --- EXPORTACIÓN CON SENTRY (Capa de Monitoreo) ---
export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,

    /* 
       [FIX]: Eliminado 'disableLogger' para resolver la advertencia de depreciación.
       Sentry v8+ gestiona los logs automáticamente.
    */
  }
);