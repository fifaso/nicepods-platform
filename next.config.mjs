// next.config.mjs
// VERSIÓN: 23.0 (Madrid Resonance - Vercel Bulletproof Resolution)

import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // [ESTRATEGIA 1]: Forzamos la transpilación de las librerías de mapas
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.github.dev", "*.gitpod.io", "*.app.github.dev"]
    }
  },

  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  webpack: (config, { isServer }) => {
    config.infrastructureLogging = { level: 'error' };

    // [ESTRATEGIA 2]: Alias de Módulos para PNPM + Vercel
    // Esta técnica redirige a Webpack directamente al archivo fuente de la librería,
    // saltándose la validación del package.json que está fallando en el build.
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-map-gl': path.resolve(__dirname, 'node_modules/react-map-gl/dist/esm/index.js'),
      'mapbox-gl': path.resolve(__dirname, 'node_modules/mapbox-gl/dist/mapbox-gl.js'),
    };

    // [ESTRATEGIA 3]: Prevención de fallos en el lado del servidor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // [ESTRATEGIA 4]: Manejo de binarios pesados (Canvas/Encoding)
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];

    return config;
  },

  skipTrailingSlashRedirect: true,
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: { document: "/offline" },
});

export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: 'nicepod',
    project: 'javascript-nextjs',
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);