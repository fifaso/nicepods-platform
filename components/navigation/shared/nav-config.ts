/**
 * ARCHIVE: components/navigation/shared/nav-config.ts
 * VERSION: 5.0 (NicePod Navigation Master - Sovereign Expansion Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Deterministic configuration of navigation arteries, ensuring nominal
 * sovereignty and industrial-grade routing logic.
 * INTEGRITY LEVEL: 100% (Sovereign / No abbreviations / Production-Ready)
 */

import {
  Globe,
  LayoutDashboard,
  LucideIcon,
  Map as MapIcon,
  Mic,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";

/**
 * ---------------------------------------------------------------------------
 * I. TYPE CONTRACTS (BUILD SHIELD)
 * ---------------------------------------------------------------------------
 */

/**
 * INTERFACE: NavigationItem
 * Defines the immutable structure of a navigation node in the User Interface.
 */
export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * isPrimary: If true, the rendered component applies the highlighted
   * Aurora style (e.g., background gradients or pulse animations).
   */
  isPrimary?: boolean;
  /**
   * isSovereign: If true, this link must be rendered with "Privileged Zone"
   * visual indicators (e.g., a lock or a distinctive color).
   */
  isSovereign?: boolean;
}

/**
 * ---------------------------------------------------------------------------
 * II. PUBLIC ACCESS TOPOLOGY (GUEST MODE)
 * ---------------------------------------------------------------------------
 */

/**
 * GUEST_NAVIGATION_ITEMS: Routes for users without an active session.
 */
export const GUEST_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "El Mapa",
    href: "/map",
    icon: MapIcon
  },
  {
    label: "Biblioteca",
    href: "/podcasts",
    icon: Globe
  },
  {
    label: "Planes",
    href: "/pricing",
    icon: Zap
  }
];

/**
 * ---------------------------------------------------------------------------
 * III. OPERATIONAL TOPOLOGY (USER MODE)
 * ---------------------------------------------------------------------------
 */

/**
 * USER_NAVIGATION_ITEMS: Routes for authenticated curators.
 */
export const USER_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Comando",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Radar",
    href: "/map",
    icon: MapIcon
  },
  {
    label: "Crear",
    href: "/create",
    icon: Mic,
    isPrimary: true
  },
  {
    label: "Sabiduría",
    href: "/podcasts",
    icon: Sparkles
  }
];

/**
 * ---------------------------------------------------------------------------
 * IV. SOVEREIGN TOPOLOGY (ADMIN MODE)
 * ---------------------------------------------------------------------------
 */

/**
 * ADMIN_NAVIGATION_ITEMS: Exclusive tools for Urban Mesh control.
 */
export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Moderación",
    href: "/admin/vault",
    icon: ShieldCheck,
    isSovereign: true
  }
];

/**
 * ---------------------------------------------------------------------------
 * V. SENSORY LOGIC (ACTIVE STATE EVALUATION)
 * ---------------------------------------------------------------------------
 */

/**
 * isRouteActive:
 * Deterministic algorithm to illuminate the navigation menu.
 * Evaluates if the browser URL matches the NavigationItem href.
 */
export function isRouteActive(href: string, currentPathname: string): boolean {
  if (href === '/dashboard' && currentPathname === '/') return true;
  if (href === '/' && currentPathname !== '/') return false;

  return currentPathname === href || currentPathname?.startsWith(`${href}/`);
}

/**
 * TECHNICAL NOTE FROM ARCHITECT (V5.0):
 * 1. Nominal Sovereignty: Implementation of the Zero Abbreviations Policy (ZAP).
 * 2. Build Shield: Strict typing for all navigation constants and logic.
 * 3. Header Integrity: Standard NicePod technical header added.
 */
