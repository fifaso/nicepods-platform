// hooks/use-auth.tsx
// VERSIÓN: 18.5 (Global Identity Synchronizer - Final Integrity Standard)
// Misión: Centralizar la soberanía de la sesión, erradicar bucles de eventos y garantizar silencio en producción.
// [ESTABILIDAD]: Resolución definitiva de redundancias de red y logs de consola.

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
 * Extraemos el esquema de perfil de la base de datos soberana de NicePod.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextType
 * Define el contrato de identidad global para el ecosistema NicePod V2.5.
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
 * Implementa protección contra bucles de eventos y sincronía Server-to-Client.
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

  // --- GUARDIAS DE MEMORIA (PREVENCIÓN DE REDUNDANCIAS) ---
  const isFetchingProfile = useRef<boolean>(false);
  const lastFetchedUserId = useRef<string | null>(null);
  const isListenerInitialized = useRef<boolean>(false);

  /**
   * logger: Sistema de depuración condicional.
   * Evita que los logs de sistema contaminen la consola de producción.
   */
  const logger = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [Auth-Protocol] ${message}`, data ?? '');
    }
  };

  /**
   * getProfile
   * Recupera los metadatos del curador (reputación, avatar, rol).
   * Implementa bloqueo por ID para evitar colisiones de red.
   */
  const getProfile = useCallback(async (userId: string, force: boolean = false) => {
    // Protección: Evitar ráfagas si ya hay una carga activa o el ID es idéntico al procesado.
    if ((isFetchingProfile.current || lastFetchedUserId.current === userId) && !force) {
      return;
    }

    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      logger(`Sincronizando ADN: ${userId.substring(0, 8)}...`);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // Manejo de delay: El trigger de creación de perfil en DB podría estar en curso.
        if (profileError.code === 'PGRST116') {
          logger("Perfil no localizado, esperando inicialización de DB.");
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
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, [supabase]);

  /**
   * refreshProfile
   * Actualización manual de la identidad tras cambios en ajustes de cuenta.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await getProfile(user.id, true);
    }
  }, [user, getProfile]);

  /**
   * [AUTH LIFECYCLE]: Orquestador de Eventos de Supabase
   * Gestiona el túnel de autenticación en tiempo real.
   */
  useEffect(() => {
    let isMounted = true;

    // 1. SINCRO INICIAL: Si el servidor ya validó la sesión (Fran), cargamos el perfil.
    if (initialSession?.user?.id && !profile && !lastFetchedUserId.current) {
      getProfile(initialSession.user.id);
    } else if (!initialSession) {
      setIsInitialLoading(false);
    }

    // 2. SINGLETON LISTENER: Garantiza una única suscripción activa.
    if (isListenerInitialized.current) {
      return;
    }
    isListenerInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        logger(`Evento detectado: ${event}`);

        const newUser = newSession?.user || null;

        // Actualizamos la verdad de sesión en el cliente.
        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          // Solo descargamos el perfil si el usuario ha cambiado o es un login explícito.
          if (newUser.id !== lastFetchedUserId.current || event === 'SIGNED_IN') {
            await getProfile(newUser.id);
          }

          // Notificamos a los Server Components para actualizar cookies.
          if (event === 'SIGNED_IN') {
            router.refresh();
          }
        } else {
          // Limpieza total del rastro digital en Logout.
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
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initialSession, getProfile, router, profile]);

  /**
   * signOut
   * Protocolo de desconexión absoluta y redirección de seguridad.
   */
  const signOut = useCallback(async () => {
    logger("Iniciando desconexión de frecuencia segura...");

    await supabase.auth.signOut();

    // Reset de seguridad de estados locales.
    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;

    // Forzamos limpieza de caché de red mediante redirección a la raíz.
    window.location.href = "/";
  }, [supabase]);

  /**
   * resetPassword
   * Gestión de recuperación de acceso.
   */
  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  // --- ESTADOS DERIVADOS (MEMOIZADOS) ---
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile]);
  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- CONTEXTO FINAL (Standard V2.5) ---
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

/**
 * useAuth
 * Punto de entrada único para el consumo de identidad en la plataforma.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("CRITICAL: useAuth debe ser invocado dentro de un AuthProvider validado.");
  }
  return context;
}