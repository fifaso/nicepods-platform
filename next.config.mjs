// next.config.mjs
// VERSIÓN: 47.0 (NicePod Shielded Production - PWA Tactical Shutdown)
// Misión: Orquestar el build industrial, optimizar payload y ejecutar exorcismo de red.
// [ESTABILIZACIÓN]: Desactivación total de Service Workers para romper el bucle 404 de /geo.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  // [MANDATO]: 'false' asegura que Vercel aborte el build si hay errores de tipos,
  // protegiendo la base de datos de contratos rotos.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // OPTIMIZACIÓN DE ARQUITECTURA (Docker Ready)
  output: 'standalone',

  // COMPATIBILIDAD GEOESPACIAL (Mapbox Parity)
  // Instruye a Webpack a transcompilar los módulos ES6 de Mapbox para evitar 
  // errores de sintaxis en navegadores antiguos.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // PERFORMANCE VISUAL: Aduana de Activos
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
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.github.dev",
        "*.gitpod.io",
        "*.app.github.dev",
        "*.vercel.app",
        "nicepod-alpha.vercel.app" // [FIX]: Aseguramos el host de producción exacto
      ]
    }
  },

  // GOBERNANZA DE WEBPACK (Tree Shaking)
  webpack: (config) => {
    config.optimization.sideEffects = true;
    return config;
  },

  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN PWA (ESTRATEGIA EXORCISMO) ---
 * [ALERTA ARQUITECTÓNICA]:
 * El Service Worker (SW) de versiones anteriores estaba secuestrando la red y
 * generando una Tormenta 404 (Race Condition) hacia la ruta muerta '/geo'.
 * 
 * [SOLUCIÓN V47.0]:
 * 'disable: true' apagará completamente la generación del 'sw.js' durante el build.
 * El plugin inyectará scripts de "Auto-Purga" que ordenarán a los navegadores 
 * de los usuarios (Safari/Chrome) eliminar el SW defectuoso de sus memorias.
 */
const withPWA = withPWAInit({
  dest: "public",

  // [FIX CRÍTICO]: Fuerza la desactivación del SW en TODOS los entornos (Dev y Prod)
  disable: true,

  register: false,
  skipWaiting: true,

  // Prevención de intercepción de tráfico
  publicExcludes: ['!manifest.json', '!*.png', '!favicon.ico'],

  // Dieta de Payload
  buildExcludes: [
    /.*\/app\/.*\/page\.js$/,
    /.*\.map$/,
    /middleware-manifest\.json$/,
  ],

  // Exclusión táctica para evitar conflictos con WebSockets de Supabase
  runtimeCaching: [],

  fallbacks: {
    document: "/offline",
  },
});

/**
 * --- EXPORTACIÓN CON SENTRY (TELEMETRÍA) ---
 */
export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    // Suprime los logs de Sentry durante el build local para evitar spam en consola
    silent: true,
    widenClientFileUpload: true,
    // [SEGURIDAD]: Oculta los source maps en producción para que el código fuente 
    // original no sea visible en la pestaña "Fuentes" del navegador.
    hideSourceMaps: true,
  }
);

/**
 * NOTA TÉCNICA DEL ARCHITECT (V47.0):
 * 1. Protocolo de Apagado (disable: true): Esta es una medida de "Sanidad de Flota". 
 *    Al apagar la PWA, los móviles de los usuarios cargarán la Workstation desde Vercel 
 *    (Edge) y no desde el caché corrupto local, restableciendo la conexión con los WebSockets.
 * 2. Host de Producción Seguro: Se añadió 'nicepod-alpha.vercel.app' a la lista de 
 *    orígenes permitidos para Server Actions (Línea 38), previniendo posibles errores 
 *    CSRF (Cross-Site Request Forgery) durante la invocación de las acciones geoespaciales.
 * 3. Reactivación Futura: Una vez que confirmemos en producción que el mapa V2.6 funciona 
 *    perfectamente y el bucle 404 ha desaparecido, cambiaremos este flag de nuevo a 
 *    'process.env.NODE_ENV === "development"' para restaurar las capacidades offline de NicePod.
 */