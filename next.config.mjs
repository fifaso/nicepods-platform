// next.config.mjs
// VERSIÓN: 44.1 (NicePod Shielded Standard - Payload Optimization Edition)
// Misión: Activar el rigor técnico, optimizar el rendimiento visual y aplicar la dieta de precaché PWA.
// [OPTIMIZACIÓN]: Reducción de carga inicial mediante exclusión de assets pesados y soporte AVIF.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  // Garantizamos que NicePod sea un sistema de Zero-Warning. Si hay errores de tipos o linting, el build falla.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // 2. OPTIMIZACIÓN DE ARQUITECTURA DE SALIDA
  output: 'standalone',

  // 3. COMPATIBILIDAD GEOESPACIAL (Mapbox Registry)
  // Crucial para la estabilidad de los módulos ESM de Mapbox en Next.js 14 y evitar errores de resolución de símbolos.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // 4. PERFORMANCE VISUAL (Image Intelligence)
  // Activamos soporte para AVIF (mejor compresión que WebP) y definimos patrones de confianza.
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
  },

  // 5. INFRAESTRUCTURA DE RED Y SERVER ACTIONS
  // Definimos orígenes permitidos para evitar colisiones de CORS en entornos de desarrollo remotos (Codespaces/Vercel).
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

  // 6. GOBERNANZA DE BUNDLE (Webpack)
  // Optimizamos el log de infraestructura y forzamos el tree-shaking mediante sideEffects.
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
 * [DIETA DE PAYLOAD]: 
 * Se implementan reglas estrictas de exclusión para evitar que el Service Worker 
 * precachee megabytes de imágenes no optimizadas en la carga inicial.
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  // Desactivamos el almacenamiento agresivo de navegación para priorizar el estado de sesión real (Auth)
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  /**
   * [SILENCE & WEIGHT PROTOCOL]: 
   * buildExcludes: Filtramos proactivamente imágenes de universos y placeholders pesados.
   * Estos recursos se cargarán mediante 'StaleWhileRevalidate' solo cuando se necesiten.
   */
  dynamicStartUrl: true,
  buildExcludes: [
    /middleware-manifest\.json$/,
    /_middleware\.js$/,
    /public\/images\/universes\/.*$/, // Excluye PNGs pesados de la carga inicial
    /public\/placeholder.*$/,        // Excluye placeholders del precaché
    /.*\.map$/                       // Excluye sourcemaps del Service Worker
  ],
});

/**
 * --- EXPORTACIÓN CON SENTRY (Observabilidad) ---
 */
export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    silent: true, // Mantiene la consola limpia durante el build
    widenClientFileUpload: true,
    hideSourceMaps: true,
  }
);