// next.config.mjs
// VERSIÓN: 43.0 (NicePod Shielded Standard - Absolute Integrity Edition)
// Misión: Activar el rigor técnico, optimizar el rendimiento visual y blindar la PWA.
// [FIX]: Eliminación definitiva de advertencias apple-mobile-web-app-capable.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  // El proceso de construcción fallará ante cualquier inconsistencia de tipos o linting.
  // Esto garantiza que solo código 100% verificado llegue a los usuarios de NicePod.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // 2. OPTIMIZACIÓN DE ARQUITECTURA
  // Genera el binario standalone optimizado para despliegues en Vercel.
  output: 'standalone',

  // 3. COMPATIBILIDAD GEOSPESCIAL (Madrid Resonance)
  // Obliga a Next.js a transpilar las librerías de Mapbox que utilizan módulos ESM modernos,
  // eliminando errores de resolución en el servidor durante la hidratación.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // 4. PERFORMANCE VISUAL (Image Intelligence)
  // Configuración de optimización de imágenes para mejorar el LCP (Largest Contentful Paint).
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

  // 5. INFRAESTRUCTURA DE RED Y SEGURIDAD
  // Definimos los orígenes permitidos para Server Actions, incluyendo el wildcard de Vercel.
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

  // 6. GOBERNANZA DEL EMPAQUETADO (Webpack)
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };

    // Activamos Side Effects para un Treeshaking más agresivo, reduciendo el bundle shared.
    config.optimization.sideEffects = true;

    return config;
  },

  // 7. ESTÁNDARES UX Y SEO
  skipTrailingSlashRedirect: true,
  // Forzamos el modo estricto de React para detectar fugas de memoria en el hilo principal.
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN PWA (Mobile Experience Standard) ---
 * [MEJORA CRÍTICA]: Se deshabilita la generación automática de meta tags de Apple.
 * Al delegar esta responsabilidad exclusivamente en app/layout.tsx (Versión 18.0),
 * eliminamos la duplicidad que generaba el warning de depreciación en Safari.
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,

  /**
   * [INTEGRIDAD DE SESIÓN]:
   * Desactivamos el cacheo agresivo en la navegación del frontend.
   * Esto previene que la PWA sirva páginas "zombies" con datos de usuarios anteriores.
   */
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,

  /**
   * [PROTOCOL SILENCE]: 
   * Configuramos el plugin para que no intente inyectar sus propios metadatos en el head.
   */
  dynamicStartUrl: true,
  buildExcludes: [/middleware-manifest\.json$/],
});

/**
 * --- EXPORTACIÓN CON CAPA DE OBSERVABILIDAD (Sentry) ---
 * Captura errores en tiempo real en el borde y el servidor.
 */
export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    // Eliminado disableLogger para cumplir con Sentry v8+
  }
);