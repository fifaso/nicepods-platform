// components/navigation/shared/nav-brand.tsx
// VERSIÓN: 1.0

import { getSafeAsset } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

/**
 * INTERFAZ: NavBrandProps
 * Define la configuración del átomo de marca.
 */
interface NavBrandProps {
  /**
   * isAuthenticated: Determina el destino del clic.
   * - true -> /dashboard (Workstation)
   * - false -> / (Landing Page)
   */
  isAuthenticated: boolean;
}

/**
 * COMPONENTE: NavBrand
 * El ancla visual de NicePod.
 * 
 * [OPTIMIZACIÓN]:
 * - priority={true}: Fuerza al navegador a cargar el logo inmediatamente (mejora LCP).
 * - sizes="32px": Indica al navegador que descargue la versión más pequeña posible.
 */
export function NavBrand({ isAuthenticated }: NavBrandProps) {
  // Recuperación segura del activo visual
  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  // Destino inteligente
  const targetHref = isAuthenticated ? "/dashboard" : "/";

  return (
    <div className="flex-1 flex justify-start items-center">
      <Link
        href={targetHref}
        className="flex items-center space-x-2 md:space-x-3 group outline-none"
        aria-label="Ir al inicio de NicePod"
      >
        {/* Contenedor del Isotipo */}
        <div className="relative h-7 w-7 md:h-8 md:w-8 overflow-hidden rounded-lg md:rounded-xl border border-white/10 shadow-inner bg-zinc-900">
          <Image
            src={logoSrc}
            alt="NicePod Isotype"
            fill
            sizes="32px"
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            priority
          />
        </div>

        {/* Logotipo Tipográfico (Oculto en móviles muy pequeños si fuera necesario, aquí visible) */}
        <span className="font-black text-base md:text-lg tracking-tighter hidden sm:block uppercase italic text-white leading-none group-hover:text-primary transition-colors duration-300">
          NicePod
        </span>
      </Link>
    </div>
  );
}