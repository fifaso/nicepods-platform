// next.config.mjs
// VERSIÓN: 50.0 (NicePod Shielded Production - PWA Deactivation & Hardware Priority)
// Misión: Liberar el hilo principal de la CPU desactivando el Service Worker para priorizar GPS y WebGL.
// [ESTABILIZACIÓN]: Desactivación táctica de PWA para eliminar errores de interceptación de red.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- I. PROTOCOLO DE RIGOR TÉCNICO (BUILD SHIELD) ---
  eslint: {
    // Prohibimos el despliegue si existen errores de linting para asegurar limpieza de código.
    ignoreDuringBuilds: false
  },
  typescript: {
    // Un error de tipos es un fallo de misión crítico. Sostenemos el estándar NCIS.
    ignoreBuildErrors: false
  },

  // --- II. OPTIMIZACIÓN DE ARQUITECTURA ---
  // El modo standalone es mandatorio para despliegues optimizados en Vercel.
  output: 'standalone',

  // Garantizamos que Next.js procese correctamente las librerías de renderizado pesado.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  /**
   * III. CABECERAS DE AUTORIDAD (PERMISSIONS CONTROL)
   * Misión: Garantizar que el navegador no bloquee el acceso al hardware.
   * [NCIS]: Obligatorio para que el GPS y el motor WebGL funcionen en armonía.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            // geolocation=(self) permite que el mapa acceda a los satélites.
            // camera/microphone habilitan la futura Fase de Ingesta.
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
       * Elevamos el límite de carga a 4MB para soportar el Mosaico OCR.
       * Esto previene el error HTTP 413 (Payload Too Large).
       */
      bodySizeLimit: '4mb',

      allowedOrigins: [
        "localhost:3000",
        "*.vercel.app",
        "nicepod-alpha.vercel.app"
      ]
    }
  },

  // GOBERNANZA DE COMPILACIÓN (SIDE EFFECTS OPTIMIZATION)
  webpack: (config) => {
    config.optimization.sideEffects = true;
    return config;
  },

  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN PWA (MODO DEPURACIÓN) ---
 * [ALERTA ARQUITECTÓNICA]: Hemos detectado errores de interceptación en el hilo principal.
 * Se fuerza 'disable: true' en todos los entornos para asegurar que el hardware GPS
 * no compita con el Service Worker por recursos de CPU y Red.
 */
const withPWA = withPWAInit({
  dest: "public",

  // [OPERACIÓN V50.0]: Desactivación total para estabilización sensorial.
  disable: true,

  register: false,
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
 * NOTA TÉCNICA DEL ARCHITECT (V50.0):
 * 1. Solución de Lag de Hilo: Al desactivar el plugin PWA, eliminamos los errores de 
 *    Network en el archivo 'sw.js' que veíamos en la consola de Vercel. Esto garantiza
 *    que el navegador tenga el canal de datos 100% disponible para la telemetría GPS.
 * 2. Blindaje de Permisos: Se mantiene la política de cabeceras para que el hardware
 *    responda positivamente a las llamadas de NicePod en producción.
 * 3. Preparación de Memoria: El modo standalone y la optimización de side-effects
 *    reducen la carga latente de la aplicación al cargar el mapa.
 */