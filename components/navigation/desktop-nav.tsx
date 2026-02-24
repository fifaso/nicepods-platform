// components/navigation/desktop-nav.tsx
// VERSIÓN: 2.0

"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// --- ÁTOMOS Y CONFIGURACIÓN DE IDENTIDAD ---
import { CreateButton } from "./shared/create-button";
import { NavBrand } from "./shared/nav-brand";
import {
  GUEST_NAV_ITEMS,
  isRouteActive,
  NavItem,
  USER_NAV_ITEMS
} from "./shared/nav-config";
import {
  glassPanelClass,
  navLinkActiveClass,
  navLinkBaseClass,
  navLinkInactiveClass
} from "./shared/nav-styles";
import { UserDropdown } from "./shared/user-dropdown";

// --- INFRAESTRUCTURA UI (NicePod Design System) ---
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- CONTRATOS DE DATOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: DesktopNavProps
 * Define el contrato de datos inyectados por el Master Navigator.
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
 * Especialista en renderizado de alta densidad para pantallas medianas y grandes.
 * 
 * [ARQUITECTURA VISUAL 2.0]:
 * - Centro Absoluto: Utiliza posicionamiento absoluto para garantizar la simetría.
 * - Cápsula de Cristal: Fondo negro translúcido para resaltar botones activos.
 * - Sincronía de Altura: Todos los elementos interactivos operan bajo el estándar de 40px (h-10).
 */
export function DesktopNav({
  isAuthenticated,
  isInitialLoading,
  profile,
  isAdmin,
  onLogout
}: DesktopNavProps) {
  const pathname = usePathname();

  // Selección dinámica de la estrategia de rutas basada en la sesión activa.
  const navItems = isAuthenticated ? USER_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    // Contenedor Maestro: Glassmorphism de alta densidad definido en nav-styles.
    <div className={cn(glassPanelClass, "hidden md:flex items-center")}>

      {/* 1. NÚCLEO IZQUIERDO: IDENTIDAD DE MARCA (NavBrand) */}
      <NavBrand isAuthenticated={isAuthenticated} />

      {/* 
          2. NÚCLEO CENTRAL: CÁPSULA DE NAVEGACIÓN (THE COMMAND CAPSULE)
          Este bloque central es el corazón de la interactividad.
      */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ul className={cn(
          "flex items-center space-x-2.5 p-1.5 rounded-full",
          "bg-black/40 border border-white/10 shadow-2xl backdrop-blur-3xl",
          "transition-all duration-700"
        )}>
          {navItems.map((item: NavItem) => {

            // CASO A: BOTÓN DE ACCIÓN PRIMARIA (CREAR)
            // Se inyecta como un componente independiente para manejar su propio gradiente Aurora.
            if (item.isPrimary) {
              return (
                <li key={item.href} className="flex items-center">
                  <CreateButton variant="full" className="h-10" />
                </li>
              );
            }

            // CASO B: ENLACE DE TEXTO ESTÁNDAR (INICIO, BIBLIOTECA, etc.)
            const active = isRouteActive(item.href, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    navLinkBaseClass,
                    "h-10 flex items-center justify-center", // Altura calibrada a 40px
                    active ? navLinkActiveClass : navLinkInactiveClass
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. NÚCLEO DERECHO: CLÚSTER DE HERRAMIENTAS Y SOBERANÍA */}
      <div className="flex-1 flex items-center justify-end gap-4">

        {/* Toggle de Apariencia: Acceso instantáneo a Modo Nebulosa / Modo Luz */}
        <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
          <ThemeToggle />
        </div>

        {/* Lógica de Identidad Atómica */}
        {isInitialLoading ? (
          // Estado de Carga: Spinner calibrado para minimizar el Cumulative Layout Shift (CLS)
          <div className="h-10 w-10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
          </div>
        ) : isAuthenticated ? (
          // Estado Autenticado: Notificaciones y Menú Desplegable de Usuario
          <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-500">
            <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <NotificationBell />
            </div>

            <UserDropdown
              profile={profile}
              isAdmin={isAdmin}
              onLogout={onLogout}
            />
          </div>
        ) : (
          // Estado Invitado: Botón de Acceso (Login)
          <Link href="/login">
            <Button
              variant="outline"
              className="h-10 rounded-full px-8 font-black text-[10px] uppercase tracking-[0.25em] border-white/10 hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
            >
              Ingresar
            </Button>
          </Link>
        )}
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Simetría Absoluta: La cápsula central utiliza 'absolute left-1/2' para 
 *    garantizar que siempre esté centrada en el visor, independientemente 
 *    del ancho del logo o del clúster derecho.
 * 2. Glassmorphism Nivel 2: Al usar 'bg-black/40' sobre 'backdrop-blur-3xl', 
 *    el contenedor central parece flotar con una profundidad física real.
 * 3. Hit-boxes Ergonómicas: Todos los botones centrales comparten una altura 
 *    de 40px (h-10) y un padding horizontal expansivo (px-7 o px-8), 
 *    proyectando una sensación de control premium y minimizando errores de clic.
 */