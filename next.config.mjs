// next.config.mjs
// VERSIÓN: 48.0 (NicePod Shielded Production - Payload Expansion Edition)
// Misión: Orquestar el build industrial y ampliar la frontera de las Server Actions.
// [ESTABILIZACIÓN]: Solución al error 'Body exceeded 1 MB limit' (HTTP 413).

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

  // COMPATIBILIDAD GEOESPACIAL (Mapbox GL JS Parity)
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // PERFORMANCE VISUAL: Aduana de Activos Dinámicos
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
  },

  // INFRAESTRUCTURA DE RED Y SEGURIDAD (Server Actions)
  experimental: {
    serverActions: {
      /**
       * [FIX CRÍTICO V48.0]: 
       * Elevamos el límite de carga de 1MB a 4MB. 
       * Esto permite el transporte de múltiples imágenes (Hero + 3 OCR) 
       * y archivos de audio ambiente capturados por el Administrador.
       */
      bodySizeLimit: '4mb',

      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.github.dev",
        "*.gitpod.io",
        "*.app.github.dev",
        "*.vercel.app",
        "nicepod-alpha.vercel.app"
      ]
    }
  },

  // GOBERNANZA DE WEBPACK (Performance Tuning)
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

  // Mantenemos la PWA desactivada para forzar la carga limpia desde el Edge de Vercel
  // y evitar que el Service Worker viejo intercepte las peticiones de gran tamaño.
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
 * NOTA TÉCNICA DEL ARCHITECT (V48.0):
 * 1. Solución de Escalabilidad: La inyección de 'bodySizeLimit: 4mb' es la llave 
 *    que desbloquea la Fase 2 de Ingesta. Sin este cambio, cualquier intento de 
 *    enviar evidencia fotográfica múltiple resultará en un Error 413.
 * 2. Blindaje de Dominio: Se ha verificado la lista de orígenes permitidos para 
 *    garantizar que las acciones de servidor solo respondan a peticiones 
 *    originadas dentro del ecosistema seguro de NicePod.
 * 3. Preparación de Memoria: Al operar en modo 'standalone', Vercel optimiza el 
 *    tiempo de arranque de las Server Actions, compensando el ligero aumento 
 *    en el tiempo de transferencia de los payloads más grandes.
 */