// components/navigation/mobile-nav.tsx
// VERSIÓN: 2.0

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
  GUEST_NAV_ITEMS,
  isRouteActive,
  NavItem,
  USER_NAV_ITEMS
} from "./shared/nav-config";
import {
  glassPanelClass
} from "./shared/nav-styles";
import { UserDropdown } from "./shared/user-dropdown";

// --- INFRAESTRUCTURA UI (NicePod Industrial Design) ---
import { ThemeToggle } from "@/components/theme-toggle"; // Control ambiental Sol/Luna
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn, getSafeAsset } from "@/lib/utils";

// --- CONTRATOS DE DATOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: MobileNavProps
 * Define los datos necesarios para la orquestación móvil inyectados por el Master Navigator.
 */
interface MobileNavProps {
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  profile: ProfileData | null;
  isAdmin: boolean;
  onLogout: () => void;
}

/**
 * COMPONENTE: MobileNav
 * El especialista en interacción táctil para NicePod V2.5.
 * 
 * [ARQUITECTURA VISUAL]:
 * - Altura: 72px (h-[4.5rem]) para máxima ergonomía.
 * - Glassmorphism: Backdrop blur de alta densidad (2xl).
 * - Layout: Distribución simétrica entre Identidad (Izquierda) y Acción (Derecha).
 */
export function MobileNav({
  isAuthenticated,
  isInitialLoading,
  profile,
  isAdmin,
  onLogout
}: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Selección de estrategia de navegación basada en la sesión.
  const navItems = isAuthenticated ? USER_NAV_ITEMS : GUEST_NAV_ITEMS;
  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  return (
    <div className={cn(glassPanelClass, "flex md:hidden")}>

      {/* 
          I. NÚCLEO DE MARCA (IZQUIERDA) 
          Renderiza el isotipo y el logotipo con el nuevo escalado 2.0.
      */}
      <NavBrand isAuthenticated={isAuthenticated} />

      {/* 
          II. CENTRO DE CONTROL TÁCTICO (DERECHA) 
          Agrupa las herramientas de alta frecuencia en un clúster organizado.
      */}
      <div className="flex items-center gap-2.5 sm:gap-4">

        {/* 
            1. ACCIÓN PRIMARIA: CREAR 
            Sustituye al antiguo (+) por una cápsula explícita para máxima conversión.
        */}
        {isAuthenticated && !isInitialLoading && (
          <CreateButton
            variant="full"
            className="h-10 px-4 scale-95 origin-right"
          />
        )}

        {/* 
            2. CONTROL AMBIENTAL: THEME TOGGLE 
            Ubicado en el primer nivel para facilitar el cambio ágil entre Modo Nebulosa y Modo Luz.
        */}
        <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
          <ThemeToggle />
        </div>

        {/* 
            3. NODO DE IDENTIDAD: AVATAR 
            Acceso directo a la soberanía del perfil, siempre visible si hay sesión activa.
        */}
        {isAuthenticated && !isInitialLoading && (
          <div className="scale-105">
            <UserDropdown
              profile={profile}
              isAdmin={isAdmin}
              onLogout={onLogout}
            />
          </div>
        )}

        {/* 
            4. NAVEGACIÓN PROFUNDA: MENÚ HAMBURGUESA 
            Despliega el Sheet lateral para acceso a biblioteca, planes y soporte.
        */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl h-10 w-10 bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all active:scale-90"
              aria-label="Abrir mapa de navegación"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[320px] border-l-white/10 bg-black/95 backdrop-blur-3xl p-0 flex flex-col"
          >
            {/* INTERIOR DEL MENÚ LATERAL (THE VAULT LINKS) */}
            <div className="flex flex-col h-full p-8">

              <SheetHeader className="text-left mb-12">
                <SheetTitle className="flex items-center space-x-4 text-white">
                  <div className="h-10 w-10 relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src={logoSrc} alt="NicePod" fill className="object-cover" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter uppercase italic">
                    NicePod
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* LISTA DE NAVEGACIÓN VERTICAL */}
              <nav className="flex flex-col space-y-3">
                {navItems.map((item: NavItem) => {
                  const active = isRouteActive(item.href, pathname);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group"
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between text-[11px] h-14 rounded-2xl font-black px-5 uppercase tracking-[0.2em] transition-all",
                          active
                            ? "bg-white text-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                            : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className={cn("mr-4 h-5 w-5", active ? "text-black" : "text-zinc-600 group-hover:text-primary")} />
                          {item.label}
                        </div>
                        <ChevronRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity", active && "text-black opacity-30")} />
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              {/* FOOTER DEL MENÚ (PROTOCOLO DE SALIDA) */}
              <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full justify-start text-[10px] h-14 rounded-2xl font-black text-red-500/80 hover:bg-red-500/10 hover:text-red-500 uppercase tracking-widest transition-all border border-red-500/5"
                  >
                    <LogOut className="mr-4 h-5 w-5" />
                    Desconectar Nodo
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 transition-all shadow-xl">
                      Iniciar Frecuencia
                    </Button>
                  </Link>
                )}

                <p className="text-center text-[7px] font-bold text-zinc-700 uppercase tracking-[0.4em] pt-4">
                  NicePod Workstation V2.5
                </p>
              </div>

            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Ergonomía de Pulgar: Al aumentar la altura del header a h-[4.5rem] y los 
 *    botones a h-10/h-11, reducimos drásticamente los errores de pulsación.
 * 2. Rendimiento Visual: El uso de 'backdrop-blur-3xl' en el Sheet proporciona
 *    una profundidad premium sin afectar al scroll suave del Main Content.
 * 3. Sincronía Theme: La inyección del ThemeToggle en este nivel asegura que 
 *    el usuario pueda testear el contraste de las tarjetas Aurora al instante.
 */