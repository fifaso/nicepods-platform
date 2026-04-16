/**
 * ARCHIVE: components/navigation/mobile-nav.tsx
 * VERSION: 6.0 (NicePod Mobile Command - Gold Standard ZAP Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * MISSION: Especialista en interacción táctil y renderizado de alta densidad para
 * dispositivos móviles, gestionando el acceso a la Bóveda y la autoridad del usuario.
 * [REFORMA V6.0]: Sincronización absoluta con NavConfig V6.0. Implementación total
 * de la Zero Abbreviations Policy (ZAP). 100% Nominal Sovereignty.
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { ChevronRight, LogOut, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// --- ÁTOMOS Y CONFIGURACIÓN DE SOBERANÍA ---
import { CreateButton } from "./shared/create-button";
import { NavBrand } from "./shared/nav-brand";
import {
  GUEST_NAVIGATION_ITEMS,
  isRouteActive,
  NavigationItem,
  USER_NAVIGATION_ITEMS
} from "./shared/nav-config";
import {
  glassPanelClass
} from "./shared/nav-styles";
import { UserDropdown } from "./shared/user-dropdown";

// --- INFRAESTRUCTURA UI (NICEPOD INDUSTRIAL DESIGN) ---
import { NotificationBell } from "@/components/system/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { classNamesUtility } from "@/lib/utils";

// --- CONTRATOS DE DATOS SOBERANOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFACE: MobileNavigationComponentProperties
 */
interface MobileNavigationComponentProperties {
  isUserAuthenticatedStatus: boolean;
  isInitialLoadingProcessActive: boolean;
  userProfileData: ProfileData | null;
  isAdministratorAuthorityStatus: boolean;
  onAuthenticationLogoutAction: () => void;
}

/**
 * MobileNav: El motor de interacción táctica para el Voyager en movilidad.
 */
export function MobileNav({
  isUserAuthenticatedStatus,
  isInitialLoadingProcessActive,
  userProfileData,
  isAdministratorAuthorityStatus,
  onAuthenticationLogoutAction
}: MobileNavigationComponentProperties) {

  /**
   * [BSS]: SANITIZACIÓN AXIAL
   */
  const currentNavigationPathname = usePathname() || "";

  const [isNavigationSheetOpenStatus, setIsNavigationSheetOpenStatus] = useState<boolean>(false);

  /**
   * navigationItemsCollection: 
   */
  const navigationItemsCollection = isUserAuthenticatedStatus ? USER_NAVIGATION_ITEMS : GUEST_NAVIGATION_ITEMS;

  return (
    <div className={classNamesUtility(glassPanelClass, "flex md:hidden isolate")}>

      {/* I. NÚCLEO DE MARCA (IZQUIERDA) */}
      <NavBrand isUserAuthenticatedStatus={isUserAuthenticatedStatus} />

      {/* II. CENTRO DE CONTROL TÁCTICO (DERECHA) */}
      <div className="flex items-center gap-2.5 sm:gap-4">

        {/* 1. ACCIÓN PRIMARIA: CREACIÓN DE CAPITAL INTELECTUAL */}
        {isUserAuthenticatedStatus && !isInitialLoadingProcessActive && (
          <CreateButton
            variantType="full"
            additionalTailwindClassName="h-10 px-4 scale-95 origin-right shadow-lg shadow-primary/10"
          />
        )}

        {/* 2. SISTEMA DE NOTIFICACIONES SINCRONIZADO */}
        {isUserAuthenticatedStatus && !isInitialLoadingProcessActive && (
          <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all group">
            <NotificationBell />
          </div>
        )}

        {/* 3. CONTROL AMBIENTAL: THEME TOGGLE */}
        <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
          <ThemeToggle />
        </div>

        {/* 4. NODO DE IDENTIDAD: AVATAR SOBERANO */}
        {isUserAuthenticatedStatus && !isInitialLoadingProcessActive && (
          <div className="scale-105">
            <UserDropdown
              initialAdministratorProfile={userProfileData}
              isAdministratorAuthorityStatus={isAdministratorAuthorityStatus}
              onAuthenticationLogoutAction={onAuthenticationLogoutAction}
            />
          </div>
        )}

        {/* 5. NAVEGACIÓN PROFUNDA: MENÚ LATERAL (SHEET) */}
        <Sheet open={isNavigationSheetOpenStatus} onOpenChange={setIsNavigationSheetOpenStatus}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl h-10 w-10 bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all active:scale-90"
                    aria-label="Abrir terminal de navegación"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-widest border-white/10 bg-black/90 backdrop-blur-xl">
                Navegación
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <SheetContent
            side="right"
            className="w-[320px] border-l border-white/5 bg-black/95 backdrop-blur-3xl p-0 flex flex-col isolate"
          >
            <div className="flex flex-col h-full p-8">

              <SheetHeader className="text-left mb-12">
                <SheetTitle className="flex items-center space-x-4 text-white">
                  <div className="h-10 w-10 relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                    <Image
                      src="/nicepod-logo.png"
                      alt="NicePod Intelligence Isotype"
                      fill
                      className="object-cover p-2"
                      unoptimized
                    />
                  </div>
                  <span className="font-black text-2xl tracking-tighter uppercase italic font-serif">
                    NicePod
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* LISTA DE NAVEGACIÓN VERTICAL */}
              <nav className="flex flex-col space-y-4">
                {navigationItemsCollection.map((navigationItem: NavigationItem) => {
                  const isNavigationItemActive = isRouteActive(navigationItem.navigationTargetUrl, currentNavigationPathname);
                  const NavigationIconComponent = navigationItem.iconComponent;

                  return (
                    <Link
                      key={navigationItem.navigationTargetUrl}
                      href={navigationItem.navigationTargetUrl}
                      onClick={() => setIsNavigationSheetOpenStatus(false)}
                      className="group"
                    >
                      <Button
                        variant="ghost"
                        className={classNamesUtility(
                          "w-full justify-between text-[11px] h-16 rounded-2xl font-black px-6 uppercase tracking-[0.2em] transition-all duration-500",
                          isNavigationItemActive
                            ? "bg-white text-black shadow-2xl scale-[1.02]"
                            : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <NavigationIconComponent className={classNamesUtility("h-5 w-5", isNavigationItemActive ? "text-black" : "text-zinc-700 group-hover:text-primary")} />
                          {navigationItem.displayLabelText}
                        </div>
                        <ChevronRight className={classNamesUtility("h-4 w-4 opacity-0 group-hover:opacity-100 transition-all", isNavigationItemActive && "text-black opacity-30")} />
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              {/* FOOTER DEL MENÚ: PROTOCOLO DE SALIDA */}
              <div className="mt-auto pt-10 border-t border-white/5 space-y-4">
                {isUserAuthenticatedStatus ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onAuthenticationLogoutAction();
                      setIsNavigationSheetOpenStatus(false);
                    }}
                    className="w-full justify-start text-[10px] h-14 rounded-2xl font-black text-red-500/80 hover:bg-red-500/10 hover:text-red-500 uppercase tracking-widest transition-all border border-red-500/5"
                  >
                    <LogOut className="mr-4 h-5 w-5" />
                    Desconectar Nodo
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setIsNavigationSheetOpenStatus(false)}>
                    <Button className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 transition-all shadow-xl">
                      Iniciar Frecuencia
                    </Button>
                  </Link>
                )}

                <p className="text-center text-[7px] font-bold text-zinc-800 uppercase tracking-[0.4em] pt-6 italic">
                  NicePod Workstation V4.9 • Madrid Resonance
                </p>
              </div>

            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}
