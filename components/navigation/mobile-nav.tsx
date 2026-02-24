// components/navigation/mobile-nav.tsx
// VERSIÓN: 1.0

"use client";

import { LogOut, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// --- ÁTOMOS Y CONFIGURACIÓN ---
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

// --- INFRAESTRUCTURA UI ---
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn, getSafeAsset } from "@/lib/utils";

// --- TIPOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: MobileNavProps
 * Contrato de datos que recibe del Orquestador Maestro.
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
 * Especialista en renderizado para pantallas pequeñas.
 * Se oculta automáticamente en desktop (md:hidden).
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

  // Selección de estrategia de enlaces
  const navItems = isAuthenticated ? USER_NAV_ITEMS : GUEST_NAV_ITEMS;

  // Activo visual para el header del Sheet
  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  return (
    // Contenedor 'glassPanelClass' + visibilidad condicional
    <div className={cn(glassPanelClass, "flex md:hidden justify-between")}>

      {/* 1. ZONA DE MARCA (Izquierda) */}
      <NavBrand isAuthenticated={isAuthenticated} />

      {/* 2. ZONA DE ACCIÓN Y MENÚ (Derecha) */}
      <div className="flex items-center gap-2">

        {/* A. BOTÓN CREAR (Solo si logueado y cargado) */}
        {isAuthenticated && !isInitialLoading && (
          <CreateButton variant="icon" />
        )}

        {/* B. AVATAR DE USUARIO (Acceso directo al perfil) */}
        {isAuthenticated && !isInitialLoading && (
          <UserDropdown
            profile={profile}
            isAdmin={isAdmin}
            onLogout={onLogout}
          />
        )}

        {/* C. MENÚ HAMBURGUESA (Acceso a navegación completa) */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[300px] border-l-white/10 bg-black/95 backdrop-blur-2xl p-0 flex flex-col"
          >
            <div className="flex flex-col h-full p-6">

              {/* HEADER DEL MENÚ LATERAL */}
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="flex items-center space-x-3 text-white">
                  <div className="h-8 w-8 relative rounded-lg overflow-hidden border border-white/20 shadow-lg">
                    <Image
                      src={logoSrc}
                      alt="NicePod"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-black text-xl tracking-tighter uppercase italic">
                    NicePod
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* LISTA DE NAVEGACIÓN VERTICAL */}
              <nav className="flex flex-col space-y-2">
                {navItems.map((item: NavItem) => {
                  const active = isRouteActive(item.href, pathname);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-[10px] h-12 rounded-xl font-black px-4 uppercase tracking-widest transition-all",
                          active
                            ? "bg-white text-black shadow-md"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-4 h-4 w-4",
                            active ? "opacity-100" : "opacity-50"
                          )}
                        />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              {/* FOOTER DEL MENÚ (Tema y Salida) */}
              <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Apariencia
                  </span>
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full justify-start text-[10px] h-12 rounded-xl font-black text-red-400 hover:bg-red-500/10 hover:text-red-300 uppercase tracking-widest transition-colors"
                  >
                    <LogOut className="mr-4 h-4 w-4" />
                    Desconectar
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-colors">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>

            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}