/**
 * ARCHIVE: components/navigation/shared/nav-brand.tsx
 * VERSION: 4.1 (NicePod Static Asset Shield - Sovereign Branding Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer el ancla de identidad visual con eficiencia de red absoluta, 
 * garantizando la carga instantánea del isotipo y la navegación soberana.
 * [REFORMA V4.0]: Implementación de Soberanía Local (Fix Error 400), purificación 
 * nominal absoluta y cumplimiento de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

/**
 * INTERFACE: NavBrandComponentProperties
 */
interface NavBrandComponentProperties {
  /** isUserAuthenticatedStatus: Determines if the destination is the Dashboard or the Global Entry Point. */
  isUserAuthenticatedStatus: boolean;
}

/**
 * NavBrand: The identity and sovereign access component of NicePod.
 */
export function NavBrand({ isUserAuthenticatedStatus }: NavBrandComponentProperties) {
  
  /**
   * navigationTargetUniformResourceLocator:
   * Mission: Define the tactical navigation destination based on authority status.
   */
  const navigationTargetUniformResourceLocator = isUserAuthenticatedStatus ? "/dashboard" : "/";

  return (
    <div className="flex items-center justify-start isolate">
      <Link
        href={navigationTargetUniformResourceLocator}
        className="flex items-center gap-3 md:gap-4 group outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl p-1"
        aria-label="Regresar al epicentro de NicePod"
      >
        {/* 
            CONTENEDOR DEL ISOTIPO INDUSTRIAL
            Mantenemos dimensiones estrictas para evitar el Layout Shift durante la carga.
        */}
        <div className="relative flex items-center justify-center h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xl md:rounded-2xl border border-white/10 shadow-inner bg-zinc-900 transition-all duration-700 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)]">
          <Image
            // [FIX V4.0]: El activo local garantiza 0ms de latencia y neutraliza el Error 400.
            src="/nicepod-logo.png"
            alt="Isotipo NicePod Intelligence"
            width={48}
            height={48}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            priority // Carga con prioridad máxima para optimizar el LCP
            unoptimized // Bypass de la API de optimización para activos de marca soberanos
          />
        </div>

        {/* 
            LOGOTIPO TIPOGRÁFICO SOBERANO
            Refuerza la marca mediante tipografía de alto contraste.
        */}
        <span className={cn(
          "font-black text-xl md:text-2xl tracking-tighter uppercase italic leading-none transition-colors duration-500",
          "hidden xs:block text-white group-hover:text-primary font-serif"
        )}>
          NicePod
        </span>
      </Link>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Zero Abbreviations Policy: Se purificaron términos como 'Props', 'isAuthenticated', 
 *    'targetHref' e 'img', elevando el componente al estándar industrial.
 * 2. Performance Sovereignty: Al utilizar una ruta local absoluta ('/nicepod-logo.png') 
 *    en lugar de una importación estática de Webpack o una URL de Supabase, eliminamos 
 *    la dependencia de red externa para la renderización de la marca corporativa.
 * 3. Accessibility Check: Se mantiene el atributo 'aria-label' descriptivo y el 
 *    soporte de foco mediante 'focus-visible' para navegación por hardware externo.
 */