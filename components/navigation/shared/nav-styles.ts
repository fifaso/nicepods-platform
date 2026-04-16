/**
 * ARCHIVE: components/navigation/shared/nav-styles.ts
 * VERSION: 3.0 (NicePod Navigation Styles - Tactical & Industrial Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Centralize User Interface style definitions for navigation components,
 * ensuring visual ADN consistency and hardware-accelerated performance.
 * INTEGRITY LEVEL: 100% (Sovereign / No abbreviations / Production-Ready)
 */

import { classNamesUtility } from "@/lib/utils";

/**
 * STYLE: MASTER HEADER CONTAINER
 */
export const headerContainerClass = classNamesUtility(
  "fixed top-0 left-0 right-0 z-[100] w-full p-3 md:p-5",
  "animate-in fade-in slide-in-from-top-2 duration-1000 ease-[0.16, 1, 0.3, 1]"
);

/**
 * STYLE: GLASS PANEL (The Navigation Frame)
 */
export const glassPanelClass = classNamesUtility(
  "relative max-w-screen-xl mx-auto flex items-center justify-between",
  "rounded-[2.5rem] border border-white/10 bg-black/60 shadow-2xl",
  "backdrop-blur-2xl supports-[backdrop-filter]:bg-black/40",
  "h-[4.5rem] md:h-20",
  "px-6 md:px-10"
);

/**
 * STYLE: AURORA BUTTON (Forge Action)
 */
export const auroraButtonClass = classNamesUtility(
  "bg-gradient-to-r from-indigo-600 via-primary to-fuchsia-600",
  "text-white border border-white/20 shadow-lg shadow-primary/20",
  "transition-all duration-500 ease-[0.16, 1, 0.3, 1] active:scale-95",
  "hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:scale-[1.03]",
  "relative overflow-hidden group/crear"
);

/**
 * STYLE: NAVIGATION LINKS (Micro-Typography)
 */
export const navLinkBaseClass = classNamesUtility(
  "rounded-full px-7 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 block outline-none"
);

/**
 * ACTIVE STATE STYLE
 */
export const navLinkActiveClass = classNamesUtility(
  "bg-white/95 text-black shadow-lg shadow-white/5"
);

/**
 * INACTIVE STATE STYLE
 */
export const navLinkInactiveClass = classNamesUtility(
  "text-zinc-500 hover:text-white hover:bg-white/5"
);

/**
 * STYLE: MOBILE ACTION CAPSULE
 */
export const mobileCreateButtonClass = classNamesUtility(
  auroraButtonClass,
  "h-10 px-5 rounded-2xl flex items-center justify-center gap-2",
  "font-black text-[9px] uppercase tracking-[0.25em]"
);

/**
 * TECHNICAL NOTE FROM ARCHITECT (V3.0):
 * 1. ZAP Compliance: Replaced 'cn' with 'classNamesUtility'.
 * 2. Visual ADN: Maintained high-fidelity cinematic transitions.
 * 3. Header Integrity: Standardized Technical Header applied.
 */
