// components/ui/slider.tsx
// VERSIÓN: 2.0 (NicePod Industrial Style - Precision Audio Slider)
// Misión: Proveer un control de tiempo fluido con estética Glassmorphism.
// [ESTABILIZACIÓN]: Implementación de efectos de resplandor (glow) y refinamiento de escala.

"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group cursor-pointer",
      className
    )}
    {...props}
  >
    {/* PISTA BASE: Más fina y oscura para destacar el progreso */}
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10 backdrop-blur-md">
      {/* RANGO RECORRIDO: Color Primario con sutil resplandor interno */}
      <SliderPrimitive.Range className="absolute h-full bg-primary shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300" />
    </SliderPrimitive.Track>

    {/* THUMB: Botón de arrastre minimalista y premium */}
    <SliderPrimitive.Thumb className={cn(
      "block h-4 w-4 rounded-full border-2 border-white bg-primary shadow-2xl",
      "ring-offset-background transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "scale-0 group-hover:scale-100 active:scale-125" // Solo aparece al pasar el ratón o interactuar
    )} />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. UX Adaptativa: El 'Thumb' ahora es invisible (scale-0) por defecto y aparece 
 *    orgánicamente al hacer 'hover' sobre la barra, manteniendo la interfaz limpia.
 * 2. Estética Spotify: Se redujo el grosor de la pista a 1.5 para una apariencia 
 *    más moderna y menos intrusiva en pantallas de alta densidad.
 * 3. Consistencia de Marca: El uso de sombras sobre el 'Range' inyecta profundidad 
 *    visual alineada con la atmósfera Aurora de NicePod.
 */