/**
 * ARCHIVO: components/navigation.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Nominal Sovereignty
 * MISIÓN: Orquestar la infraestructura de navegación global de la Workstation.
 * [REFORMA V5.1]: Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Sincronización nominal absoluta entre terminales Desktop y Mobile.
 * NIVEL DE INTEGRIDAD: 100%
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
    profile: rawAdministratorProfileObject,
    isAdministratorAuthority: isAdministratorAuthorityStatus,
    isAuthenticated: isUserAuthenticatedStatus,
    signOut: terminateSessionAction,
    isInitialLoading: isInitialLoadingProcessActive
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
    } catch (authenticationException: unknown) {
      console.error(
        "🔥 [Navigation-Fatal] Error crítico durante la terminación de sesión:", 
        authenticationException
      );
    }
  }, [terminateSessionAction, navigationRouter]);

  /**
   * userProfileDataSnapshot:
   * Misión: Validar y tipar la estructura de identidad recolectada del Metal.
   */
  const userProfileDataSnapshot = rawAdministratorProfileObject as ProfileData | null;

  return (
    /**
     * headerContainerClass: 
     * Provee el chasis sticky y el aislamiento de contexto definido en nav-styles.
     */
    <header className={headerContainerClass}>

      {/* 
          1. TERMINAL DE COMANDO DE ESCRITORIO (>1024px)
          [Sincronizado con DesktopNavigationComponentProperties V5.1]
      */}
      <DesktopNav
        isUserAuthenticatedStatus={isUserAuthenticatedStatus}
        isInitialLoadingProcessActive={isInitialLoadingProcessActive}
        administratorProfile={userProfileDataSnapshot}
        isAdministratorAuthorityStatus={isAdministratorAuthorityStatus}
        onAuthenticationLogoutAction={handleAuthenticationLogoutAction}
      />

      {/* 
          2. TERMINAL DE COMANDO MÓVIL (<1024px)
          [Sincronizado con MobileNavigationComponentProperties V5.1]
      */}
      <MobileNav
        isUserAuthenticatedStatus={isUserAuthenticatedStatus}
        isInitialLoadingProcessActive={isInitialLoadingProcessActive}
        userProfileDataSnapshot={userProfileDataSnapshot}
        isAdministratorAuthorityStatus={isAdministratorAuthorityStatus}
        onAuthenticationLogoutAction={handleAuthenticationLogoutAction}
      />

    </header>
  );
}
