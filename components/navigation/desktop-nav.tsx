// components/navigation/desktop-nav.tsx
// VERSIÓN: 3.0 (NicePod Navigation Master - Desktop Sovereign Edition)
// Misión: Especialista en renderizado de alta densidad para centros de mando.
// [ESTABILIZACIÓN]: Integración de rutas de Admin, Radar /map y optimización de simetría.

"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

// --- ÁTOMOS Y CONFIGURACIÓN DE IDENTIDAD SOBERANA ---
import { CreateButton } from "./shared/create-button";
import { NavBrand } from "./shared/nav-brand";
import {
  ADMIN_NAV_ITEMS,
  GUEST_NAV_ITEMS,
  isRouteActive,
  NavItem,
  USER_NAV_ITEMS
} from "./shared/nav-config";
import {
  glassPanelClass,
  navLinkBaseClass
} from "./shared/nav-styles";
import { UserDropdown } from "./shared/user-dropdown";

// --- INFRAESTRUCTURA UI (NicePod Industrial Design) ---
import { NotificationBell } from "@/components/system/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- CONTRATOS DE DATOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: DesktopNavProps
 * Define el contrato de identidad inyectado por el Master Navigator (T0).
 */
interface DesktopNavProps {
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  profile: ProfileData | null;
  isAdmin: boolean;
  onLogout: () => void;
}

/**
 * COMPONENTE: DesktopNav
 * El director de navegación para pantallas de alta resolución.
 */
export function DesktopNav({
  isAuthenticated,
  isInitialLoading,
  profile,
  isAdmin,
  onLogout
}: DesktopNavProps) {
  const pathname = usePathname();

  /**
   * RESOLUCIÓN DINÁMICA DE RUTAS:
   * Utilizamos useMemo para calcular la topología del menú según el rango del usuario.
   * Si es Admin, fusionamos los USER_ITEMS con los ADMIN_ITEMS para control total.
   */
  const navItems = useMemo(() => {
    if (!isAuthenticated) return GUEST_NAV_ITEMS;

    // Si es administrador, inyectamos las herramientas soberanas al final del menú
    if (isAdmin) {
      return [...USER_NAV_ITEMS, ...ADMIN_NAV_ITEMS];
    }

    return USER_NAV_ITEMS;
  }, [isAuthenticated, isAdmin]);

  return (
    /**
     * CONTENEDOR MAESTRO:
     * Aplica el chasis de cristal Aurora definido en las constantes de estilo.
     */
    <div className={cn(
      glassPanelClass,
      "hidden md:flex items-center h-20 px-8 transition-all duration-1000"
    )}>

      {/* I. NÚCLEO IZQUIERDO: IDENTIDAD DE MARCA */}
      <div className="flex-1 flex items-center">
        <NavBrand isAuthenticated={isAuthenticated} />

        {/* Indicador de Rango: Solo visible para el Administrador */}
        {isAdmin && !isInitialLoading && (
          <div className="ml-6 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-1000">
            <ShieldCheck size={12} className="text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">
              Admin Mode
            </span>
          </div>
        )}
      </div>

      {/* 
          II. NÚCLEO CENTRAL: LA CÁPSULA DE COMANDO 
          Este es el nodo interactivo principal. Utiliza posicionamiento absoluto 
          para garantizar la simetría visual en cualquier resolución.
      */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ul className={cn(
          "flex items-center space-x-1.5 p-1.5 rounded-full",
          "bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl",
          "transition-all duration-700 hover:border-white/20"
        )}>
          {navItems.map((item: NavItem) => {

            // CASO A: BOTÓN DE ACCIÓN PRIMARIA (CREAR)
            if (item.isPrimary) {
              return (
                <li key={item.href} className="flex items-center">
                  <CreateButton
                    variant="full"
                    className="h-10 px-6 rounded-full"
                  />
                </li>
              );
            }

            // CASO B: ENLACES ESTÁNDAR Y SOBERANOS
            const active = isRouteActive(item.href, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    navLinkBaseClass,
                    "h-10 px-5 flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500",
                    active
                      ? "bg-white text-black shadow-lg scale-105"
                      : "text-zinc-500 hover:text-white hover:bg-white/5",
                    // Estilo especial para ítems de moderación
                    item.isSovereign && "text-amber-500/80 hover:text-amber-400"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={14} className={cn(
                      "transition-colors duration-500",
                      active ? "text-black" : "text-zinc-600 group-hover:text-primary"
                    )} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* III. NÚCLEO DERECHO: HERRAMIENTAS Y PERFIL */}
      <div className="flex-1 flex items-center justify-end gap-5">

        {/* Control Ambiental: Cambio de Tema */}
        <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-500 cursor-pointer">
          <ThemeToggle />
        </div>

        {/* Lógica de Identidad Atómica */}
        {isInitialLoading ? (
          <div className="h-10 w-10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-4 animate-in fade-in zoom-in-95 duration-700">
            {/* Campana de Notificaciones Sincronizada */}
            <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer">
              <NotificationBell />
            </div>

            {/* Menú Desplegable SOBERANO */}
            <UserDropdown
              profile={profile}
              isAdmin={isAdmin}
              onLogout={onLogout}
            />
          </div>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              className="h-11 rounded-full px-10 font-black text-[11px] uppercase tracking-[0.25em] border-white/10 hover:bg-white hover:text-black transition-all duration-500 shadow-xl"
            >
              Iniciar Frecuencia
            </Button>
          </Link>
        )}
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Consolidación del Radar: Al usar 'navItems' dinámicos, el botón "Radar" (/map) 
 *    definido en 'nav-config.ts' aparece ahora en el centro de la cápsula, 
 *    otorgándole la importancia jerárquica que requiere la V2.6.
 * 2. Visualización de Rango: El 'ShieldCheck' en el núcleo izquierdo provee 
 *    una confirmación psicológica inmediata al Admin de que su sesión tiene 
 *    los privilegios correctos de siembra.
 * 3. Ergonomía Premium: Se ha aumentado el padding horizontal ('px-5') y la 
 *    altura de respuesta en los enlaces centrales, logrando que la interacción 
 *    en monitores de alta resolución (4K) sea precisa y satisfactoria.
 */