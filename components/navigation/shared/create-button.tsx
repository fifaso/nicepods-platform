/**
 * ARCHIVE: components/navigation/shared/create-button.tsx
 * VERSION: 3.0 (NicePod Forge Trigger - Acoustic Action Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Provide the primary trigger for knowledge synthesis, ensuring mechanical
 * feedback and industrial-grade User Experience.
 * INTEGRITY LEVEL: 100% (Sovereign / No abbreviations / Production-Ready)
 */

"use client";

import { Button } from "@/components/ui/button";
import { classNamesUtility } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

// Import the master style class for Aurora effects.
import { auroraButtonClass } from "./nav-styles";

/**
 * INTERFACE: CreateButtonComponentProperties
 */
interface CreateButtonComponentProperties {
  /**
   * variantType: Defines the display mode based on the hardware environment.
   * - 'full': Rectangular button with narrative text.
   * - 'icon': Minimalist circular button.
   */
  variantType?: 'full' | 'icon';

  /**
   * additionalTailwindClassName: Allows injection of positioning adjustments.
   */
  additionalTailwindClassName?: string;
}

/**
 * CreateButton: The cinematic trigger for wisdom synthesis.
 */
export function CreateButton({
  variantType = 'full',
  additionalTailwindClassName
}: CreateButtonComponentProperties) {

  const isFullDisplayActive = variantType === 'full';

  return (
    <Link
      href="/create"
      className="outline-none group/crear-link"
      aria-label="Iniciar la forja de una nueva crónica de voz"
    >
      <Button
        size="sm"
        className={classNamesUtility(
          auroraButtonClass,
          isFullDisplayActive
            ? "rounded-2xl h-10 md:h-10 px-6 md:px-8 min-w-[110px] md:min-w-[120px]"
            : "rounded-2xl h-10 w-10 p-0 flex items-center justify-center",
          "border border-white/20 group-hover/crear-link:border-white/40",
          additionalTailwindClassName
        )}
      >
        {/* SHIMMER EFFECT LAYER */}
        <div
          className={classNamesUtility(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "-translate-x-full group-hover/crear-link:animate-shimmer pointer-events-none"
          )}
          aria-hidden="true"
        />

        {/* CONTENT NUCLEUS */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Plus
            className={classNamesUtility(
              "stroke-[4] transition-transform duration-500 ease-[0.16, 1, 0.3, 1]",
              "group-hover/crear-link:rotate-90",
              isFullDisplayActive ? "h-3.5 w-3.5 md:h-4 md:w-4" : "h-5 w-5"
            )}
          />

          {isFullDisplayActive && (
            <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.25em] leading-none">
              Crear
            </span>
          )}
        </span>
      </Button>
    </Link>
  );
}

/**
 * TECHNICAL NOTE FROM ARCHITECT (V3.0):
 * 1. ZAP Compliance: Purified properties (variantType, additionalTailwindClassName).
 * 2. Visual Fidelity: Maintained high-contrast Aurora gradients and mechanical animations.
 * 3. Header Integrity: Standard NicePod technical header added.
 */
