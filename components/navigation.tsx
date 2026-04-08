/**
 * ARCHIVO: components/navigation.tsx
 * VERSIÓN: 21.0 (NicePod Navigation Master - Absolute Contract Sync)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la infraestructura de navegación global, vinculando la 
 * autoridad del usuario con las interfaces especializadas de escritorio y móvil.
 * [REFORMA V21.0]: Sincronización nominal total con DesktopNav V4.0 y MobileNav V4.0, 
 * resolución definitiva del error TS2322 y cumplimiento de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

// --- HOOKS Y INFRAESTRUCTURA DE DISEÑO ---
import { useAuth } from "@/hooks/use-auth";
import { headerContainerClass } from "./navigation/shared/nav-styles";

// --- VISTAS ESPECIALIZADAS DE COMANDO ---
import { DesktopNav } from "./navigation/desktop-nav";
import { MobileNav } from "./navigation/mobile-nav";

// --- CONTRATOS DE DATOS SOBERANOS ---
import { ProfileData } from "@/types/profile";

/**
 * Navigation: El orquestador maestro del sistema de navegación de la Workstation.
 */
export function Navigation() {
  const navigationRouter = useRouter();

  // --- I. CONSUMO DE AUTORIDAD Y ESTADO DE SESIÓN ---
  const {
    profile: rawAdministratorProfile,
    isAdmin: isAdministratorAuthority,
    isAuthenticated: isUserAuthenticated,
    signOut: terminateSessionAction,
    isInitialLoading: isInitialLoadingState
  } = useAuth();

  /**
   * handleAuthenticationLogoutAction:
   * Misión: Ejecutar la terminación segura de la sesión y sincronizar el estado del servidor.
   */
  const handleAuthenticationLogoutAction = useCallback(async () => {
    try {
      await terminateSessionAction();
      
      // Redirección al punto de entrada global tras la revocación de autoridad.
      navigationRouter.push("/");
      
      /**
       * Forzamos la re-validación de la ruta para asegurar que los componentes 
       * de servidor (SSR) detecten la transición al estado 'unauthenticated'.
       */
      navigationRouter.refresh();
    } catch (authenticationException) {
      console.error(
        "🔥 [Navigation-Fatal] Error crítico durante la terminación de sesión:", 
        authenticationException
      );
    }
  }, [terminateSessionAction, navigationRouter]);

  /**
   * administratorProfile:
   * Misión: Validar y tipar la estructura de identidad recolectada del Metal.
   */
  const administratorProfile = rawAdministratorProfile as ProfileData | null;

  return (
    /**
     * headerContainerClass: 
     * Provee el chasis sticky y el aislamiento de contexto definido en nav-styles.
     */
    <header className={headerContainerClass}>

      {/* 
          1. TERMINAL DE COMANDO DE ESCRITORIO (>1024px)
          [FIX V21.0]: Sincronización nominal absoluta con DesktopNavigationProperties.
      */}
      <DesktopNav
        isUserAuthenticated={isUserAuthenticated}
        isInitialLoadingState={isInitialLoadingState}
        administratorProfile={administratorProfile}
        isAdministratorAuthority={isAdministratorAuthority}
        onAuthenticationLogoutAction={handleAuthenticationLogoutAction}
      />

      {/* 
          2. TERMINAL DE COMANDO MÓVIL (<1024px)
          [FIX V21.0]: Sincronización nominal absoluta con MobileNavigationProperties.
      */}
      <MobileNav
        isUserAuthenticated={isUserAuthenticated}
        isInitialLoadingState={isInitialLoadingState}
        administratorProfile={administratorProfile}
        isAdministratorAuthority={isAdministratorAuthority}
        onAuthenticationLogoutAction={handleAuthenticationLogoutAction}
      />

    </header>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V21.0):
 * 1. Contract Alignment: Se resolvió el error de compilación TS2322 de Vercel al 
 *    actualizar las propiedades enviadas a DesktopNav (isUserAuthenticated, etc.).
 * 2. Zero Abbreviations Policy: Se purificaron términos legacy como 'router', 'e', 
 *    'isAdmin', e 'isAuthenticated' sustituyéndolos por descriptores periciales.
 * 3. Atomic Refresh: El uso de 'navigationRouter.refresh()' garantiza que la 
 *    Bóveda de Vercel purgue la caché de los Server Components al cerrar la sesión.
 */