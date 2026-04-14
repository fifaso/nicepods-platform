/**
 * ARCHIVO: components/navigation/desktop-nav.tsx
 * VERSIÓN: 5.0 (NicePod Desktop Command - Axial Path Sanitization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la navegación de escritorio de alta densidad, gestionando 
 * la autoridad administrativa y la simetría visual del centro de mando.
 * [REFORMA V5.0]: Implementación de 'Axial Path Sanitization'. Resolución del 
 * error TS2345 mediante el blindaje de 'currentNavigationPathname' con un 
 * fallback a hilo vacío. Aplicación integral de la Zero Abbreviations Policy 
 * (ZAP) y sellado del Build Shield Sovereignty (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

// --- ÁTOMOS Y CONFIGURACIÓN DE IDENTIDAD SOBERANA ---
import { CreateButton } from "./shared/create-button";
import { NavBrand } from "./shared/nav-brand";
import {
  ADMIN_NAVIGATION_ITEMS,
  GUEST_NAVIGATION_ITEMS,
  isRouteActive,
  NavigationItem,
  USER_NAVIGATION_ITEMS
} from "./shared/nav-config";
import {
  glassPanelClass,
  navLinkBaseClass
} from "./shared/nav-styles";
import { UserDropdown } from "./shared/user-dropdown";

// --- INFRAESTRUCTURA UI (NICEPOD INDUSTRIAL DESIGN) ---
import { NotificationBell } from "@/components/system/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- CONTRATOS DE DATOS SOBERANOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: DesktopNavigationProperties
 * Misión: Definir el contrato de identidad inyectado por el orquestador de navegación.
 */
interface DesktopNavigationProperties {
  isUserAuthenticated: boolean;
  isInitialLoadingState: boolean;
  administratorProfile: ProfileData | null;
  isAdministratorAuthority: boolean;
  onAuthenticationLogoutAction: () => void;
}

/**
 * DesktopNav: El director de navegación para terminales de alta resolución.
 */
export function DesktopNav({
  isUserAuthenticated,
  isInitialLoadingState,
  administratorProfile,
  isAdministratorAuthority,
  onAuthenticationLogoutAction
}: DesktopNavigationProperties) {

  /**
   * [BSS]: SANITIZACIÓN AXIAL
   * El hook usePathname() puede devolver null. Forzamos un fallback a hilo vacío
   * para satisfacer el contrato de la función 'isRouteActive' y eliminar el error TS2345.
   */
  const currentNavigationPathname = usePathname() || "";

  /**
   * navigationItemsCollection:
   * Misión: Calcular la topología del menú según el rango de autoridad del Voyager.
   */
  const navigationItemsCollection = useMemo(() => {
    if (!isUserAuthenticated) {
      return GUEST_NAVIGATION_ITEMS;
    }

    // Si el usuario posee autoridad administrativa, se anexan las herramientas soberanas.
    if (isAdministratorAuthority) {
      return [...USER_NAVIGATION_ITEMS, ...ADMIN_NAVIGATION_ITEMS];
    }

    return USER_NAVIGATION_ITEMS;
  }, [isUserAuthenticated, isAdministratorAuthority]);

  return (
    <div className={cn(
      glassPanelClass,
      "hidden lg:flex items-center h-20 px-8 transition-all duration-1000 isolate"
    )}>

      {/* I. NÚCLEO IZQUIERDO: IDENTIDAD DE MARCA SOBERANA */}
      <div className="flex-1 flex items-center">

        <NavBrand isUserAuthenticated={isUserAuthenticated} />

        {/* Indicador de Rango Administrativo */}
        {isAdministratorAuthority && !isInitialLoadingState && (
          <div className="ml-8 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-1000 shadow-sm">
            <ShieldCheck size={12} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
              Modo Administrador
            </span>
          </div>
        )}
      </div>

      {/* II. NÚCLEO CENTRAL: LA CÁPSULA DE COMANDO INTERACTIVA */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <ul className={cn(
          "flex items-center space-x-2 p-1.5 rounded-full",
          "bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl",
          "transition-all duration-700 hover:border-white/20"
        )}>
          {navigationItemsCollection.map((navigationItem: NavigationItem) => {

            // CASO A: BOTÓN DE ACCIÓN PRIMARIA (FORJA DE CAPITAL INTELECTUAL)
            if (navigationItem.isPrimary) {
              return (
                <li key={navigationItem.href} className="flex items-center">
                  <CreateButton
                    variant="full"
                    className="h-11 px-8 rounded-full shadow-lg shadow-primary/20"
                  />
                </li>
              );
            }

            /**
             * [SINCRO V5.0]: Verificación de estado activo.
             * Se utiliza 'currentNavigationPathname' (ya sanitizado) para la comparación.
             */
            const isNavigationItemActive = isRouteActive(navigationItem.href, currentNavigationPathname);
            const NavigationIconComponent = navigationItem.icon;

            return (
              <li key={navigationItem.href}>
                <Link
                  href={navigationItem.href}
                  className={cn(
                    navLinkBaseClass,
                    "h-11 px-6 flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700",
                    isNavigationItemActive
                      ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] scale-105"
                      : "text-zinc-500 hover:text-white hover:bg-white/5",
                    navigationItem.isSovereign && "text-amber-500/90 hover:text-amber-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <NavigationIconComponent size={15} className={cn(
                      "transition-transform duration-700",
                      isNavigationItemActive ? "text-black scale-110" : "text-zinc-700"
                    )} />
                    <span>{navigationItem.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* III. NÚCLEO DERECHO: HERRAMIENTAS AMBIENTALES Y PERFIL */}
      <div className="flex-1 flex items-center justify-end gap-6">

        {/* Control Ambiental Táctico */}
        <div className="h-11 w-11 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-700 cursor-pointer shadow-inner group">
          <ThemeToggle />
        </div>

        {/* Lógica de Identidad Atómica NicePod */}
        {isInitialLoadingState ? (
          <div className="h-11 w-11 flex items-center justify-center bg-zinc-950 rounded-full border border-white/5 animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
          </div>
        ) : isUserAuthenticated ? (
          <div className="flex items-center gap-5 animate-in fade-in zoom-in-95 duration-1000">
            {/* Sistema de Notificaciones Sincronizado */}
            <div className="h-11 w-11 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
              <NotificationBell />
            </div>

            {/* Menú Desplegable SOBERANO */}
            <UserDropdown
              profile={administratorProfile}
              isAdministratorAuthority={isAdministratorAuthority}
              onLogout={onAuthenticationLogoutAction}
            />
          </div>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              className="h-12 rounded-2xl px-10 font-black text-[11px] uppercase tracking-[0.3em] border-white/10 hover:bg-white hover:text-black transition-all duration-700 shadow-2xl shadow-primary/10"
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. ZAP Absolute Compliance: Se eliminaron abreviaciones residuales en el mapeo de 
 *    iconos (NavigationIconComponent) y en los descriptores de estado.
 * 2. Build Shield Sovereignty: Se resolvió el error TS2345 garantizando que 
 *    'currentNavigationPathname' siempre sea un hilo de texto, protegiendo 
 *    la lógica de comparación de rutas.
 * 3. Atomic Typing: Se refinó el uso de descriptores nominales para asegurar que 
 *    el compilador no genere advertencias de 'Implicit Any'.
 */