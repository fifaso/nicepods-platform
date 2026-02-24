// components/navigation/shared/create-button.tsx
// VERSIÓN: 2.1

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

// Importamos la clase maestra de estilos Aurora para mantener la consistencia del ADN visual.
import { auroraButtonClass } from "./nav-styles";

/**
 * INTERFAZ: CreateButtonProps
 * Define el contrato de configuración para el componente de acción.
 */
interface CreateButtonProps {
  /**
   * variant: Define el modo de visualización según el dispositivo.
   * - 'full': Botón rectangular con texto (Estándar para Desktop y Mobile Pill).
   * - 'icon': Botón circular minimalista (Variante de reserva).
   */
  variant?: 'full' | 'icon';

  /**
   * className: Permite la inyección de ajustes de posicionamiento desde el orquestador.
   */
  className?: string;
}

/**
 * COMPONENTE: CreateButton
 * El disparador de la síntesis de sabiduría en NicePod V2.5.
 * 
 * [ARQUITECTURA DE ALTA FIDELIDAD]:
 * - Sincronía H-10: Alineación perfecta con el resto de botones de la consola central.
 * - Micro-Tipografía: Tracking de 0.25em para un aire de lujo industrial.
 * - Feedback Mecánico: El icono Plus rota 90 grados al interactuar (hover).
 */
export function CreateButton({
  variant = 'full',
  className
}: CreateButtonProps) {

  // Determinamos el estado visual para la inyección de clases.
  const isFull = variant === 'full';

  return (
    <Link
      href="/create"
      className="outline-none group/crear-link"
      aria-label="Iniciar la forja de una nueva crónica de voz"
    >
      <Button
        size="sm"
        className={cn(
          // Estilo Aurora: Gradiente cinemático y sombras de profundidad.
          auroraButtonClass,

          // RE-CALIBRACIÓN DE FORMA (Hardware Standard)
          // h-10 (40px) es el estándar de NicePod para botones de control en consola.
          isFull
            ? "rounded-2xl h-10 md:h-10 px-6 md:px-8 min-w-[110px] md:min-w-[120px]"
            : "rounded-2xl h-10 w-10 p-0 flex items-center justify-center",

          // Bordes con definición de cristal
          "border border-white/20 group-hover/crear-link:border-white/40",

          className
        )}
      >
        {/* 
            CAPA DE BRILLO (SHIMMER)
            Efecto óptico de luz que recorre la superficie del botón.
            Utiliza una curva de Bezier de baja latencia para naturalidad.
        */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "-translate-x-full group-hover/crear-link:animate-shimmer pointer-events-none"
          )}
          aria-hidden="true"
        />

        {/* 
            NÚCLEO DEL CONTENIDO (ICONO + NARRATIVA)
        */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {/* Icono Plus con animación de rotación mecánica */}
          <Plus
            className={cn(
              "stroke-[4] transition-transform duration-500 ease-[0.16, 1, 0.3, 1]",
              "group-hover/crear-link:rotate-90",
              isFull ? "h-3.5 w-3.5 md:h-4 md:w-4" : "h-5 w-5"
            )}
          />

          {/* Tipografía de Lujo: Pequeña, Negrita y Espaciada */}
          {isFull && (
            <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.25em] leading-none">
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
 * 1. Diseño Coherente: Al fijar la altura a 'h-10' (40px), este botón se 
 *    fusiona visualmente con los enlaces de 'Inicio' y 'Biblioteca' dentro 
 *    de la cápsula central, creando un bloque sólido de control.
 * 2. Accesibilidad Industrial: El uso de 'stroke-[4]' en el icono Plus 
 *    garantiza que la acción sea reconocible incluso bajo el fuerte 
 *    contraste del gradiente Aurora.
 * 3. Optimización de Renderizado: Se eliminaron variantes innecesarias 
 *    para mantener el bundle de JS lo más ligero posible, priorizando 
 *    la velocidad de carga de la navegación.
 */