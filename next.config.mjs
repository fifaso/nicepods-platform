// next.config.mjs
// VERSIÓN: 46.0 (NicePod Shielded Production - PWA Bypass Edition)
// Misión: Orquestar el build industrial, optimizar el payload y blindar la infraestructura contra colisiones de red.
// [ESTABILIZACIÓN]: Desactivación de intercepción de activos dinámicos por el Service Worker.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // OPTIMIZACIÓN DE ARQUITECTURA
  output: 'standalone',

  // COMPATIBILIDAD GEOSPESCIAL
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // PERFORMANCE VISUAL: Optimización de activos
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
  },

  // INFRAESTRUCTURA DE RED Y SEGURIDAD
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

  // GOBERNANZA DE WEBPACK
  webpack: (config) => {
    config.optimization.sideEffects = true;
    return config;
  },

  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN PWA ---
 * [ESTRATEGIA ANTI-ERROR 400]:
 * - Se añade 'runtimeCaching' para ignorar explícitamente los activos de Supabase y Mapbox.
 * - Esto garantiza que el Service Worker nunca intente interceptar las URLs dinámicas de la Workstation.
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  skipWaiting: true,

  // Excluimos explícitamente el tráfico que causa los errores 400
  publicExcludes: ['!manifest.json', '!*.png', '!favicon.ico'],

  // [DIETA DE PAYLOAD]: Precaché exclusivo del shell de la aplicación.
  buildExcludes: [
    /.*\/app\/.*\/page\.js$/,
    /.*\.map$/,
    /middleware-manifest\.json$/,
  ],

  // Exclusión táctica para evitar que el Service Worker bloquee peticiones dinámicas
  // Esto soluciona los errores 400 vistos en la consola.
  runtimeCaching: [],

  fallbacks: {
    document: "/offline",
  },
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Supresión de Conflictos: Al establecer 'runtimeCaching: []', impedimos que el 
 *    Service Worker intente "ayudar" a descargar imágenes, lo cual era la fuente 
 *    de los errores 400 y fallos de red en el Dashboard.
 * 2. Integridad de Build: Se mantiene el modo 'standalone' para asegurar que 
 *    Vercel empaquete todas las dependencias correctamente en el Edge.
 * 3. Soberanía del Build: El ESLint y TypeScript siguen en modo estricto, garantizando 
 *    que cualquier nuevo archivo que cree el equipo pase por el filtro de calidad NicePod.
 */