// components/navigation/shared/create-button.tsx
// VERSIÓN: 2.0

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

// Importamos la clase maestra de estilos Aurora para mantener la consistencia del gradiente.
import { auroraButtonClass } from "./nav-styles";

/**
 * INTERFAZ: CreateButtonProps
 * Define la configuración del botón de acción según el contexto de visualización.
 */
interface CreateButtonProps {
  /**
   * variant: Define el comportamiento visual.
   * - 'full': Botón con texto y padding generoso (Desktop/Mobile Principal).
   * - 'icon': Variante secundaria (Solo si el diseño requiere minimalismo extremo).
   */
  variant?: 'full' | 'icon';

  /**
   * className: Inyección de estilos de posicionamiento externos.
   */
  className?: string;
}

/**
 * COMPONENTE: CreateButton
 * El epicentro de la interacción en la Workstation NicePod V2.5.
 * 
 * [RE-CALIBRACIÓN DE UX]:
 * - Se elimina la variante circular (+) en móvil por una cápsula con texto.
 * - Shimmer effect: Animación de brillo para guiar la mirada del curador.
 * - h-11 / h-13: Alturas sincronizadas con el nuevo header monumental.
 */
export function CreateButton({ variant = 'full', className }: CreateButtonProps) {

  // Determinamos si el botón debe mostrar su narrativa textual.
  const isFull = variant === 'full';

  return (
    <Link
      href="/create"
      className="outline-none"
      aria-label="Iniciar la forja de un nuevo podcast"
    >
      <Button
        size="sm"
        className={cn(
          // Estilo Aurora: Gradiente vibrante, sombras de impacto y micro-interacción active:scale.
          auroraButtonClass,

          // FORMA Y DIMENSIONES (Sincronizado con nav-styles V2.0)
          // - Mobile: Altura 44px (h-11), esquinas redondeadas industriales (rounded-2xl).
          // - Desktop: Altura 52px (md:h-13), esquinas suaves.
          isFull
            ? "rounded-2xl h-11 md:h-13 px-6 md:px-10 min-w-[100px] md:min-w-[130px]"
            : "rounded-2xl h-11 w-11 p-0 flex items-center justify-center border-white/20",

          className
        )}
      >
        {/* 
            CAPA DE BRILLO (SHIMMER)
            Efecto cinemático que recorre el botón al pasar el cursor, 
            transmitiendo la sensación de hardware de alta tecnología.
        */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/crear:animate-shimmer pointer-events-none"
          aria-hidden="true"
        />

        {/* 
            NÚCLEO DEL CONTENIDO
            Alineación perfecta del icono Plus y el texto 'CREAR'.
        */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Plus
            className={cn(
              "stroke-[4] transition-transform duration-500 group-hover/crear:rotate-90",
              isFull ? "h-3.5 w-3.5 md:h-4 md:w-4" : "h-5 w-5"
            )}
          />

          {isFull && (
            <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.25em] leading-none">
              Crear
            </span>
          )}
        </span>
      </Button>
    </Link>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Conversión Visual: Al añadir el texto 'Crear' en móvil (h-11), el hit-box
 *    se expande horizontalmente, facilitando el acceso ergonómico.
 * 2. Estética Aurora: El gradiente se desplaza ligeramente en hover, creando
 *    profundidad. El uso de rounded-2xl lo diferencia de los botones estándar
 *    de Shadcn (rounded-md), marcándolo como un componente soberano.
 * 3. Rigor Tipográfico: El tracking-[0.25em] asegura que el texto se perciba
 *    como parte de una interfaz de control industrial, no como un simple botón de web.
 */