// hooks/use-auth.tsx
// VERSIÓN: 18.0 (Sovereign Identity Protocol - Loop Protection Edition)
// Misión: Centralizar la soberanía de identidad, erradicar bucles de eventos y garantizar sincronía absoluta.

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
 * Define el contrato de identidad global para NicePod V2.5.
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
  // Inicialización única del cliente Supabase
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
    // Evitamos re-peticiones si ya estamos buscando o si el ID es el mismo (y no es forzado)
    if ((isFetchingProfile.current || lastFetchedUserId.current === userId) && !force) {
      return;
    }

    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      console.log(`👤 [Auth-Protocol] Sincronizando Perfil: ${userId.substring(0, 8)}...`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Manejo de delay en triggers de base de datos para nuevos usuarios
        if (error.code === 'PGRST116') {
          console.warn("⚠️ [Auth] Perfil en proceso de creación en la DB.");
          setProfile(null);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        lastFetchedUserId.current = userId;
      }
    } catch (error: any) {
      console.error("🔥 [Auth-Critical-Error]:", error.message);
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, [supabase]);

  /**
   * refreshProfile
   * Permite actualizar el perfil tras cambios en ajustes sin cerrar sesión.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await getProfile(user.id, true); // Forzamos la recarga
    }
  }, [user, getProfile]);

  /**
   * [AUTH LIFECYCLE]: Orquestador de Eventos
   * Gestiona la sintonía entre eventos de Supabase y el estado de la aplicación.
   */
  useEffect(() => {
    let mounted = true;

    // 1. HIDRATACIÓN INICIAL
    // Si nacemos con sesión de servidor, disparamos la carga del perfil
    if (initialSession?.user?.id && !profile) {
      getProfile(initialSession.user.id);
    } else if (!initialSession) {
      setIsInitialLoading(false);
    }

    // 2. PROTECCIÓN DE ESCUCHA (Singleton Listener)
    // Evita que useEffect registre múltiples suscripciones ante cambios de props.
    if (isListenerInitialized.current) return;
    isListenerInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log(`🔐 [Auth-Event] Detección: ${event}`);

        const newUser = newSession?.user || null;

        // Actualizamos sesión y usuario solo si hay cambios reales
        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          // Disparamos la carga del perfil solo si es un usuario distinto al anterior
          // o si el evento es una señal de entrada explícita.
          if (newUser.id !== lastFetchedUserId.current || event === 'SIGNED_IN') {
            await getProfile(newUser.id);
          }

          // Sincronizamos las cookies del lado del servidor para Next.js
          if (event === 'SIGNED_IN') {
            router.refresh();
          }
        } else {
          // Limpieza total ante cierre de sesión
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
      // Nota: No limpiamos isListenerInitialized.current aquí porque queremos que
      // la suscripción persista durante la vida del componente raíz.
      subscription.unsubscribe();
    };
  }, [supabase, initialSession, getProfile, router, profile]);

  /**
   * ACCIONES MAESTRAS
   */

  const signOut = useCallback(async () => {
    console.log("🛑 [Auth] Ejecutando desconexión de frecuencia...");
    await supabase.auth.signOut();

    // Reset manual preventivo
    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;

    // Forzamos redirección y limpieza de caché de red
    window.location.href = "/";
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  // --- ESTADOS CALCULADOS (MEMOIZADOS) ---
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile]);
  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- CONSTRUCCIÓN DEL CONTEXTO DE IDENTIDAD ---
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
 * Punto de entrada único para consumir la identidad soberana en NicePod.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("CRITICAL: useAuth debe ser invocado dentro de un AuthProvider validado.");
  }
  return context;
}