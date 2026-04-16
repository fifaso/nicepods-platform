/** ARCHIVE: components/ui/breadcrumb.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { classNamesUtility } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...componentProperties }, elementReference) => <nav ref={elementReference} aria-label="breadcrumb" {...componentProperties} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...componentProperties }, elementReference) => (
  <ol
    ref={elementReference}
    className={classNamesUtility(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...componentProperties}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...componentProperties }, elementReference) => (
  <li
    ref={elementReference}
    className={classNamesUtility("inline-flex items-center gap-1.5", className)}
    {...componentProperties}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...componentProperties }, elementReference) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={elementReference}
      className={classNamesUtility("transition-colors hover:text-foreground", className)}
      {...componentProperties}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...componentProperties }, elementReference) => (
  <span
    ref={elementReference}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={classNamesUtility("font-normal text-foreground", className)}
    {...componentProperties}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...componentProperties
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={classNamesUtility("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...componentProperties}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...componentProperties
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={classNamesUtility("flex h-9 w-9 items-center justify-center", className)}
    {...componentProperties}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
