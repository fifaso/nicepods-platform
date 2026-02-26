// components/auth-guard.tsx
// VERSIÓN: 2.2

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

/**
 * INTERFAZ: AuthGuardProps
 * Define el contrato de protección para los componentes y layouts de NicePod.
 */
interface AuthGuardProps {
  /**
   * children: El contenido soberano que requiere protección de identidad.
   */
  children: ReactNode;
  /**
   * requireAuth: Flag de autoridad. Por defecto es true para todas las rutas protegidas.
   */
  requireAuth?: boolean;
}

/**
 * COMPONENTE: AuthGuard
 * El centinela de integridad de la Workstation NicePod V2.5.
 * 
 * [RESPONSABILIDADES TÁCTICAS]:
 * 1. Monitorear el estado de carga inicial de la sesión (isInitialLoading).
 * 2. Validar si el usuario posee un token JWT nominal y activo.
 * 3. Ejecutar el protocolo de expulsión (Redirect) si el acceso es denegado.
 */
export function AuthGuard({
  children,
  requireAuth = true
}: AuthGuardProps) {

  // --- CONSUMO DE ESTADOS DE IDENTIDAD ---
  const { isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * PROTOCOLO DE PROTECCIÓN:
   * Este efecto vigila el cambio de estado de la sesión. Solo actúa una vez
   * que el handshake inicial (T0) ha finalizado para evitar falsos negativos.
   */
  useEffect(() => {
    // Si el sistema ya terminó de cargar y se requiere auth, pero no hay sesión...
    if (!isInitialLoading && requireAuth && !isAuthenticated) {
      console.warn(`🛡️ [AuthGuard] Acceso no autorizado detectado en: ${pathname}. Iniciando Protocolo de Expulsión.`);

      // Construimos la URL de retorno para una navegación fluida post-login.
      const redirectParams = new URLSearchParams();
      redirectParams.set("redirect", pathname);

      const loginUrl = `/login?${redirectParams.toString()}`;

      // Ejecutamos el reemplazo de ruta para no ensuciar el historial de navegación.
      router.replace(loginUrl);
    }
  }, [isAuthenticated, isInitialLoading, requireAuth, router, pathname]);

  /**
   * CAPA 0: PANTALLA DE SINTONÍA (VELO DE CARGA)
   * Mientras el sistema negocia con Supabase Auth, bloqueamos el renderizado
   * para evitar el 'Content Flash' de datos privados.
   */
  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#020202] z-[9999] selection:bg-primary/30">

        {/* Visualización Industrial de Carga */}
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
            NicePod Architecture V2.5 • Madrid Resonance
          </div>
        </div>

      </div>
    );
  }

  /**
   * CAPA 1: BARRERA DE SEGURIDAD
   * Si la ruta exige auth y no la tenemos, devolvemos null mientras el useEffect 
   * anterior orquesta la redirección física. Esto previene fugas de datos en el DOM.
   */
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#020202]" /> // Pantalla negra de transición segura.
    );
  }

  /**
   * CAPA 2: ACCESO CONCEDIDO
   * Una vez superada la validación, liberamos los componentes hijos.
   */
  return <>{children}</>;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Exportación Nombrada: El uso de 'export function AuthGuard' es imperativo 
 *    para que el compilador TS identifique el miembro al ser importado en 
 *    los layouts mediante desestructuración { AuthGuard }.
 * 2. Z-Index y Fondo: El loader utiliza bg-[#020202] y un z-index elevado 
 *    para asegurar que la pantalla de carga tape cualquier mapa o gradiente 
 *    residual del Root Layout.
 * 3. Gestión de Redirección: Al usar 'router.replace', evitamos que el usuario 
 *    pueda volver atrás a una página protegida usando el botón del navegador, 
 *    reforzando la seguridad de la sesión.
 */