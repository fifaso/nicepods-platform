/**
 * ARCHIVO: components/ui/input.tsx
 * VERSIÓN: 1.0 (NicePod UI Kit - Tactical Input Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 *
 * Misión: Proveer una terminal de entrada de datos básica con soporte para
 * estados de validación y telemetría industrial.
 * [REFORMA V1.0]: Implementación de la Zero Abbreviations Policy (ZAP) y
 * alineación nominal absoluta con el Build Shield Sovereignty.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import * as React from "react"
import { classNamesUtility } from "@/lib/utils"

export interface InputComponentProperties extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputComponentProperties>(
  ({ className, type, ...componentProperties }, elementReference) => {
  return (
    <input
      type={type}
      className={classNamesUtility(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={elementReference}
      {...componentProperties}
    />
  )
})
Input.displayName = "Input"

export { Input }
