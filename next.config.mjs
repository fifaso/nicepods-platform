/**
 * ARCHIVO: next.config.mjs
 * VERSIÓN: 52.0 (NicePod Shielded Production - Global Asset Sovereignty)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gobernar la compilación, la seguridad de red y el comportamiento 
 * del servidor de la Workstation.
 * [REFORMA V52.0]: Autorización del dominio de Unsplash (Resolución Error 400), 
 * expansión del límite de carga para activos de alta fidelidad y cumplimiento 
 * estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfiguration = {
  // --- I. PROTOCOLO DE RIGOR TÉCNICO (BUILD SHIELD) ---
  eslint: {
    // Garantizamos que no se despliegue código con deudas de análisis estático.
    ignoreDuringBuilds: false
  },
  typescript: {
    // Un error de tipos es un fallo de misión. No se permite evasión de validación.
    ignoreBuildErrors: false
  },

  // --- II. OPTIMIZACIÓN DE ARQUITECTURA (EDGE DEPLOYMENT) ---
  // La salida independiente es vital para que las funciones en los nodos perimetrales arranquen instantáneamente.
  output: 'standalone',

  // Paquetes que requieren compilación dedicada para el motor tridimensional.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  /**
   * III. CABECERAS DE AUTORIDAD (HARDWARE & SECURITY)
   * Misión: Ordenar al navegador la liberación de sensores y proteger la integridad del dato.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            // geolocation=(self) es la llave que abre la antena de posicionamiento global al motor de Mapbox.
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

  // --- IV. RENDIMIENTO VISUAL Y RED ---
  images: {
    // Aduana de activos para evitar descargas lentas o rechazos desde dominios externos.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      // [BUILD SHIELD FIX]: Autorización explícita para resolver el Error 400 (Bad Request).
      { protocol: 'https', hostname: 'images.unsplash.com' } 
    ],
    // Soporte para algoritmos de compresión de alta fidelidad geométrica.
    formats: ['image/avif', 'image/webp'], 
  },

  // --- V. INFRAESTRUCTURA DE RED SOBERANA ---
  experimental: {
    // Misión: Reducir el tiempo de bloqueo optimizando las importaciones de iconografía y componentes visuales.
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],

    serverActions: {
      /**
       * [MEJORA INDUSTRIAL]: Expansión a 10 Megabytes.
       * Desbloquea la captura de inteligencia fotorrealista sin colapsar el servidor de acciones.
       */
      bodySizeLimit: '10mb',

      allowedOrigins: [
        "localhost:3000",
        "*.vercel.app",
        "nicepod-alpha.vercel.app"
      ]
    }
  },

  // GOBERNANZA DE COMPILACIÓN ESTRUCTURAL
  webpack: (webpackConfiguration) => {
    webpackConfiguration.optimization.sideEffects = true;
    return webpackConfiguration;
  },

  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN DE APLICACIÓN WEB PROGRESIVA (MODO HIBERNACIÓN) ---
 * [ALERTA PERICIAL]: El reporte de consola confirmó que el Trabajador de Servicio 
 * estaba bloqueando la Unidad Central de Procesamiento (CPU).
 * Se fuerza la desactivación total para que la telemetría posicional tenga prioridad absoluta.
 */
const withProgressiveWebAppEnvironment = withProgressiveWebAppInitialization({
  dest: "public",

  // [OPERACIÓN DE ESTABILIDAD]: Detiene la generación del script de caché corrupto.
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
 * --- EXPORTACIÓN CON PLATAFORMA DE OBSERVABILIDAD (SENTRY) ---
 */
export default withSentryConfig(
  withProgressiveWebAppEnvironment(nextConfiguration),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,
  }
);

/**
 * NOTA TÉCNICA DEL ARCHITECT (V52.0):
 * 1. Resolución de Activos (Error 400): La inyección de 'images.unsplash.com' elimina
 *    la fricción de red observada en la consola, permitiendo el renderizado fluido del ecosistema.
 * 2. Rescate del Hilo Principal: Al mantener desactivada la Aplicación Web Progresiva, 
 *    eliminamos las tareas largas (>200ms) liberando el ciclo de ejecución.
 * 3. Zero Abbreviations Policy: Se renombraron variables locales (nextConfiguration, 
 *    withProgressiveWebAppEnvironment, webpackConfiguration) manteniendo el esquema 
 *    obligatorio de Next.js intacto.
 */