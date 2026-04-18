/**
 * ARCHIVO: components/ui/card.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Nominal Sovereignty
 * MISIÓN: Contenedor estructural para la organización de capital intelectual (Crystal Layer).
 * [REFORMA V5.1]: Implementación de la Zero Abbreviations Policy (ZAP).
 * NIVEL DE INTEGRIDAD: 100%
 */

import * as React from "react"

import { classNamesUtility } from "@/lib/utils"

/**
 * Card: El átomo contenedor base con elevación y bordes suaves.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div
    ref={elementReference}
    className={classNamesUtility(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...componentProperties}
  />
))
Card.displayName = "Card"

/**
 * CardHeader: Sección superior para títulos y metadatos del contenedor.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div
    ref={elementReference}
    className={classNamesUtility("flex flex-col space-y-1.5 p-6", className)}
    {...componentProperties}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle: Descriptor nominal primario del contenido de la tarjeta.
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div
    ref={elementReference}
    className={classNamesUtility(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...componentProperties}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription: Contexto secundario y explicativo para el Voyager.
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div
    ref={elementReference}
    className={classNamesUtility("text-sm text-muted-foreground", className)}
    {...componentProperties}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent: El cuerpo principal de datos y acciones del contenedor.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div ref={elementReference} className={classNamesUtility("p-6 pt-0", className)} {...componentProperties} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter: Sección inferior para acciones primarias y cierres tácticos.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div
    ref={elementReference}
    className={classNamesUtility("flex items-center p-6 pt-0", className)}
    {...componentProperties}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
