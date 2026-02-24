// components/navigation/shared/nav-brand.tsx
// VERSIÓN: 2.0

import { getSafeAsset } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

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
 * El ancla de identidad de NicePod V2.5.
 * 
 * [RE-CALIBRACIÓN VISUAL]:
 * - Isotipo: Escalado de h-7/h-8 a h-10 (40px) en móvil y h-12 (48px) en desktop.
 * - Logotipo: Aumento a text-xl (móvil) y text-2xl (desktop) con itálica masiva.
 * - Proximidad: gap-3 para un aire industrial y respirable.
 */
export function NavBrand({ isAuthenticated }: NavBrandProps) {
  // Recuperación soberana del activo visual con protocolo de fallback.
  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  // Determinación del destino táctico.
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
            - Shadow-inner: Para dar profundidad al logo sobre el cristal.
            - border-white/10: Definición de borde en baja opacidad.
        */}
        <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xl md:rounded-2xl border border-white/10 shadow-inner bg-zinc-900 transition-all duration-700 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]">
          <Image
            src={logoSrc}
            alt="Isotipo NicePod"
            fill
            sizes="(max-width: 768px) 40px, 48px"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]"
            priority // Carga prioritaria para el Largest Contentful Paint (LCP)
          />
        </div>

        {/* 
            LOGOTIPO TIPOGRÁFICO
            - italic: Marca el dinamismo de la voz.
            - tracking-tighter: Densidad tipográfica profesional.
            - hidden sm:block: Se oculta en móviles ultra-estrechos (<380px) para priorizar botones de acción.
        */}
        <span className="font-black text-xl md:text-2xl tracking-tighter hidden xs:block uppercase italic text-white leading-none group-hover:text-primary transition-colors duration-500">
          NicePod
        </span>
      </Link>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Densidad de Isotipo: El aumento a 48px en desktop permite que el logo 
 *    sea legible incluso ante el desenfoque de fondo de backdrop-blur-2xl.
 * 2. Optimizacion SEO: El uso de una etiqueta semántica Link con aria-label 
 *    garantiza que los indexadores comprendan la jerarquía del sitio.
 * 3. Diseño Responsivo: Se ha introducido el breakpoint 'xs' (personalizado 
 *    en tailwind.config) o se asume el comportamiento base para asegurar que 
 *    el texto no colisione con el botón 'CREAR' en dispositivos pequeños.
 */