/** ARCHIVE: components/ui/table.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
import * as React from "react"

import { classNamesUtility } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...componentProperties }, elementReference) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={elementReference}
      className={classNamesUtility("w-full caption-bottom text-sm", className)}
      {...componentProperties}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...componentProperties }, elementReference) => (
  <thead ref={elementReference} className={classNamesUtility("[&_tr]:border-b", className)} {...componentProperties} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...componentProperties }, elementReference) => (
  <tbody
    ref={elementReference}
    className={classNamesUtility("[&_tr:last-child]:border-0", className)}
    {...componentProperties}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...componentProperties }, elementReference) => (
  <tfoot
    ref={elementReference}
    className={classNamesUtility(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...componentProperties}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...componentProperties }, elementReference) => (
  <tr
    ref={elementReference}
    className={classNamesUtility(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...componentProperties}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...componentProperties }, elementReference) => (
  <th
    ref={elementReference}
    className={classNamesUtility(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...componentProperties}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...componentProperties }, elementReference) => (
  <td
    ref={elementReference}
    className={classNamesUtility("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...componentProperties}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...componentProperties }, elementReference) => (
  <caption
    ref={elementReference}
    className={classNamesUtility("mt-4 text-sm text-muted-foreground", className)}
    {...componentProperties}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
