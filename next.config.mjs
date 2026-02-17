// next.config.mjs
// VERSIÓN: 44.2 (NicePod Shielded Standard - Zero-Flicker PWA Edition)
// Misión: Optimizar el rendimiento visual, blindar el build y coordinar la estrategia de caché.
// [ESTABILIZACIÓN]: Eliminación de doble registro de SW y dieta de precaché para reducir 28MB de carga.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  // Bajo los mandamientos de NicePod, un error de tipos o linting detiene el despliegue.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // 2. OPTIMIZACIÓN DE ARQUITECTURA
  // 'standalone' es el estándar para despliegues optimizados en Vercel/Docker.
  output: 'standalone',

  // 3. COMPATIBILIDAD GEOSPESCIAL (Mapbox Fix)
  // Obligatorio para la estabilidad de los módulos ESM de react-map-gl@7.1.7.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // 4. PERFORMANCE VISUAL (Image Intelligence)
  // Activamos soporte para formatos de última generación (AVIF) para reducir peso de activos.
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
  // Definimos orígenes permitidos para asegurar que los Server Actions no sufran bloqueos de CORS.
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

  // 6. GOBERNANZA DE WEBPACK (Performance Monitoring)
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    config.optimization.sideEffects = true; // Forzamos tree-shaking para reducir bundle size.
    return config;
  },

  // 7. SEO Y ESTÁNDARES UX
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
};

/**
 * --- CONFIGURACIÓN PWA (Mobile Experience Mastery) ---
 * [ESTRATEGIA ANTI-PESTAÑEO]:
 * - register: false -> Delegamos el registro a 'pwa-lifecycle.tsx' para evitar el conflicto de doble registro.
 * - reloadOnOnline: false -> Evita refrescos traumáticos de la UI por micro-cortes de red.
 * - cacheOnFrontEndNav: false -> Prioriza la red para asegurar que el usuario vea su identidad real (SSR).
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
   * [SILENCE & WEIGHT PROTOCOL]: 
   * buildExcludes: Filtramos proactivamente imágenes de universos y activos no optimizados.
   * Esto reduce la transferencia inicial de 28MB a un shell ligero de ~4MB.
   */
  dynamicStartUrl: true,
  buildExcludes: [
    /middleware-manifest\.json$/,
    /_middleware\.js$/,
    /public\/images\/universes\/.*$/, // Excluye PNGs pesados del precaché inicial.
    /public\/placeholder.*$/,        // Excluye placeholders redundantes.
    /.*\.map$/                       // Excluye sourcemaps para proteger el código.
  ],
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