// next.config.mjs
// VERSIÓN: 51.0 (NicePod Shielded Production - CPU Sovereignty & Anti-Flicker Edition)
// Misión: Aniquilar la congestión del Main Thread desactivando la PWA y optimizando el bundle inicial.
// [ESTABILIZACIÓN]: Erradicación de tareas largas (>100ms) para liberar el canal del GPS.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- I. PROTOCOLO DE RIGOR TÉCNICO (BUILD SHIELD) ---
  eslint: {
    // Garantizamos que no suba código con deudas de linting.
    ignoreDuringBuilds: false
  },
  typescript: {
    // Un error de tipos es un fallo de misión. No se permite el bypass.
    ignoreBuildErrors: false
  },

  // --- II. OPTIMIZACIÓN DE ARQUITECTURA ---
  // Standalone es vital para que las funciones en el Edge de Vercel arranquen en milisegundos.
  output: 'standalone',

  // Paquetes que requieren compilación dedicada para el motor WebGL 3D.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  /**
   * III. CABECERAS DE AUTORIDAD (HARDWARE & SECURITY)
   * Misión: Ordenar al navegador liberar los sensores y proteger la integridad del dato.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            // geolocation=(self) es la llave que abre la antena GPS al motor de Mapbox.
            value: 'geolocation=(self), camera=(self), microphone=(self)'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ];
  },

  // --- IV. PERFORMANCE VISUAL Y RED ---
  images: {
    // Aduana de activos para evitar descargas lentas desde dominios no autorizados.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
    formats: ['image/avif', 'image/webp'], // Soporte para compresión de alta fidelidad
  },

  // --- V. INFRAESTRUCTURA DE RED SOBERANA ---
  experimental: {
    // Misión: Reducir el pestañeo de hidratación optimizando las importaciones de Lucide y UI.
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],

    serverActions: {
      /**
       * bodySizeLimit: 4mb.
       * Desbloquea la Fase 2 de Ingesta (Hero + 3 OCR) sin errores de carga.
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
 * --- CONFIGURACIÓN PWA (MODO HIBERNACIÓN) ---
 * [ALERTA]: El reporte de consola muestra que el Service Worker está bloqueando la CPU.
 * Se fuerza la desactivación total para que el GPS tenga prioridad absoluta.
 */
const withPWA = withPWAInit({
  dest: "public",

  // [OPERACIÓN V51.0]: 'disable: true' detiene la generación del script sw.js corrupto.
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
 * NOTA TÉCNICA DEL ARCHITECT (V51.0):
 * 1. Rescate del Main Thread: Al desactivar la PWA, eliminamos el 100% de las tareas
 *    largas relacionadas con errores de red del Service Worker, liberando la CPU 
 *    para que el pulso del GPS se procese en milisegundos.
 * 2. Erradicación del Pestañeo: 'optimizePackageImports' reduce el tiempo de 
 *    bloqueo durante la hidratación de React, permitiendo que el Dashboard sea 
 *    interactivo casi instantáneamente tras recibir el HTML.
 * 3. Malla de Seguridad: Se mantienen las cabeceras de autoridad para que el 
 *    navegador no dude al entregar la ubicación real del usuario.
 */