// hooks/use-auth.tsx
// VERSIÓN: 18.1 (Global Identity Synchronizer - Production & Loop Protection)
// Misión: Centralizar la soberanía de la sesión, erradicar bucles de eventos y garantizar silencio en producción.

"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

/**
 * [TIPADO ESTRICTO]
 * Extraemos el esquema de perfil de la base de datos de NicePod.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextType
 * Contrato de identidad global para NicePod V2.5.
 */
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  isProfileLoading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * Orquestador maestro de la identidad. 
 * Implementa protección contra bucles de eventos (Idempotencia) y sincronía Server-to-Client.
 */
export function AuthProvider({
  session: initialSession,
  children
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // --- ESTADOS DE IDENTIDAD ---
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // --- ESTADOS DE CARGA (PRECISIÓN TÁCTICA) ---
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!initialSession);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // --- GUARDIAS DE MEMORIA (PREVENCIÓN DE LOOPS) ---
  const isFetchingProfile = useRef<boolean>(false);
  const lastFetchedUserId = useRef<string | null>(null);
  const isListenerInitialized = useRef<boolean>(false);

  /**
   * getProfile
   * Recupera los metadatos del curador (reputación, avatar, rol).
   * Implementa un bloqueo por ID para evitar múltiples llamadas al mismo perfil.
   */
  const getProfile = useCallback(async (userId: string, force: boolean = false) => {
    // Protección: Evitar re-peticiones si ya hay una carga en curso o si el ID es idéntico
    if ((isFetchingProfile.current || lastFetchedUserId.current === userId) && !force) {
      return;
    }

    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      // Logger Condicional: Solo visible en entorno de desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`👤 [Auth-Protocol] Sincronizando ADN: ${userId.substring(0, 8)}...`);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setProfile(null);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        lastFetchedUserId.current = userId;
      }
    } catch (error: any) {
      console.error("🔥 [NicePod-Auth-Error]:", error.message);
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, [supabase]);

  /**
   * refreshProfile
   * Actualización manual tras cambios en ajustes.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await getProfile(user.id, true);
    }
  }, [user, getProfile]);

  /**
   * [AUTH LIFECYCLE]: Escucha de eventos de Supabase
   */
  useEffect(() => {
    let mounted = true;

    // 1. HIDRATACIÓN INICIAL (Server-to-Client Handshake)
    if (initialSession?.user?.id && !profile && !lastFetchedUserId.current) {
      getProfile(initialSession.user.id);
    } else if (!initialSession) {
      setIsInitialLoading(false);
    }

    // 2. PROTECCIÓN DE ESCUCHA (Singleton Listener)
    if (isListenerInitialized.current) return;
    isListenerInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        // Logger Condicional
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 [Auth-Event] Detección: ${event}`);
        }

        const newUser = newSession?.user || null;

        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          // Solo disparamos carga si el usuario ha cambiado realmente o es un login explícito
          if (newUser.id !== lastFetchedUserId.current || event === 'SIGNED_IN') {
            await getProfile(newUser.id);
          }

          if (event === 'SIGNED_IN') {
            router.refresh();
          }
        } else {
          // Limpieza de estados en Logout
          setProfile(null);
          lastFetchedUserId.current = null;
          setIsProfileLoading(false);
          setIsInitialLoading(false);

          if (event === 'SIGNED_OUT') {
            router.refresh();
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initialSession, getProfile, router, profile]);

  /**
   * signOut
   * Desconexión absoluta y limpieza de rastro.
   */
  const signOut = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🛑 [Auth] Ejecutando desconexión segura...");
    }

    await supabase.auth.signOut();

    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;

    // Redirección total para limpiar caché de memoria
    window.location.href = "/";
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  // --- ESTADOS CALCULADOS ---
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile]);
  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- CONTEXTO SOBERANO ---
  const contextValue = useMemo(() => ({
    session,
    user,
    profile,
    isAdmin,
    isAuthenticated,
    isInitialLoading,
    isProfileLoading,
    signOut,
    resetPassword,
    refreshProfile,
    supabase
  }), [
    session,
    user,
    profile,
    isAdmin,
    isAuthenticated,
    isInitialLoading,
    isProfileLoading,
    signOut,
    resetPassword,
    refreshProfile,
    supabase
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("CRITICAL: useAuth debe ser invocado dentro de un AuthProvider validado.");
  }
  return context;
}