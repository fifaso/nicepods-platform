// next.config.mjs
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // OBLIGATORIO: Next.js maneja la resolución interna de estas librerías
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  experimental: {
    esmExternals: 'loose', // Permite mayor flexibilidad con librerías ESM "rotas"
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.github.dev", "*.gitpod.io"]
    }
  },

  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    return config;
  },

  skipTrailingSlashRedirect: true,
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withSentryConfig(withPWA(nextConfig), {
  org: 'nicepod',
  project: 'javascript-nextjs',
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
});