/** ARCHIVE: components/ui/avatar.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { classNamesUtility } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...componentProperties }, elementReference) => (
  <AvatarPrimitive.Root
    ref={elementReference}
    className={classNamesUtility(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...componentProperties}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...componentProperties }, elementReference) => (
  <AvatarPrimitive.Image
    ref={elementReference}
    className={classNamesUtility("aspect-square h-full w-full", className)}
    {...componentProperties}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...componentProperties }, elementReference) => (
  <AvatarPrimitive.Fallback
    ref={elementReference}
    className={classNamesUtility(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...componentProperties}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
