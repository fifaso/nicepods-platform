/**
 * ARCHIVE: components/navigation/desktop-nav.tsx
 * VERSION: 6.0 (NicePod Desktop Command - Axial Path Sanitization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * MISSION: Orquestar la navegación de escritorio de alta densidad, gestionando
 * la autoridad administrativa y la simetría visual del centro de mando global.
 * [REFORMA V6.0]: Resolución definitiva de TS2345 mediante el blindaje de la 
 * ruta de navegación. Resolución de TS2322 mediante la sincronización nominal 
 * con 'UserDropdown' V6.0. Purificación absoluta de la Zero Abbreviations Policy.
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
import { classNamesUtility } from "@/lib/utils";

// --- CONTRATOS DE DATOS SOBERANOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: DesktopNavigationProperties
 */
interface DesktopNavigationProperties {
  isUserAuthenticatedStatus: boolean;
  isInitialLoadingProcessActive: boolean;
  administratorProfile: ProfileData | null;
  isAdministratorAuthorityStatus: boolean;
  onAuthenticationLogoutAction: () => void;
}

/**
 * DesktopNav: El director de navegación para terminales de alta resolución.
 */
export function DesktopNav({
  isUserAuthenticatedStatus,
  isInitialLoadingProcessActive,
  administratorProfile,
  isAdministratorAuthorityStatus,
  onAuthenticationLogoutAction
}: DesktopNavigationProperties) {

  /**
   * [BSS]: SANITIZACIÓN AXIAL
   * MISSION: El hook usePathname() puede retornar null. Forzamos un fallback
   * a cadena vacía para aniquilar el error TS2345 en la lógica de comparación.
   */
  const currentNavigationPathname = usePathname() || "";

  /**
   * navigationEntriesCollection:
   * MISSION: Calcular la topología del menú basándose en la autoridad del Voyager.
   */
  const navigationEntriesCollection = useMemo(() => {
    if (!isUserAuthenticatedStatus) {
      return GUEST_NAVIGATION_ITEMS;
    }

    // Inyección de herramientas soberanas si el rango de autoridad es administrativo.
    if (isAdministratorAuthorityStatus) {
      return [...USER_NAVIGATION_ITEMS, ...ADMIN_NAVIGATION_ITEMS];
    }

    return USER_NAVIGATION_ITEMS;
  }, [isUserAuthenticatedStatus, isAdministratorAuthorityStatus]);

  return (
    <div className={classNamesUtility(
      glassPanelClass,
      "hidden lg:flex items-center h-20 px-8 transition-all duration-1000 isolate"
    )}>

      {/* I. NÚCLEO IZQUIERDO: IDENTIDAD DE MARCA SOBERANA */}
      <div className="flex-1 flex items-center">

        <NavBrand isUserAuthenticatedStatus={isUserAuthenticatedStatus} />

        {/* Indicador de Rango Administrativo Activo */}
        {isAdministratorAuthorityStatus && !isInitialLoadingProcessActive && (
          <div className="ml-8 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-1000 shadow-sm isolate">
            <ShieldCheck size={12} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
              Modo Administrador
            </span>
          </div>
        )}
      </div>

      {/* II. NÚCLEO CENTRAL: LA CÁPSULA DE COMANDO INTERACTIVA */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 isolate">
        <ul className={classNamesUtility(
          "flex items-center space-x-2 p-1.5 rounded-full",
          "bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl",
          "transition-all duration-700 hover:border-white/20"
        )}>
          {navigationEntriesCollection.map((navigationEntryItem: NavigationItem) => {

            // CASO A: ACCIÓN DE FORJA PRIMARIA (CREACIÓN)
            if (navigationEntryItem.isPrimary) {
              return (
                <li key={navigationEntryItem.href} className="flex items-center">
                  <CreateButton
                    variantType="full"
                    additionalTailwindClassName="h-11 px-8 rounded-full shadow-lg shadow-primary/20"
                  />
                </li>
              );
            }

            /** 
             * [SINCRO V6.0]: Verificación de Estado Activo.
             * Consumo de la ruta sanitizada para determinar el realce visual.
             */
            const isNavigationEntryActiveStatus = isRouteActive(navigationEntryItem.href, currentNavigationPathname);
            const NavigationIconComponent = navigationEntryItem.icon;

            return (
              <li key={navigationEntryItem.href}>
                <Link
                  href={navigationEntryItem.href}
                  className={classNamesUtility(
                    navLinkBaseClass,
                    "h-11 px-6 flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700",
                    isNavigationEntryActiveStatus
                      ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] scale-105"
                      : "text-zinc-500 hover:text-white hover:bg-white/5",
                    navigationEntryItem.isSovereign && "text-amber-500/90 hover:text-amber-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <NavigationIconComponent size={15} className={classNamesUtility(
                      "transition-transform duration-700",
                      isNavigationEntryActiveStatus ? "text-black scale-110" : "text-zinc-700"
                    )} />
                    <span>{navigationEntryItem.label}</span>
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
        <div className="h-11 w-11 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-700 cursor-pointer shadow-inner group isolate">
          <ThemeToggle />
        </div>

        {/* Lógica de Identidad Atómica NicePod */}
        {isInitialLoadingProcessActive ? (
          <div className="h-11 w-11 flex items-center justify-center bg-zinc-950 rounded-full border border-white/5 animate-pulse isolate">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
          </div>
        ) : isUserAuthenticatedStatus ? (
          <div className="flex items-center gap-5 animate-in fade-in zoom-in-95 duration-1000 isolate">
            {/* Sistema de Notificaciones Sincronizado */}
            <div className="h-11 w-11 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
              <NotificationBell />
            </div>

            {/* Menú Desplegable SOBERANO (RESOLUCIÓN TS2322) */}
            <UserDropdown
              initialAdministratorProfile={administratorProfile}
              isAdministratorAuthorityStatus={isAdministratorAuthorityStatus}
              onAuthenticationLogoutAction={onAuthenticationLogoutAction}
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Zero Abbreviations Policy (ZAP): Purga absoluta. 'isUserAuthenticated' -> 'isUserAuthenticatedStatus', 
 *    'navigationItem' -> 'navigationEntryItem', 'cn' -> 'classNamesUtility'.
 * 2. TS2345 Resolution: Sanitización imperativa de 'currentNavigationPathname' mediante 
 *    operador de coalescencia nula, blindando la lógica de rutas.
 * 3. Prop Sync (TS2322): Sincronización nominal con el contrato V6.0 de UserDropdown, 
 *    utilizando 'initialAdministratorProfile' e 'isAdministratorAuthorityStatus'.
 */