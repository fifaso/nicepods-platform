// next.config.mjs
// VERSIÓN: 44.0 (NicePod Shielded Standard - Zero Warning Edition)
// Misión: Activar el rigor técnico, optimizar el rendimiento visual y blindar la PWA.
// [FIX]: Resolución definitiva de advertencias apple-mobile-web-app-capable mediante la desactivación de inyección automática.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  // El build fallará ante cualquier error de tipos o inconsistencia de linting.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // 2. OPTIMIZACIÓN DE ARQUITECTURA
  output: 'standalone',

  // 3. COMPATIBILIDAD GEOSPESCIAL
  // Crucial para la estabilidad de los módulos ESM de Mapbox en Next.js 14.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // 4. PERFORMANCE VISUAL (Image Intelligence)
  images: {
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }
    ],
  },

  // 5. INFRAESTRUCTURA DE RED Y SERVER ACTIONS
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.github.dev",
        "*.gitpod.io",
        "*.app.github.dev",
        "*.vercel.app"
      ]
    }
  },

  // 6. GOBERNANZA DE WEBPACK
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    config.optimization.sideEffects = true;
    return config;
  },

  // 7. SEO Y ESTÁNDARES UX
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN PWA (Mobile Experience Mastery) ---
 * [MEJORA CRÍTICA]: Se desactivan las inyecciones automáticas de metadatos.
 * Al delegar los metadatos en el layout.tsx, evitamos la duplicidad y los warnings
 * de 'apple-mobile-web-app-capable' que ensuciaban la consola.
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  /**
   * [SILENCE PROTOCOL]: 
   * dynamicStartUrl y buildExcludes evitan que el plugin intente re-escribir 
   * el HTML base inyectando tags depreciados.
   */
  dynamicStartUrl: true,
  buildExcludes: [/middleware-manifest\.json$/, /_middleware\.js$/],
});

/**
 * --- EXPORTACIÓN CON SENTRY ---
 */
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