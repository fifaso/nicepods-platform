// next.config.mjs
// VERSIÓN FINAL: Configuración actualizada para habilitar la PWA en producción.

import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// [CAMBIO QUIRÚRGICO #1]: Se define la configuración específica para el plugin PWA.
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Clave: Deshabilita la PWA en desarrollo.
};

// [CAMBIO QUIRÚRGICO #2]: Se envuelve la configuración de Next.js con el plugin PWA.
const withPwaPlugin = withPWA(pwaConfig);

export default withPwaPlugin(nextConfig);