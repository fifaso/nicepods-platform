/** ARCHIVE: components/ui/card.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
import * as React from "react"

import { classNamesUtility } from "@/lib/utils"

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

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div ref={elementReference} className={classNamesUtility("p-6 pt-0", className)} {...componentProperties} />
))
CardContent.displayName = "CardContent"

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
