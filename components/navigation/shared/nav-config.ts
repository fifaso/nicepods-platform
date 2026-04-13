// components/navigation/shared/nav-config.ts
// VERSIÓN: 4.0 (NicePod Navigation Master - Sovereign Expansion Edition)
// Misión: Configuración determinista de las arterias de navegación de la plataforma.
// [ESTABILIZACIÓN]: Inyección de la Malla Urbana (/map) como ciudadano de primera clase.
// [ZAP]: Erradicación absoluta de abreviaturas para cumplimiento de la Zero Abbreviations Policy.

import {
  Globe,
  LayoutDashboard,
  LucideIcon,
  Map as MapIcon, // Icono para la Malla Urbana
  Mic,
  ShieldCheck // Icono para futuras herramientas de moderación
  ,
  Sparkles,
  Zap
} from "lucide-react";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE TIPADO (BUILD SHIELD)
 * ---------------------------------------------------------------------------
 */

/**
 * INTERFAZ: NavigationItem
 * Define la estructura inmutable de un nodo de navegación en la UI.
 */
export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * isPrimary: Si es true, el componente renderizado aplicará el estilo Aurora 
   * destacado (ej. gradientes de fondo o animaciones de pulso).
   */
  isPrimary?: boolean;
  /**
   * isSovereign: Si es true, este enlace debe ser renderizado con indicadores 
   * visuales de "Zona Privilegiada" (ej. un candado o un color distintivo).
   */
  isSovereign?: boolean;
}

/**
 * ---------------------------------------------------------------------------
 * II. TOPOLOGÍA DE ACCESO PÚBLICO (GUEST MODE)
 * ---------------------------------------------------------------------------
 */

/**
 * GUEST_NAVIGATION_ITEMS: Rutas para usuarios sin sesión activa.
 * Objetivo: Demostrar el valor de la Workstation antes de la conversión (Sign Up).
 */
export const GUEST_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "El Mapa", // La nueva ruta de inmersión V2.6
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
 * III. TOPOLOGÍA OPERATIVA (USER MODE)
 * ---------------------------------------------------------------------------
 */

/**
 * USER_NAVIGATION_ITEMS: Rutas para curadores autenticados (Usuarios Free & Pro).
 * Objetivo: Productividad, creación y consumo de Sabiduría Urbana.
 */
export const USER_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Comando", // Centro de operaciones aspatial
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Radar", // [NUEVO NODO V2.6]: La Malla Urbana Soberana
    href: "/map",
    icon: MapIcon
  },
  {
    label: "Crear", // Flujo de conocimiento aspatial (Borradores estándar)
    href: "/create",
    icon: Mic,
    isPrimary: true // Tratamiento visual destacado en Desktop/Mobile
  },
  {
    label: "Sabiduría", // El feed global de podcasts
    href: "/podcasts",
    icon: Sparkles
  }
];

/**
 * ---------------------------------------------------------------------------
 * IV. TOPOLOGÍA SOBERANA (ADMIN MODE - PREPARACIÓN V2.7)
 * ---------------------------------------------------------------------------
 */

/**
 * ADMIN_NAVIGATION_ITEMS: Herramientas exclusivas para el control de la Malla.
 * [ARQUITECTURA]: Este array se usará en el futuro si decidimos crear un Panel de Control 
 * dedicado para revisar los POIs sugeridos por usuarios Pro.
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
 * V. LÓGICA SENSORIAL (ACTIVE STATE EVALUATION)
 * ---------------------------------------------------------------------------
 */

/**
 * isRouteActive:
 * Algoritmo determinista para iluminar el menú de navegación (Feedback de experiencia de usuario).
 * Evalúa si la URL del navegador coincide con el href del NavigationItem.
 */
export function isRouteActive(href: string, pathname: string): boolean {
  // Manejo del 'Home' genérico vs el 'Home' del usuario
  if (href === '/dashboard' && pathname === '/') return true;
  if (href === '/' && pathname !== '/') return false;

  // Condición de anidamiento (ej. '/map' activa '/map/poi/123')
  return pathname === href || pathname?.startsWith(`${href}/`);
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Simetría de Dominio: Al introducir '/map' junto a '/create' y '/podcasts', 
 *    la interfaz ahora refleja fielmente el 'Cerebro Dual' del backend. El usuario 
 *    sabe que puede crear conocimiento aislado (Crear) o explorar el conocimiento 
 *    físico (Radar).
 * 2. Atributos de Extensibilidad: Se añadió 'isSovereign' al contrato 'NavigationItem'.
 *    En el futuro, el componente 'mobile-nav.tsx' podrá leer este flag para teñir 
 *    el botón de color rojo/ámbar si es una ruta administrativa crítica.
 * 3. Zero Abbreviations Policy (ZAP): Refactorización nominal absoluta (NavigationItem,
 *    GUEST_NAVIGATION_ITEMS, USER_NAVIGATION_ITEMS, ADMIN_NAVIGATION_ITEMS).
 */
