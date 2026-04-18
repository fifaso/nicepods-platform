/**
 * ARCHIVO: components/ui/badge.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Nominal Sovereignty
 * MISIÓN: Etiqueta informativa compacta para categorización (Crystal Layer).
 * [REFORMA V5.1]: Implementación de la Zero Abbreviations Policy (ZAP).
 * NIVEL DE INTEGRIDAD: 100%
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { classNamesUtility } from "@/lib/utils"

/**
 * badgeVariants: Definición de las atmósferas visuales para el componente Badge.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * BadgeComponentProperties: Contrato de propiedades para el átomo Badge.
 */
export interface BadgeComponentProperties
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge: Pequeña unidad visual para resaltar estados o taxonomías.
 */
function Badge({ className, variant, ...componentProperties }: BadgeComponentProperties) {
  return (
    <div className={classNamesUtility(badgeVariants({ variant }), className)} {...componentProperties} />
  )
}

export { Badge, badgeVariants }
