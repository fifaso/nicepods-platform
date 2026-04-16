/**
 * ARCHIVE: components/navigation/shared/nav-brand.tsx
 * VERSION: 4.1 (NicePod Static Asset Shield - Sovereign Branding Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * MISSION: Proveer el ancla de identidad visual con eficiencia de red absoluta,
 * garantizando la carga instantánea del isotipo y la navegación soberana.
 * [REFORMA V4.1]: Absolute nominal sovereignty. Full ZAP compliance.
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { classNamesUtility } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

/**
 * INTERFACE: NavBrandComponentProperties
 */
interface NavBrandComponentProperties {
  /** isUserAuthenticatedStatus: Determina si el destino es el Dashboard o el Punto de Entrada Global. */
  isUserAuthenticatedStatus: boolean;
}

/**
 * NavBrand: El componente de identidad y acceso soberano de NicePod.
 */
export function NavBrand({ isUserAuthenticatedStatus }: NavBrandComponentProperties) {
  
  /**
   * navigationTargetUniformResourceLocator:
   * Misión: Definir el destino táctico de navegación basándose en el estado de autoridad.
   */
  const navigationTargetUniformResourceLocator = isUserAuthenticatedStatus ? "/dashboard" : "/";

  return (
    <div className="flex items-center justify-start isolate">
      <Link
        href={navigationTargetUniformResourceLocator}
        className="flex items-center gap-3 md:gap-4 group outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl p-1"
        aria-label="Regresar al epicentro de NicePod"
      >
        <div className="relative flex items-center justify-center h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xl md:rounded-2xl border border-white/10 shadow-inner bg-zinc-900 transition-all duration-700 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)]">
          <Image
            src="/nicepod-logo.png"
            alt="Isotipo NicePod Intelligence"
            width={48}
            height={48}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            priority
            unoptimized
          />
        </div>

        <span className={classNamesUtility(
          "font-black text-xl md:text-2xl tracking-tighter uppercase italic leading-none transition-colors duration-500",
          "hidden xs:block text-white group-hover:text-primary font-serif"
        )}>
          NicePod
        </span>
      </Link>
    </div>
  );
}
