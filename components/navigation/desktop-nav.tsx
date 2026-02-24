// components/navigation/desktop-nav.tsx
// VERSIÓN: 1.0

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  glassPanelClass,
  navLinkActiveClass,
  navLinkBaseClass,
  navLinkInactiveClass
} from "./shared/nav-styles";
import { UserDropdown } from "./shared/user-dropdown";

// --- COMPONENTES AUXILIARES ---
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- TIPOS ---
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: DesktopNavProps
 * Contrato de datos que recibe del Orquestador Maestro.
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
 * Especialista en renderizado para pantallas medianas y grandes.
 * Se oculta automáticamente en móviles (hidden md:flex).
 */
export function DesktopNav({
  isAuthenticated,
  isInitialLoading,
  profile,
  isAdmin,
  onLogout
}: DesktopNavProps) {
  const pathname = usePathname();

  // Selección de estrategia de enlaces
  const navItems = isAuthenticated ? USER_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    // Contenedor 'glassPanelClass' importado para consistencia visual
    <div className={cn(glassPanelClass, "hidden md:flex")}>

      {/* 1. ZONA DE MARCA (Izquierda) */}
      <NavBrand isAuthenticated={isAuthenticated} />

      {/* 2. ZONA DE NAVEGACIÓN CENTRAL (Centro Absoluto) */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ul className="flex items-center space-x-1 rounded-full bg-white/5 p-1 border border-white/5 backdrop-blur-md">
          {navItems.map((item: NavItem) => {

            // Caso Especial: Botón Primario (ej: Crear)
            // En desktop, este ítem se renderiza como un botón Aurora completo.
            if (item.isPrimary) {
              return (
                <li key={item.href}>
                  <CreateButton variant="full" />
                </li>
              );
            }

            // Caso Estándar: Enlace de Texto
            const isActive = isRouteActive(item.href, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    navLinkBaseClass,
                    isActive ? navLinkActiveClass : navLinkInactiveClass
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. ZONA DE HERRAMIENTAS Y PERFIL (Derecha) */}
      <div className="flex-1 flex items-center justify-end gap-3">

        {/* Toggle de Tema (Siempre visible) */}
        <ThemeToggle />

        {/* Lógica de Estado de Sesión */}
        {isInitialLoading ? (
          // Estado de Carga: Spinner discreto para evitar layout shift
          <div className="h-10 w-10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
          </div>
        ) : isAuthenticated ? (
          // Estado Logueado: Notificaciones + Avatar
          <>
            <NotificationBell />
            <UserDropdown
              profile={profile}
              isAdmin={isAdmin}
              onLogout={onLogout}
            />
          </>
        ) : (
          // Estado Invitado: Botón de Ingreso
          <Link href="/login">
            <Button
              variant="outline"
              className="h-9 rounded-full px-6 font-black text-[10px] uppercase tracking-widest border-white/10 hover:bg-white hover:text-black transition-colors"
            >
              Ingresar
            </Button>
          </Link>
        )}
      </div>

    </div>
  );
}