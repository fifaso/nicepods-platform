// next.config.mjs
// VERSIÓN: 41.0 (NicePod Shielded Standard - Madrid Resonance)
// Misión: Activar el rigor técnico, optimizar el rendimiento visual y blindar la PWA.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. RIGOR TÉCNICO (Build Shield)
  // Ahora el build FALLARÁ si hay errores. Esto garantiza que nada roto llegue al usuario.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // 2. OPTIMIZACIÓN DE PRODUCCIÓN
  output: 'standalone',

  // 3. COMPATIBILIDAD GEOSPESCIAL
  // Crucial para la estabilidad de los módulos ESM de Mapbox en Next.js 14
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // 4. PERFORMANCE VISUAL (Image Intelligence)
  images: {
    // [MEJORA]: Re-activamos la optimización de Next.js para mejorar el LCP.
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }
    ],
  },

  // 5. INFRAESTRUCTURA DE RED
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.github.dev", "*.gitpod.io", "*.app.github.dev"]
    }
  },

  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };

    // Optimizaciones de Treeshaking (Higiene del bundle)
    config.optimization.sideEffects = true;

    return config;
  },

  // SEO & UX
  skipTrailingSlashRedirect: true,
  reactStrictMode: true, // Forzamos el modo estricto para detectar fugas de memoria
};

// --- CONFIGURACIÓN PWA (Auth-Aware Caching) ---
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  // [NUEVO]: Desactivamos el cacheo agresivo en navegación para evitar el bug de "Fran"
  // Esto asegura que al cambiar de cuenta o cerrar sesión, la PWA pida el nuevo estado al servidor.
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
});

// --- EXPORTACIÓN CON SENTRY ---
export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,
  }
);