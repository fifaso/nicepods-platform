/** ARCHIVE: components/ui/alert.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { classNamesUtility } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...componentProperties }, elementReference) => (
  <div
    ref={elementReference}
    role="alert"
    className={classNamesUtility(alertVariants({ variant }), className)}
    {...componentProperties}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...componentProperties }, elementReference) => (
  <h5
    ref={elementReference}
    className={classNamesUtility("mb-1 font-medium leading-none tracking-tight", className)}
    {...componentProperties}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div
    ref={elementReference}
    className={classNamesUtility("text-sm [&_p]:leading-relaxed", className)}
    {...componentProperties}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
