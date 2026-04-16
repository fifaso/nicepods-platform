/** ARCHIVE: components/ui/label.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { classNamesUtility } from "@/lib/utils"

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70")

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...componentProperties }, elementReference) => (
  <LabelPrimitive.Root ref={elementReference} className={classNamesUtility(labelVariants(), className)} {...componentProperties} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
