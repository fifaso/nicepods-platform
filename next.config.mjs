// next.config.mjs
// VERSIÓN: 8.0 (Fix: Force File Tracing for Vercel Serverless)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone es correcto, lo mantenemos
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // CONFIGURACIÓN EXPERIMENTAL PARA ARREGLAR EL ENOENT
  experimental: {
    // 1. Evitamos que webpack rompa dependencias comunes
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'pdfjs-dist', 'sharp'],
    
    // 2. [SOLUCIÓN CRÍTICA]
    // Forzamos a Vercel a incluir los archivos de compilación del cliente dentro de la función serverless.
    // Esto evita el error "ENOENT" cuando una librería intenta leer CSS/JS compilado desde el servidor.
    outputFileTracingIncludes: {
      '/': ['./.next/browser/**/*'],
    },
  },

  // Webpack defensivo
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;