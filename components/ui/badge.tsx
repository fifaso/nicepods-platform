/** ARCHIVE: components/ui/badge.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { classNamesUtility } from "@/lib/utils"

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

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...componentProperties }: BadgeProps) {
  return (
    <div className={classNamesUtility(badgeVariants({ variant }), className)} {...componentProperties} />
  )
}

export { Badge, badgeVariants }
