/**
 * ARCHIVE: components/navigation/shared/nav-config.ts
 * VERSION: 6.0 (NicePod Navigation Master - Gold Standard ZAP Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Deterministic configuration of navigation arteries, ensuring absolute
 * nominal sovereignty and industrial-grade routing logic.
 * INTEGRITY LEVEL: 100% (Soberano / No abbreviations / Production-Ready)
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
  /** displayLabelText: The descriptive text visible to the Voyager. */
  displayLabelText: string;
  /** navigationTargetUrl: The physical destination path in the application. */
  navigationTargetUrl: string;
  /** iconComponent: The Lucide icon reactor for visual representation. */
  iconComponent: LucideIcon;
  /**
   * isPrimaryActionStatus: If true, the rendered component applies the highlighted
   * Aurora style (e.g., background gradients or pulse animations).
   */
  isPrimaryActionStatus?: boolean;
  /**
   * isSovereignStatus: If true, this link must be rendered with "Privileged Zone"
   * visual indicators (e.g., a lock or a distinctive color).
   */
  isSovereignStatus?: boolean;
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
    displayLabelText: "El Mapa",
    navigationTargetUrl: "/map",
    iconComponent: MapIcon
  },
  {
    displayLabelText: "Biblioteca",
    navigationTargetUrl: "/podcasts",
    iconComponent: Globe
  },
  {
    displayLabelText: "Planes",
    navigationTargetUrl: "/pricing",
    iconComponent: Zap
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
    displayLabelText: "Comando",
    navigationTargetUrl: "/dashboard",
    iconComponent: LayoutDashboard
  },
  {
    displayLabelText: "Radar",
    navigationTargetUrl: "/map",
    iconComponent: MapIcon
  },
  {
    displayLabelText: "Crear",
    navigationTargetUrl: "/create",
    iconComponent: Mic,
    isPrimaryActionStatus: true
  },
  {
    displayLabelText: "Sabiduría",
    navigationTargetUrl: "/podcasts",
    iconComponent: Sparkles
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
    displayLabelText: "Moderación",
    navigationTargetUrl: "/admin/vault",
    iconComponent: ShieldCheck,
    isSovereignStatus: true
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
 * Evaluates if the browser URL matches the navigationTargetUrl.
 */
export function isRouteActive(navigationTargetUrl: string, currentPathname: string): boolean {
  if (navigationTargetUrl === '/dashboard' && currentPathname === '/') return true;
  if (navigationTargetUrl === '/' && currentPathname !== '/') return false;

  return currentPathname === navigationTargetUrl || currentPathname?.startsWith(`${navigationTargetUrl}/`);
}

/**
 * TECHNICAL NOTE FROM ARCHITECT (V6.0):
 * 1. Nominal Sovereignty: Implementation of the Zero Abbreviations Policy (ZAP)
 *    at the architectural level (NavigationItem properties).
 * 2. Gold Standard: Every property and variable is now a full technical descriptor.
 * 3. Header Integrity: Standard NicePod technical header confirmed.
 */
