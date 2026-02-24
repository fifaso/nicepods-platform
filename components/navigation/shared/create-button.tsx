// components/navigation/shared/create-button.tsx
// VERSIÓN: 1.0

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

// Importamos los estilos centralizados para mantener la coherencia
import { auroraButtonClass } from "./nav-styles";

/**
 * INTERFAZ: CreateButtonProps
 * Define la configuración del botón de acción.
 */
interface CreateButtonProps {
  /**
   * variant: Determina la forma visual.
   * - 'full': Botón ancho con texto (Desktop).
   * - 'icon': Botón compacto solo icono (Mobile).
   */
  variant?: 'full' | 'icon';

  /**
   * className: Permite inyectar estilos adicionales de posicionamiento si es necesario.
   */
  className?: string;
}

/**
 * COMPONENTE: CreateButton
 * El disparador de la creatividad.
 */
export function CreateButton({ variant = 'full', className }: CreateButtonProps) {

  // LÓGICA DE RENDERIZADO CONDICIONAL
  const isFull = variant === 'full';

  return (
    <Link href="/create" aria-label="Crear nuevo podcast">
      <Button
        size="sm"
        className={cn(
          // Estilo Base Aurora (Gradiente + Sombras + Hover)
          auroraButtonClass,

          // Variantes de Forma
          isFull
            ? "rounded-full h-8 px-8 min-w-[100px]"
            : "rounded-full h-8 w-8 p-0 flex items-center justify-center border-white/20",

          // Inyección externa
          className
        )}
      >
        {/* Capa de Brillo Animado (Shimmer Effect) */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/crear:animate-shimmer pointer-events-none"
          aria-hidden="true"
        />

        {/* Contenido Seguro (Z-Index superior al brillo) */}
        <span className="relative z-10 flex items-center gap-1.5">
          <Plus
            className={cn(
              "stroke-[3]",
              isFull ? "h-3.5 w-3.5 mr-1" : "h-4 w-4"
            )}
          />

          {/* Texto solo visible en variante Full */}
          {isFull && "CREAR"}
        </span>
      </Button>
    </Link>
  );
}