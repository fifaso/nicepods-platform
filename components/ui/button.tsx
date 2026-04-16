/**
 * ARCHIVO: components/ui/button.tsx
 * VERSIÓN: 11.0 (NicePod UI Kit - Tactical & Industrial Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Proveer la base de interacción para botones inteligentes y de comando.
 * [REFORMA V11.0]: Soporte para transiciones de escala, variantes glass y resonance.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { classNamesUtility } from "@/lib/utils";

/**
 * buttonVariants: Constitución visual de las acciones del sistema.
 * [MEJORA V11.0]: Se cambia 'transition-colors' por 'transition-all' para permitir
 * animaciones de escala y transformaciones requeridas por el Smart-Action Button.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        // Variante por defecto: Púrpura sólido NicePod
        default: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]",
        
        // Variante Resonancia: Específica para el Smart-Action Button (Malla Activa)
        resonance: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:bg-emerald-500/30 hover:border-emerald-500/60",
        
        // Variante Industrial: Gris oscuro táctico
        industrial: "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-zinc-800",
        
        // Variante Glass: Para controles flotantes sobre el mapa
        glass: "backdrop-blur-xl bg-black/60 border border-white/10 text-white shadow-2xl hover:bg-black/80 hover:border-white/20",
        
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        
        ghost: "hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground",
        
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-[1.5rem] px-10 text-base uppercase tracking-[0.2em] font-black",
        icon: "h-12 w-12",
        // Tamaño táctico para el dock lateral
        tactical: "h-14 w-14 rounded-full", 
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={classNamesUtility(buttonVariants({ variant, size, className }))}
        ref={ref}
        /**
         * Háptica de software: Evitamos el dragging del botón en móviles 
         * para no interferir con los gestos del mapa.
         */
        onDragStart={(e) => e.preventDefault()}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Interaction Fidelity: Se añadió 'active:scale-95' y 'duration-300' para que
 *    cada pulsación del Voyager tenga una respuesta física inmediata y elegante.
 * 2. Variant Expansion: La introducción de 'resonance' y 'glass' permite al 
 *    GeoCreatorOverlay (V5.3) instanciar el Smart-Button con el rigor visual de la V2.8.
 * 3. Shadow Elevation: Las variantes ahora incluyen sombras basadas en variables 
 *    RGB, garantizando que los botones "floten" sobre el motor WebGL.
 * 4. UX Shield: 'select-none' y 'onDragStart' previenen selecciones accidentales 
 *    mientras el usuario opera el radar geográfico.
 */