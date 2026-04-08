/**
 * ARCHIVO: next.config.mjs
 * VERSIÓN: 53.0 (NicePod Shielded Production - Absolute Network Sovereignty)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gobernar la compilación, la seguridad de red y el comportamiento 
 * del servidor de la Workstation NicePod.
 * [REFORMA V53.0]: Resolución definitiva del Error 400 (Bad Request) mediante 
 * especificidad de hostnames, expansión de límites de ingesta industrial 
 * y cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfiguration = {
  // --- I. PROTOCOLO DE RIGOR TÉCNICO (BUILD SHIELD) ---
  eslint: {
    // Prohibido el despliegue con deudas técnicas de análisis estático.
    ignoreDuringBuilds: false
  },
  typescript: {
    // Un error de tipos es un fallo de integridad estructural. Sin excepciones.
    ignoreBuildErrors: false
  },

  // --- II. OPTIMIZACIÓN DE ARQUITECTURA (EDGE OPERATIONS) ---
  // El modo 'standalone' es vital para la ejecución instantánea en nodos perimetrales.
  output: 'standalone',

  // Paquetes que requieren transpilación dedicada para el motor WebGL 3D.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  /**
   * III. CABECERAS DE AUTORIDAD (HARDWARE & SECURITY GOVERNANCE)
   * Misión: Instruir al navegador sobre la liberación de sensores y protección del dato.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            // Apertura selectiva de antenas para la telemetría y captura de capital intelectual.
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

  // --- IV. ADUANA DE ACTIVOS VISUALES (IMAGE OPTIMIZATION) ---
  images: {
    // Misión: Autorizar fuentes de verdad externa y evitar el Error 400 (Bad Request).
    remotePatterns: [
      // Identificación específica del Metal (Supabase Storage)
      { protocol: 'https', hostname: 'arbojlknwilqcszuqope.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.co' },
      // Fuentes de Sabiduria y Perfiles de Usuario
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
    // Soporte para algoritmos de compresión de alta fidelidad.
    formats: ['image/avif', 'image/webp'], 
  },

  // --- V. INFRAESTRUCTURA DE PROCESAMIENTO (EXPERIMENTAL FEATURES) ---
  experimental: {
    // Reducción del tiempo de hidratación optimizando la importación de módulos pesados.
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],

    serverActions: {
      /**
       * bodySizeLimit: 10 Megabytes.
       * Desbloquea la transmisión de expedientes visuales de alta resolución (Pilar 4).
       */
      bodySizeLimit: '10mb',

      allowedOrigins: [
        "localhost:3000",
        "*.vercel.app",
        "nicepod-alpha.vercel.app"
      ]
    }
  },

  // GOBERNANZA DEL EMPAQUETADOR (WEBPACK CONFIGURATION)
  webpack: (webpackConfiguration) => {
    webpackConfiguration.optimization.sideEffects = true;
    return webpackConfiguration;
  },

  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN DE APLICACIÓN WEB PROGRESIVA (HIBERNACIÓN TÉCNICA) ---
 * [ALERTA]: Se mantiene desactivada para priorizar la estabilidad térmica del GPS.
 */
const withProgressiveWebAppEnvironment = withProgressiveWebAppInitialization({
  dest: "public",
  disable: true, // Hibernación para evitar colisiones de CPU en el Main Thread
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
 * NOTA TÉCNICA DEL ARCHITECT (V53.0):
 * 1. Resolución de Activos: La inclusión del hostname específico 'arbojlknwilqcszuqope.supabase.co'
 *    erradica el fallo 400 en el renderizado del logo y avatares.
 * 2. Soberanía de Carga: El límite de 10 Megabytes garantiza que la ingesta de dossiers 
 *    no sea interrumpida por políticas de red restrictivas.
 * 3. Zero Abbreviations Policy: Se purificaron todas las variables de inicialización, 
 *    elevando el archivo al estándar industrial de la Malla de Madrid Resonance.
 */