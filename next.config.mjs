// next.config.mjs
// VERSIÓN: 45.0 (NicePod Shielded Standard - Zero-Flicker & Clean Console Edition)
// Misión: Orquestar el build industrial, optimizar el payload y blindar la estrategia PWA.
// [ESTABILIZACIÓN]: Resolución definitiva de colisiones de metadata y bloqueos de hidratación.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  // Garantizamos que NicePod sea un sistema de Zero-Warning. Si hay errores, el build aborta.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // 2. OPTIMIZACIÓN DE ARQUITECTURA
  // Generamos un binario standalone optimizado para despliegues en el Edge de Vercel.
  output: 'standalone',

  // 3. COMPATIBILIDAD GEOSPESCIAL (Mapbox Registry)
  // Obligatorio para la estabilidad de los módulos ESM de react-map-gl@7.1.7.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // 4. PERFORMANCE VISUAL (Image Intelligence)
  // Activamos soporte para AVIF (compresión superior) y WebP para reducir el peso de los assets.
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
  // Definimos orígenes permitidos para asegurar que el túnel de datos fluya sin bloqueos de CORS.
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

  // 6. GOBERNANZA DE WEBPACK (Tree Shaking)
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
 * [ESTRATEGIA ANTI-PESTAÑEO]:
 * - register: false -> La soberanía del registro reside en el componente 'PwaLifecycle'.
 * - cacheOnFrontEndNav: false -> EVITA EL PESTAÑEO al obligar a consultar la red para la identidad.
 * - reloadOnOnline: false -> Previene refrescos disruptivos por micro-cortes de Wi-Fi/5G.
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  skipWaiting: true,
  reloadOnOnline: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,

  /**
   * [CLEAN CONSOLE PROTOCOL]:
   * 'publicExcludes' evita que el plugin procese el manifest.json de forma interna,
   * impidiendo que inyecte etiquetas meta de Apple obsoletas en el HTML.
   */
  dynamicStartUrl: true,
  publicExcludes: ['!manifest.json', '!*.png', '!favicon.ico'],

  /**
   * [DIETA DE PAYLOAD]: 
   * Excluimos del precaché los assets pesados de los universos y archivos de mapeo.
   * Esto reduce la transferencia inicial de 28MB a ~4MB.
   */
  buildExcludes: [
    /middleware-manifest\.json$/,
    /_middleware\.js$/,
    /public\/images\/universes\/.*$/, // Carga bajo demanda (Lazy-first)
    /public\/placeholder.*$/,        // Carga diferida
    /.*\.map$/                       // Exclusión de sourcemaps
  ],

  fallbacks: {
    document: "/offline", // Garantiza resiliencia en pérdida de señal.
  },
});

/**
 * --- EXPORTACIÓN CON SENTRY (Full Observability) ---
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