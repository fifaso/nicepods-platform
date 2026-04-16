/** ARCHIVE: components/ui/drawer.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { classNamesUtility } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...componentProperties
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...componentProperties}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...componentProperties }, elementReference) => (
  <DrawerPrimitive.Overlay
    ref={elementReference}
    className={classNamesUtility("fixed inset-0 z-50 bg-black/80", className)}
    {...componentProperties}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...componentProperties }, elementReference) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={elementReference}
      className={classNamesUtility(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...componentProperties}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...componentProperties
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNamesUtility("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...componentProperties}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...componentProperties
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNamesUtility("mt-auto flex flex-col gap-2 p-4", className)}
    {...componentProperties}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...componentProperties }, elementReference) => (
  <DrawerPrimitive.Title
    ref={elementReference}
    className={classNamesUtility(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...componentProperties}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...componentProperties }, elementReference) => (
  <DrawerPrimitive.Description
    ref={elementReference}
    className={classNamesUtility("text-sm text-muted-foreground", className)}
    {...componentProperties}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
