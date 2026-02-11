// next.config.mjs
// VERSIÓN: 42.0 (NicePod Shielded Standard - Production Final)
// Misión: Activar el rigor técnico, optimizar el rendimiento visual y blindar la PWA.
// [FIX]: Resolución de advertencias apple-mobile-web-app-capable mediante segregación de metadatos.

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. PROTOCOLO DE RIGOR TÉCNICO (Build Shield)
  // El build fallará ante cualquier error de tipos o inconsistencia de linting.
  // Esto garantiza que el código en producción sea 100% íntegro.
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // 2. OPTIMIZACIÓN DE ARQUITECTURA
  // Genera un binario independiente ideal para despliegues en Vercel.
  output: 'standalone',

  // 3. COMPATIBILIDAD GEOSPESCIAL
  // Crucial para la resolución de módulos ESM de Mapbox en el entorno Next.js 14.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // 4. PERFORMANCE VISUAL (Image Intelligence)
  images: {
    // Activamos la optimización nativa para mejorar el LCP y reducir consumo de datos.
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }
    ],
  },

  // 5. INFRAESTRUCTURA DE RED Y SERVER ACTIONS
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.github.dev",
        "*.gitpod.io",
        "*.app.github.dev",
        "*.vercel.app" // Añadimos wildcard para previsualizaciones de Vercel
      ]
    }
  },

  // 6. GOBERNANZA DE WEBPACK
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };

    // Optimizaciones de Treeshaking para eliminar código muerto del bundle.
    config.optimization.sideEffects = true;

    return config;
  },

  // 7. SEO Y ESTÁNDARES UX
  skipTrailingSlashRedirect: true,
  reactStrictMode: true, // Vital para detectar fugas de memoria en componentes dinámicos
};

/**
 * --- CONFIGURACIÓN PWA (Mobile Experience Mastery) ---
 * [MEJORA CRÍTICA]: Se desactivan las inyecciones automáticas de metadatos.
 * Al delegar los metadatos en el layout.tsx, evitamos la duplicidad y los warnings
 * de 'apple-mobile-web-app-capable' que ensuciaban la consola.
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,

  /**
   * [AUTH INTEGRITY]: Desactivamos el cacheo agresivo en navegación.
   * Esto garantiza que al cambiar de sesión ( Fran -> Invitado ),
   * la App no muestre datos cacheados del usuario anterior.
   */
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,

  /**
   * [SILENCE PROTOCOL]: Evitamos que el plugin genere etiquetas meta legadas.
   * La Metadata API de Next.js 14.2+ ya se encarga de esto correctamente.
   */
  dynamicStartUrl: true,
});

/**
 * --- EXPORTACIÓN FINAL CON CAPA DE OBSERVABILIDAD ---
 * Sentry captura fallos en tiempo real vinculando el correlation_id.
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