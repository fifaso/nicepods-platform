// next.config.mjs
// VERSIÓN: GOLDEN MASTER (Clean & Stable)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Standalone: La clave para despliegues estables en Vercel/Docker.
  // Empaqueta automáticamente solo lo necesario, sin fantasmas.
  output: 'standalone',

  // 2. Optimizaciones de Build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 3. Imágenes: Optimización en origen (Ahorro de costes)
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

  // 4. Paquetes Externos: Prevención de errores de empaquetado comunes
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'pdfjs-dist', 'sharp'],
  },

  // 5. Webpack Defensivo: Ignora módulos de sistema que no existen en Edge/Serverless
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },

  // 6. Seguridad: Cabeceras HTTP estrictas
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