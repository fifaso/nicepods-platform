import {
  Globe,
  LayoutDashboard,
  LucideIcon,
  Mic,
  Sparkles,
  Zap
} from "lucide-react";

/**
 * INTERFAZ: NavItem
 * Contrato estricto para cualquier elemento de navegación en el sistema.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * isPrimary: Indica si este ítem debe tener un tratamiento visual destacado.
   * Por ejemplo: El botón 'Crear' en desktop.
   */
  isPrimary?: boolean;
}

/**
 * CONFIGURACIÓN: GUEST_NAV_ITEMS
 * Rutas visibles para usuarios anónimos (Visitantes).
 * Objetivo: Conversión y Exploración.
 */
export const GUEST_NAV_ITEMS: NavItem[] = [
  {
    label: "Explorar",
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
 * CONFIGURACIÓN: USER_NAV_ITEMS
 * Rutas operativas para curadores autenticados (Soberanos).
 * Objetivo: Productividad y Gestión de Activos.
 */
export const USER_NAV_ITEMS: NavItem[] = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Crear",
    href: "/create",
    icon: Mic,
    isPrimary: true // Activa el estilo Aurora en Desktop
  },
  {
    label: "Biblioteca",
    href: "/podcasts",
    icon: Sparkles
  }
];

/**
 * UTILIDAD: isRouteActive
 * Determina si un enlace está activo basándose en la ruta actual.
 * Maneja el caso especial del Dashboard como Home ('/').
 */
export function isRouteActive(href: string, pathname: string): boolean {
  if (href === '/dashboard' && pathname === '/') return true;
  if (href === '/' && pathname !== '/') return false;
  return pathname === href || pathname?.startsWith(`${href}/`);
}