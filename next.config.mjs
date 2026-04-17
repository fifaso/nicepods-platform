/**
 * ARCHIVO: next.config.mjs
 * VERSIÓN: 8.0 (Madrid Resonance - Omnisovereign Edition)
 * PROTOCOLO: TOTAL REPOSITORY GOVERNANCE
 * 
 * MISIÓN: Gobernar la compilación, la seguridad hermética de red y la 
 * estabilidad infraestructural de la Workstation NicePod.
 * 
 * [ACTUALIZACIÓN V8.0]: Implementación de la Soberanía Hermética (Artículo III),
 * unificación de políticas de seguridad para el Bucle Cerrado y blindaje 
 * contra regresiones axiales en despliegues de Vercel.
 * 
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Hermético)
 */

import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfiguration = {
  // --- I. DOCTRINA BSS (BUILD SHIELD SOVEREIGNTY) ---
  eslint: {
    // La integridad nominal es pre-requisito para el despliegue.
    ignoreDuringBuilds: false
  },
  typescript: {
    // El sistema rechaza cualquier fractura de tipos en el Crystal.
    ignoreBuildErrors: false
  },

  // --- II. SOBERANÍA HERMÉTICA (NETWORK & SECURITY) ---
  output: 'standalone',
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,

  // Paquetes para el motor de Inteligencia Geoespacial.
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  async headers() {
    const contentSecurityPolicyHeaderValue = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com;
      connect-src 'self' *.supabase.co *.vercel-insights.com vitals.vercel-insights.com *.sentry.io;
      img-src 'self' blob: data: *.supabase.co lh3.googleusercontent.com images.unsplash.com avatars.githubusercontent.com api.dicebear.com;
      style-src 'self' 'unsafe-inline';
      font-src 'self' data:;
      worker-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicyHeaderValue
          },
          {
            key: 'Permissions-Policy',
            // Apertura controlada de sensores para la captura de capital intelectual.
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
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
      },
    ];
  },

  // --- III. ADUANA DE ACTIVOS VISUALES (IMAGE OPTIMIZATION) ---
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'arbojlknwilqcszuqope.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // --- IV. INFRAESTRUCTURA DE PROCESAMIENTO (EXPERIMENTAL) ---
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    serverActions: {
      // Capacidad industrial para la ingesta de expedientes multimedia.
      bodySizeLimit: '10mb',
      allowedOrigins: [
        "localhost:3000",
        "*.vercel.app",
        "nicepod-alpha.vercel.app"
      ]
    }
  },

  // GOBERNANZA DEL EMPAQUETADOR (WEBPACK)
  webpack: (webpackConfiguration) => {
    webpackConfiguration.optimization.sideEffects = true;
    return webpackConfiguration;
  },
};

/**
 * --- CONFIGURACIÓN PWA (HIBERNACIÓN POR ESTABILIDAD TÉRMICA) ---
 */
const withProgressiveWebAppEnvironment = withProgressiveWebAppInitialization({
  dest: "public",
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
 * --- EXPORTACIÓN SOBERANA CON OBSERVABILIDAD SENTRY ---
 */
const sentryConfiguration = {
  org: 'nicepod',
  project: 'javascript-nextjs',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
};

export default withSentryConfig(
  withProgressiveWebAppEnvironment(nextConfiguration),
  sentryConfiguration
);