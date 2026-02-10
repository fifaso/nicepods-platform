// components/auth-guard.tsx
// VERSIÓN: 2.0 (Identity Guard - NicePod Architecture Standard)
// Misión: Validar la soberanía del usuario en rutas protegidas y prevenir fugas de acceso.
// [FIX]: Resolución de error TS2339 'isLoading' mediante sincronía con use-auth V17.0.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

/**
 * INTERFACE: AuthGuardProps
 * children: Contenido protegido.
 * requireAuth: Define si la ruta exige una sesión activa (por defecto true).
 */
interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard: El centinela de componentes de NicePod.
 * Actúa como una capa de seguridad de último nivel en el lado del cliente.
 */
export function AuthGuard({
  children,
  requireAuth = true
}: AuthGuardProps) {

  /**
   * [SINCRO V17.0]: Consumo de estados granulares.
   * Utilizamos 'isInitialLoading' para saber si el sistema aún está negociando 
   * el handshake de sesión con Supabase.
   */
  const { isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * [LÓGICA DE PROTECCIÓN]
   * Este efecto orquesta la expulsión de usuarios no autorizados.
   */
  useEffect(() => {
    // Solo tomamos decisiones una vez que la carga inicial ha terminado
    if (!isInitialLoading) {
      if (requireAuth && !isAuthenticated) {
        console.warn(`🛡️ [AuthGuard] Acceso denegado a ${pathname}. Redirigiendo a Login.`);

        // Redirección inteligente preservando la ruta de origen
        const loginUrl = new URL('/login', window.location.origin);
        loginUrl.searchParams.set('redirect', pathname);

        router.replace(loginUrl.pathname + loginUrl.search);
      }
    }
  }, [isAuthenticated, isInitialLoading, requireAuth, router, pathname]);

  /**
   * [ESTADO DE ESPERA]: Pantalla de Sintonía
   * Mientras el sistema está hidratando la sesión (Handshake), mostramos 
   * una interfaz de carga mínima para evitar parpadeos de contenido privado.
   */
  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full space-y-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 animate-pulse">
          Validando Frecuencia...
        </p>
      </div>
    );
  }

  /**
   * [FLUJO FINAL]
   * Si no se requiere auth, o si el usuario está autenticado, liberamos el contenido.
   * Si no está autenticado pero la ruta lo requiere, el useEffect anterior se encargará del redirect.
   */
  if (requireAuth && !isAuthenticated) {
    return null; // Evitamos renderizar contenido sensible antes del redirect
  }

  return <>{children}</>;
}