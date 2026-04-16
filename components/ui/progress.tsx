/** ARCHIVE: components/ui/progress.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { classNamesUtility } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...componentProperties }, elementReference) => (
  <ProgressPrimitive.Root
    ref={elementReference}
    className={classNamesUtility("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...componentProperties}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
