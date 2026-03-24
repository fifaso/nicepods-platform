// components/navigation/shared/nav-brand.tsx
// VERSIÓN: 3.0 (NicePod Static Asset Shield - Zero-Thrashing Edition)
// Misión: El ancla de identidad visual con eficiencia de red absoluta.
// [ESTABILIZACIÓN]: Importación estática y bypass de optimización para erradicar el Image Thrashing.

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// [STATIC SHIELD]: Al importar directamente, Next.js extrae el ancho y alto 
// en tiempo de compilación, eliminando la necesidad de adivinar el tamaño.
import logoImg from "@/public/nicepod-logo.png";

/**
 * INTERFAZ: NavBrandProps
 * Define la configuración del átomo de marca.
 */
interface NavBrandProps {
  /**
   * isAuthenticated: Determina la lógica de redirección.
   * - true: Dirige al Epicentro Creativo (/dashboard).
   * - false: Dirige al Punto de Entrada Global (/).
   */
  isAuthenticated: boolean;
}

/**
 * COMPONENTE: NavBrand
 * El ancla de identidad de NicePod V2.6.
 */
export function NavBrand({ isAuthenticated }: NavBrandProps) {
  // Determinación del destino táctico sin pasar por middlewares complejos.
  const targetHref = isAuthenticated ? "/dashboard" : "/";

  return (
    <div className="flex items-center justify-start">
      <Link
        href={targetHref}
        className="flex items-center gap-3 md:gap-4 group outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl p-1"
        aria-label="Regresar al inicio de NicePod"
      >
        {/* 
            CONTENEDOR DEL ISOTIPO
            Mantenemos el bounding box estricto (40x40 en móvil, 48x48 en desktop).
        */}
        <div className="relative flex items-center justify-center h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xl md:rounded-2xl border border-white/10 shadow-inner bg-zinc-900 transition-all duration-700 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]">
          <Image
            src={logoImg}
            alt="Isotipo NicePod"
            width={48}
            height={48}
            // [FIX LINTER & RENDER]: Eliminamos el 'fill' y forzamos w-full/h-full. 
            // Sustituimos el ease arbitrario por 'ease-out' estándar.
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            priority
            unoptimized // [CRÍTICO]: Bypass de Vercel Image Optimization API para activos estáticos SVG/PNG.
          />
        </div>

        {/* 
            LOGOTIPO TIPOGRÁFICO
        */}
        <span className={cn(
          "font-black text-xl md:text-2xl tracking-tighter uppercase italic leading-none transition-colors duration-500",
          "hidden xs:block text-white group-hover:text-primary"
        )}>
          NicePod
        </span>
      </Link>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Aniquilación de Image Thrashing: La adición de 'unoptimized={true}' sobre un 'import' 
 *    estático detiene la generación de múltiples versiones de la imagen por parte del servidor 
 *    cada vez que el componente padre se redimensiona.
 * 2. Supresión de 'getSafeAsset': Para archivos nativos del proyecto (locales), el uso 
 *    de 'getSafeAsset' aportaba overhead innecesario. Esta función se reserva exclusivamente 
 *    para URLs que provienen de la Bóveda (Supabase Storage).
 * 3. Limpieza de CI/CD: La eliminación de clases Tailwind arbitrarias como 'ease-[0.16...]' 
 *    silencia las advertencias amarillas del compilador de Vercel.
 */