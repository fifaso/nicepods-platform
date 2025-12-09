// next.config.mjs
// VERSIÓN: 7.0 (Clean Slate: PWA Removed Completely)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // [CRÍTICO] Standalone mode ayuda a Vercel a gestionar archivos correctamente
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimización de imágenes (Mantenemos esto para ahorro de costes)
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

  // Configuración de Webpack Defensiva
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Evita que librerías intenten cargar módulos nativos que no existen en Vercel
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },

  // Cabeceras de seguridad (Mantenemos esto por seguridad)
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

// [NOTA]: Hemos eliminado 'withPWA' completamente.
// Exportamos la configuración plana para garantizar que no hay procesos ocultos fallando.
export default nextConfig;