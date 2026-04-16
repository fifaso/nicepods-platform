/** ARCHIVE: components/ui/dialog.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
// components/ui/dialog.tsx
// VERSIÓN: 2.1 (A11y Shielded & Full Definition)

"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { classNamesUtility } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...componentProperties }, elementReference) => (
  <DialogPrimitive.Overlay
    ref={elementReference}
    className={classNamesUtility(
      "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...componentProperties}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...componentProperties }, elementReference) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={elementReference}
      className={classNamesUtility(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl",
        className
      )}
      {...componentProperties}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...componentProperties
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNamesUtility(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...componentProperties}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...componentProperties
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNamesUtility(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...componentProperties}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...componentProperties }, elementReference) => (
  <DialogPrimitive.Title
    ref={elementReference}
    className={classNamesUtility(
      "text-lg font-bold leading-none tracking-tight",
      className
    )}
    {...componentProperties}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// DEFINICIÓN REPARADA: DialogDescription
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...componentProperties }, elementReference) => (
  <DialogPrimitive.Description
    ref={elementReference}
    className={classNamesUtility("text-sm text-muted-foreground", className)}
    {...componentProperties}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}