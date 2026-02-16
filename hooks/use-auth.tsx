// hooks/use-auth.tsx
// VERSIÓN: 19.0 (Global Identity Synchronizer - Atomic Sync Standard)
// Misión: Centralizar la soberanía de identidad, sincronizar el perfil desde SSR y erradicar el pestañeo visual.
// [ESTABILIZACIÓN]: Recepción de 'initialProfile' desde el servidor para evitar peticiones redundantes en el arranque.

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
 * [TIPADO SOBERANO]
 * Extraemos el esquema de perfil de la base de datos de NicePod.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextType
 * Define el contrato de identidad total para la Workstation NicePod V2.5.
 */
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isInitialLoading: boolean; // Controla la visibilidad del 'Splash Screen'
  isProfileLoading: boolean; // Controla actualizaciones parciales del perfil
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * Orquestador de la transición Servidor-Cliente.
 * Garantiza que la identidad del curador esté presente desde el primer frame.
 */
export function AuthProvider({
  initialSession,
  initialProfile,
  children
}: {
  initialSession: Session | null;
  initialProfile: Tables<'profiles'> | null;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // --- ESTADOS DE IDENTIDAD ATÓMICA ---
  // Inicializamos con los datos del servidor (SSR) para evitar el gap de hidratación.
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  // --- ESTADOS DE CARGA (PRECISIÓN TÁCTICA) ---
  // Si el servidor ya nos dio sesión y perfil, no hay carga inicial necesaria.
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!initialSession || (!!initialSession && !initialProfile));
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // --- GUARDIAS DE MEMORIA ---
  const isFetchingProfile = useRef<boolean>(false);
  const lastFetchedUserId = useRef<string | null>(initialProfile?.id || null);
  const isListenerInitialized = useRef<boolean>(false);

  /**
   * logger: Sistema de depuración en entorno de desarrollo.
   */
  const logger = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [Auth-Sincro] ${message}`, data ?? '');
    }
  };

  /**
   * getProfile
   * Recupera los metadatos del curador con lógica de protección de ráfagas.
   */
  const getProfile = useCallback(async (userId: string, force: boolean = false) => {
    // Evitamos peticiones si ya tenemos el perfil cargado y no se solicita forzado.
    if ((isFetchingProfile.current || lastFetchedUserId.current === userId) && !force) {
      setIsInitialLoading(false);
      return;
    }

    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      logger(`Sincronizando Perfil: ${userId.substring(0, 8)}...`);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          logger("Perfil en creación por trigger de DB...");
          setProfile(null);
        } else {
          throw profileError;
        }
      } else {
        setProfile(profileData);
        lastFetchedUserId.current = userId;
      }
    } catch (error: any) {
      console.error("🔥 [NicePod-Auth-Critical]:", error.message);
    } finally {
      isFetchingProfile.current = false;
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, [supabase]);

  /**
   * refreshProfile: Utilidad para actualizar datos tras cambios en la cuenta.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) await getProfile(user.id, true);
  }, [user, getProfile]);

  /**
   * [AUTH LIFECYCLE]: Gestión del túnel de eventos en tiempo real.
   */
  useEffect(() => {
    let isMounted = true;

    // 1. SINCRO INICIAL: Si el servidor falló en traer el perfil pero hay sesión, reintentamos una vez.
    if (session?.user?.id && !profile && isMounted) {
      getProfile(session.user.id);
    } else if (!session) {
      setIsInitialLoading(false);
    }

    // 2. SINGLETON LISTENER: Evita duplicidad de suscripciones al canal de Auth.
    if (isListenerInitialized.current) return;
    isListenerInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        logger(`Evento de Identidad: ${event}`);

        const newUser = newSession?.user || null;
        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          // Detectamos si es un cambio real de usuario o solo un refresco de token.
          if (newUser.id !== lastFetchedUserId.current) {
            await getProfile(newUser.id);
          }

          if (event === 'SIGNED_IN') router.refresh();
        } else {
          // Limpieza absoluta en Logout.
          setProfile(null);
          lastFetchedUserId.current = null;
          setIsInitialLoading(false);
          if (event === 'SIGNED_OUT') router.refresh();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, getProfile, router, profile, session]);

  /**
   * signOut: Protocolo de desconexión y purga de caché.
   */
  const signOut = useCallback(async () => {
    logger("Cerrando frecuencia de usuario...");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;
    window.location.href = "/";
  }, [supabase]);

  /**
   * resetPassword: Flujo de recuperación de acceso.
   */
  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  // --- ESTADOS DERIVADOS MEMOIZADOS ---
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile]);
  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- CONTEXTO DE IDENTIDAD SOBERANA ---
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
    throw new Error("useAuth debe usarse dentro de un AuthProvider validado.");
  }
  return context;
}