/**
 * ARCHIVO: components/auth/auth-guard.tsx
 * VERSIÓN: 4.0 (NicePod Sovereign Access Sentinel - Full ZAP Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar el centinela de integridad y seguridad de la Workstation, 
 * validando la identidad del Voyager antes de permitir el acceso al cristal.
 * [REFORMA V4.0]: Transmutación nominal absoluta. Se han sustituido los alias de 
 * legado ('isAuthenticated', 'isInitialLoading') por los descriptores industriales 
 * soberanos ('isUserAuthenticated', 'isInitialHandshakeLoading') en sincronía con 
 * AuthProvider V5.1, erradicando los errores TS2339.
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
  /**
   * [SINCRO V4.0]: Desestructuración alineada con el núcleo soberano del AuthProvider.
   * Se descartan los alias de legado.
   */
  const { isUserAuthenticated, isInitialHandshakeLoading } = useAuth();
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
    const isVoyagerUnauthorized = !isInitialHandshakeLoading && isAuthenticationRequired && !isUserAuthenticated;

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
  }, [isUserAuthenticated, isInitialHandshakeLoading, isAuthenticationRequired, navigationRouter, currentNavigationPathname]);

  /**
   * CAPA 0: PANTALLA DE SINTONÍA (VELO DE CARGA)
   * Mientras el sistema negocia con el Metal (Supabase Auth), bloqueamos el renderizado 
   * para evitar fugas visuales de datos privados en el Hilo Principal.
   */
  if (isInitialHandshakeLoading) {
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
  if (isAuthenticationRequired && !isUserAuthenticated) {
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Contract Alignment: Se resolvieron los errores TS2339 al utilizar 
 *    'isUserAuthenticated' e 'isInitialHandshakeLoading', alineando el 
 *    componente con el núcleo de identidad V5.1.
 * 2. Navigation Integrity: El uso de 'replace' en lugar de 'push' asegura que el 
 *    historial del navegador no retenga intentos fallidos de acceso a nodos privados.
 */