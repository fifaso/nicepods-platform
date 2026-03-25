// next.config.mjs
// VERSIÓN: 49.0 (NicePod Shielded Production - Permissions & Payload Edition)
// Misión: Orquestar el build industrial y garantizar el acceso al hardware GPS y WebGL.
// [ESTABILIZACIÓN]: Inyección de Permissions-Policy y ampliación de límites para Ingesta Multimodal.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- I. PROTOCOLO DE RIGOR TÉCNICO (BUILD SHIELD) ---
  eslint: {
    // Prohibimos el despliegue si existen errores de linting.
    ignoreDuringBuilds: false
  },
  typescript: {
    // Un error de tipos es un fallo de misión. No se permite el bypass.
    ignoreBuildErrors: false
  },

  // --- II. OPTIMIZACIÓN DE ARQUITECTURA ---
  // Standalone optimiza el tamaño de la imagen y el tiempo de respuesta en Vercel.
  output: 'standalone',

  // Garantiza que Next.js compile correctamente las dependencias de motor pesado.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  /**
   * III. CABECERAS DE AUTORIDAD (PERMISSIONS CONTROL)
   * Misión: Ordenar al navegador que confíe en NicePod para acceder al hardware.
   * Resuelve los bloqueos silenciosos de GPS en dispositivos móviles.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            // geolocation=(self) permite que el mapa acceda a los satélites.
            // camera/microphone habilitan la futura Fase de Ingesta por voz/video.
            value: 'geolocation=(self), camera=(self), microphone=(self)'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
    ];
  },

  // --- IV. PERFORMANCE VISUAL: ADUANA DE ACTIVOS ---
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
  },

  // --- V. INFRAESTRUCTURA DE RED (SERVER ACTIONS) ---
  experimental: {
    serverActions: {
      /**
       * Elevamos el límite de carga a 4MB. 
       * Requerido para el transporte de evidencia física comprimida JIT (V2.7).
       */
      bodySizeLimit: '4mb',

      allowedOrigins: [
        "localhost:3000",
        "*.vercel.app",
        "nicepod-alpha.vercel.app"
      ]
    }
  },

  // GOBERNANZA DE COMPILACIÓN
  webpack: (config) => {
    config.optimization.sideEffects = true;
    return config;
  },

  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN PWA ---
 */
const withPWA = withPWAInit({
  dest: "public",
  // Desactivado en desarrollo para evitar colisiones de caché con el motor WebGL.
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  publicExcludes: ['!manifest.json', '!*.png', '!favicon.ico'],
  buildExcludes: [
    /.*\/app\/.*\/page\.js$/,
    /.*\.map$/,
    /middleware-manifest\.json$/,
  ],
  runtimeCaching: [],
  fallbacks: {
    document: "/offline",
  },
});

/**
 * --- EXPORTACIÓN CON SENTRY (OBSERVABILIDAD) ---
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
 * NOTA TÉCNICA DEL ARCHITECT (V49.0):
 * 1. Solución de Acceso: La inyección de 'Permissions-Policy' es la pieza legal 
 *    que faltaba para que el navegador libere el hardware GPS al motor Mapbox.
 * 2. Escalabilidad de Datos: Se ha blindado el 'bodySizeLimit' para soportar 
 *    la ingesta multimodal, previniendo errores 413 en campo.
 * 3. Integridad de Build: Se eliminan todas las abreviaciones y se asegura que 
 *    la configuración de Sentry y PWA no interfieran con el rendimiento WebGL.
 */