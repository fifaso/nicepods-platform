// hooks/use-auth.tsx
// VERSIÓN: 21.1 (NiceCore V2.6 - Sovereign Identity & Zero-Flicker Edition)
// Misión: Orquestar la identidad atómica, el control de roles y la hidratación síncrona.
// [ESTABILIZACIÓN]: Handshake T0 completo para aniquilar el flasheo de sesión en el Dashboard.

"use client";

import type {
  AuthError,
  Session,
  User
} from "@supabase/supabase-js";
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

// --- INFRAESTRUCTURA DE DATOS SOBERANA ---
import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { Tables } from "@/types/database.types";

/**
 * [TIPADO SOBERANO]
 * Extraemos el contrato del perfil directamente del esquema V12.6.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextType
 * Define el contrato de identidad total para la Workstation NicePod.
 */
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isInitialLoading: boolean; // El 'Shield' visual contra el flickering
  isProfileLoading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * Orquestador síncrono del Handshake Servidor-Cliente (T0).
 * 
 * [ESTRATEGIA ZERO-FLICKER]:
 * Inicializa el estado con los datos inyectados por el Root Layout (SSR), 
 * asegurando que la UI nazca con la identidad resuelta.
 */
export function AuthProvider({
  initialSession,
  initialProfile,
  children
}: {
  initialSession: Session | null;
  initialProfile: Profile | null;
  children: React.ReactNode;
}) {
  // Singleton del cliente Supabase para evitar fugas de memoria y sockets redundantes.
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // --- ESTADOS DE IDENTIDAD ATÓMICA ---
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  /**
   * [LÓGICA DE CARGA V21.1]:
   * El sistema solo se considera en 'Carga' si el servidor detectó una sesión
   * pero el perfil no llegó (caso de registro nuevo pendiente de trigger SQL).
   * 
   * [ZERO-FLICKER]: Si el servidor envió ambos (o ambos son null), isInitialLoading es FALSE
   * desde el constructor, evitando que el Dashboard parpadee durante la hidratación.
   */
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(
    !!initialSession && !initialProfile
  );
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // --- GUARDIAS DE CICLO DE VIDA ---
  const isFetchingProfile = useRef<boolean>(false);
  const lastFetchedUserId = useRef<string | null>(initialProfile?.id || null);
  const isListenerInitialized = useRef<boolean>(false);

  /**
   * getProfile: Recuperación reactiva de metadatos desde PostgreSQL.
   * [RESILIENCIA]: Gestiona el error PGRST116 (registro no encontrado) para 
   * dar tiempo a que la base de datos materialice el perfil tras un registro.
   */
  const getProfile = useCallback(async (userId: string, force: boolean = false) => {
    if ((isFetchingProfile.current || lastFetchedUserId.current === userId) && !force) {
      setIsInitialLoading(false);
      return;
    }

    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      nicepodLog(`Sincronizando Identidad para Nodo: ${userId.substring(0, 8)}`);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          nicepodLog("Perfil en proceso de forja SQL. Reintentando...");
          setProfile(null);
        } else {
          throw profileError;
        }
      } else {
        setProfile(profileData);
        lastFetchedUserId.current = userId;
      }
    } catch (error: any) {
      console.error("🔥 [Auth-Fatal] Error en el Handshake:", error.message);
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, [supabase]);

  /**
   * refreshProfile: Acción manual para refrescar privilegios (ej. tras suscripción).
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) await getProfile(user.id, true);
  }, [user, getProfile]);

  /**
   * [LIFECYCLE]: Gestión del Túnel de Eventos Realtime de Supabase Auth.
   */
  useEffect(() => {
    let isMounted = true;

    // Caso de emergencia: Sesión presente pero perfil ausente en hidratación SSR.
    if (session?.user?.id && !profile && isMounted) {
      getProfile(session.user.id);
    }
    // Caso: Invitado confirmado. Liberamos el cargador global.
    else if (!session && isMounted) {
      setIsInitialLoading(false);
    }

    // Singleton Listener: Evitamos duplicar la escucha de eventos de red.
    if (isListenerInitialized.current) return;
    isListenerInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        nicepodLog(`Frecuencia de Auth detectada: ${event}`);

        const newUser = newSession?.user || null;
        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          // Si el usuario cambia de ID, forzamos la descarga del perfil.
          if (newUser.id !== lastFetchedUserId.current) {
            await getProfile(newUser.id);
          }
          // SIGNED_IN o TOKEN_REFRESHED: Forzamos el refresco del router para 
          // que el Middleware y los Server Components se sigan sincronizados.
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            router.refresh();
          }
        } else {
          // Purga absoluta de memoria en desconexión.
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
   * signOut: Protocolo de desconexión física y purga de GPU.
   * [MANDATO]: Limpieza total de estados residuales mediante recarga física.
   */
  const signOut = useCallback(async () => {
    nicepodLog("Desconectando Nodo Soberano...");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;
    // Forzamos redirección física para limpiar la memoria WebGL y Service Workers.
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

  /**
   * [SOBERANÍA DE RANGO]: isAdmin
   * Lógica de doble validación (JWT + DB) para máxima seguridad y rapidez.
   */
  const isAdmin = useMemo(() => {
    // 1. Verificamos el rol inyectado en el JWT (Prioridad máxima para enrutamiento)
    const roleFromJWT =
      user?.app_metadata?.user_role === 'admin' ||
      user?.app_metadata?.role === 'admin';

    // 2. Verificamos el rol en la base de datos (Consistencia histórica)
    const roleFromDB = profile?.role === 'admin';

    return roleFromJWT || roleFromDB;
  }, [profile, user]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- MEMOIZACIÓN DEL VALOR DEL CONTEXTO (OPTIMIZACIÓN DE RENDERIZADO) ---
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
    session, user, profile, isAdmin, isAuthenticated,
    isInitialLoading, isProfileLoading, signOut,
    resetPassword, refreshProfile, supabase
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth: El Hook de Consumo Maestro.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser invocado dentro de un AuthProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V21.1):
 * 1. Aniquilación del Flicker: Al alinear 'isInitialLoading' con el resultado dual 
 *    del servidor (initialSession + initialProfile), el Dashboard ya no parpadea 
 *    al refrescar la página. El usuario nace con su nombre y avatar cargados.
 * 2. Estabilidad de Rango: Al priorizar los claims del JWT en 'isAdmin', 
 *    el acceso al Radar de Madrid es instantáneo, eliminando el error de 
 *    redirección 307 que sufría el Administrador.
 * 3. Sincronía del Router: 'router.refresh()' asegura que ante cualquier cambio 
 *    de sesión, las cookies y el Middleware vuelvan a alinearse al metal.
 */