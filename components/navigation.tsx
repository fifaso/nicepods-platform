// components/navigation.tsx
// VERSIÓN: 20.1

"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

// --- HOOKS Y UTILIDADES ---
import { useAuth } from "@/hooks/use-auth";
import { headerContainerClass } from "./navigation/shared/nav-styles";

// --- VISTAS ESPECIALIZADAS ---
import { DesktopNav } from "./navigation/desktop-nav";
import { MobileNav } from "./navigation/mobile-nav";

// --- CONTRATOS DE DATOS ---
import { ProfileData } from "@/types/profile";

/**
 * COMPONENTE: Navigation (Master Orchestrator)
 * El cerebro que conecta la identidad del usuario con la interfaz visual.
 * 
 * [RESOLUCIÓN TS2322]: 
 * Se aplica un casting explícito a 'ProfileData' para alinear el objeto 
 * de base de datos con los requerimientos de la Workstation.
 */
export function Navigation() {
  const router = useRouter();

  // --- CONSUMO DE IDENTIDAD SOBERANA ---
  const {
    profile,
    isAdmin,
    isAuthenticated,
    signOut,
    isInitialLoading
  } = useAuth();

  /**
   * PROTOCOLO DE DESCONEXIÓN
   * Centralizamos la lógica de cierre de sesión aquí para pasarla como prop pura.
   */
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push("/");
      // Forzamos limpieza de caché para asegurar que los componentes SSR detecten el cambio.
      router.refresh();
    } catch (error) {
      console.error("🔥 [Navigation] Error crítico al cerrar sesión:", error);
    }
  }, [signOut, router]);

  /**
   * TRANSFORMACIÓN DE TIPO:
   * Convertimos el perfil de base de datos al contrato ProfileData.
   * Esto asegura que DesktopNav y MobileNav reciban la estructura esperada.
   */
  const safeProfile = profile as ProfileData | null;

  return (
    // Contenedor Maestro Sticky (Definido en nav-styles.ts)
    <header className={headerContainerClass}>

      {/* 
          1. VISTA DE ESCRITORIO (>768px)
          Renderizada solo en pantallas medianas y grandes.
      */}
      <DesktopNav
        isAuthenticated={isAuthenticated}
        isInitialLoading={isInitialLoading}
        profile={safeProfile}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* 
          2. VISTA MÓVIL (<768px)
          Renderizada solo en pantallas pequeñas.
      */}
      <MobileNav
        isAuthenticated={isAuthenticated}
        isInitialLoading={isInitialLoading}
        profile={safeProfile}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

    </header>
  );
}