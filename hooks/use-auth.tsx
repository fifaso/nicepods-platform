// hooks/use-auth.tsx
// VERSIÓN: 15.0 (Madrid Resonance - Full Auth Protocol & Identity Guard)

"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * [TIPADO ESTRICTO]
 * Definimos el perfil de NicePod basado en el esquema de base de datos.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ MAESTRA: AuthContextType
 * Este es el contrato que rige toda la seguridad del Frontend.
 */
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isAuthenticated: boolean; // [NUEVO]: Helper para validaciones rápidas
  isLoading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>; // [NUEVO]: Integración para forgot-password
  refreshProfile: () => Promise<void>; // [NUEVO]: Para actualizar datos tras edición de perfil
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * Orquestador de la identidad del usuario. 
 * Sincroniza la sesión del servidor con el estado del cliente en tiempo real.
 */
export function AuthProvider({
  session: initialSession,
  children
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(!initialSession);

  /**
   * getProfile
   * Recupera los metadatos extendidos del usuario (reputación, rol, etc.)
   */
  const getProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("[NicePod-Auth] Fallo al recuperar perfil:", error);
      setProfile(null);
    }
  }, [supabase]);

  /**
   * refreshProfile
   * Permite a otros componentes forzar la actualización de la identidad.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) await getProfile(user.id);
  }, [user, getProfile]);

  useEffect(() => {
    let isMounted = true;

    // Carga inicial del perfil si ya tenemos sesión del servidor
    if (initialSession?.user?.id) {
      getProfile(initialSession.user.id).finally(() => {
        if (isMounted) setIsLoading(false);
      });
    }

    /**
     * ESCUCHA DE ESTADO (Realtime Auth)
     * Detecta cambios de sesión en todas las pestañas y sincroniza el estado.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log(`[NicePod-Auth] Evento detectado: ${event}`);

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await getProfile(newSession.user.id);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase, initialSession, getProfile]);

  /**
   * ACCIONES MAESTRAS
   * Optimizadas con useCallback para evitar re-renders en cascada.
   */

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    // Forzamos limpieza de cookies de sesión
    window.location.href = "/";
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  // Lógica de roles y estados calculados
  const isAdmin = profile?.role === 'admin';
  const isAuthenticated = !!user;

  /**
   * [MEMOIZACIÓN]: Evitamos que el árbol de componentes 
   * se refresque si las funciones no han cambiado.
   */
  const contextValue = useMemo(() => ({
    session,
    user,
    profile,
    isAdmin,
    isAuthenticated,
    isLoading,
    signOut,
    resetPassword,
    refreshProfile,
    supabase
  }), [session, user, profile, isAdmin, isAuthenticated, isLoading, signOut, resetPassword, refreshProfile, supabase]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth
 * Punto de entrada para consumir la identidad del usuario en cualquier parte del sistema.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("CRITICAL: useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}