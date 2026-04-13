/**
 * ARCHIVO: components/navigation.tsx
 * VERSIÓN: 21.1 (NicePod Navigation Master - Absolute Contract Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la infraestructura de navegación global, vinculando la 
 * autoridad del usuario con las interfaces especializadas de escritorio y móvil.
 * [REFORMA V21.1]: Sincronización nominal total y preparación para la elevación 
 * de MobileNav al estándar industrial V4.0.
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
          [Sincronizado con DesktopNavigationProperties V4.0]
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
          [Sincronizado con MobileNavigationProperties V4.0]
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