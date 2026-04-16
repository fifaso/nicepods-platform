/** ARCHIVE: components/ui/separator.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { classNamesUtility } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...componentProperties }, elementReference) => (
  <SeparatorPrimitive.Root
    ref={elementReference}
    decorative={decorative}
    orientation={orientation}
    className={classNamesUtility("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)}
    {...componentProperties}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
