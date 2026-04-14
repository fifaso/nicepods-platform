/**
 * ARCHIVO: components/auth/auth-guard.tsx
 * VERSIÓN: 3.0 (NicePod Sovereign Access Sentinel - Axial Path Sanitization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar el centinela de integridad y seguridad de la Workstation, 
 * validando la identidad del Voyager antes de permitir el acceso al cristal.
 * [REFORMA V3.0]: Implementación de 'Axial Path Sanitization'. Resolución del 
 * error TS2769 mediante la garantía de hilos de texto no nulos en la redirección. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP) y fortalecimiento 
 * del Build Shield Sovereignty (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

/**
 * INTERFAZ: AuthGuardProperties
 * Define el contrato de protección para los componentes y layouts de la terminal.
 */
interface AuthGuardProperties {
  /**
   * children: El contenido soberano que requiere protección de identidad.
   */
  children: ReactNode;
  /**
   * isAuthenticationRequired: Flag de autoridad. Por defecto es true para todas las rutas protegidas.
   */
  isAuthenticationRequired?: boolean;
}

/**
 * COMPONENTE: AuthGuard
 * El centinela de integridad de la Workstation NicePod Madrid Resonance.
 */
export function AuthGuard({
  children,
  isAuthenticationRequired = true
}: AuthGuardProperties) {

  // --- I. CONSUMO DE ESTADOS DE IDENTIDAD Y NAVEGACIÓN ---
  const { isAuthenticated, isInitialLoading } = useAuth();
  const navigationRouter = useRouter();

  /**
   * [BSS]: SANITIZACIÓN AXIAL
   * El hook usePathname() puede devolver null. Forzamos un fallback a la raíz 
   * para garantizar que el compilador trate a 'currentNavigationPathname' como string.
   */
  const currentNavigationPathname = usePathname() || "/";

  /**
   * II. PROTOCOLO DE PROTECCIÓN DE IDENTIDAD
   * Este efecto vigila el cambio de estado de la sesión. Solo actúa una vez
   * que el apretón de manos inicial (Handshake) con Supabase ha finalizado.
   */
  useEffect(() => {
    const isVoyagerUnauthorized = !isInitialLoading && isAuthenticationRequired && !isAuthenticated;

    if (isVoyagerUnauthorized) {
      console.warn(`🛡️ [AuthGuard] Acceso no autorizado detectado en: ${currentNavigationPathname}. Iniciando Protocolo de Expulsión.`);

      // III. CONSTRUCCIÓN DEL PASAPORTE DE REDIRECCIÓN
      const redirectionParameters = new URLSearchParams();

      /**
       * [FIX TS2769]: Al usar 'currentNavigationPathname' (ya sanitizado), 
       * garantizamos que el valor nunca sea null, satisfaciendo el Build Shield.
       */
      redirectionParameters.set("redirect", currentNavigationPathname);

      const loginUniformResourceLocator = `/login?${redirectionParameters.toString()}`;

      // Ejecutamos el reemplazo de ruta para no degradar el historial de navegación del dispositivo.
      navigationRouter.replace(loginUniformResourceLocator);
    }
  }, [isAuthenticated, isInitialLoading, isAuthenticationRequired, navigationRouter, currentNavigationPathname]);

  /**
   * CAPA 0: PANTALLA DE SINTONÍA (VELO DE CARGA)
   * Mientras el sistema negocia con el Metal (Supabase Auth), bloqueamos el renderizado 
   * para evitar fugas visuales de datos privados en el Hilo Principal.
   */
  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#020202] z-[9999] selection:bg-primary/30">

        {/* Visualización Industrial de Carga Cinética */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 opacity-40">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">
              Autenticando Nodo
            </span>
            <Zap size={14} className="text-primary" />
          </div>
          <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest animate-pulse">
            NicePod Architecture V4.9 • Madrid Resonance
          </div>
        </div>

      </div>
    );
  }

  /**
   * CAPA 1: BARRERA DE SEGURIDAD
   * Si la ruta exige autoridad y el Voyager no está validado, devolvemos un 
   * escenario neutro mientras se completa la transición física.
   */
  if (isAuthenticationRequired && !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#020202]" />
    );
  }

  /**
   * CAPA 2: ACCESO CONCEDIDO (SOBERANÍA DEL CRISTAL)
   * Una vez superada la aduana de identidad, liberamos el capital intelectual.
   */
  return <>{children}</>;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. ZAP Enforcement: Se han purificado los descriptores de navegación 
 *    (navigationRouter, currentNavigationPathname) y propiedades (AuthGuardProperties).
 * 2. Build Shield Absolute: La sanitización inline 'usePathname() || "/"' elimina 
 *    la posibilidad de 'Null Argument' en los constructores de URL.
 * 3. Navigation Integrity: El uso de 'replace' en lugar de 'push' asegura que el 
 *    historial del navegador no retenga intentos fallidos de acceso a nodos privados.
 */