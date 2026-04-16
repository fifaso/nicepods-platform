/** ARCHIVE: components/ui/pagination.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { classNamesUtility } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...componentProperties }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={classNamesUtility("mx-auto flex w-full justify-center", className)}
    {...componentProperties}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...componentProperties }, elementReference) => (
  <ul
    ref={elementReference}
    className={classNamesUtility("flex flex-row items-center gap-1", className)}
    {...componentProperties}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...componentProperties }, elementReference) => (
  <li ref={elementReference} className={classNamesUtility("", className)} {...componentProperties} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...componentProperties
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={classNamesUtility(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...componentProperties}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...componentProperties
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={classNamesUtility("gap-1 pl-2.5", className)}
    {...componentProperties}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...componentProperties
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={classNamesUtility("gap-1 pr-2.5", className)}
    {...componentProperties}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...componentProperties
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={classNamesUtility("flex h-9 w-9 items-center justify-center", className)}
    {...componentProperties}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
