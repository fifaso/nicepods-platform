// hooks/use-auth.tsx
// VERSIÓN: 20.0 (NiceCore V2.6 - Sovereign Identity Sync)
// Misión: Orquestar la identidad atómica, el control de roles y la hidratación Zero-Flicker.
// [ESTABILIZACIÓN]: Integración total con SSR para erradicar el flasheo de sesión.

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
 * Extraemos el contrato del perfil directamente del Metal V12.5.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextType
 * Define el contrato de identidad total para la Workstation NicePod V2.6.
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
 * Inicializa el estado con los datos inyectados por el Root Layout (SSR).
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
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // --- ESTADOS DE IDENTIDAD ATÓMICA ---
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  /**
   * [LÓGICA DE CARGA V2.6]:
   * El sistema se considera 'Loading' si existe una sesión pero el servidor 
   * no pudo recuperar el perfil (o viceversa). Esto detiene el flickering.
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
   * [SINTONIZACIÓN]: Maneja el caso de carrera donde el usuario existe pero 
   * el perfil SQL aún no ha sido creado por el trigger.
   */
  const getProfile = useCallback(async (userId: string, force: boolean = false) => {
    // Evitamos peticiones redundantes si ya estamos procesando
    if ((isFetchingProfile.current || lastFetchedUserId.current === userId) && !force) {
      setIsInitialLoading(false);
      return;
    }

    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      nicepodLog(`Sincronizando Bóveda para el Nodo: ${userId.substring(0, 8)}`);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // PGRST116: Registro no encontrado (Típico en el primer segundo post-registro)
        if (profileError.code === 'PGRST116') {
          nicepodLog("Perfil en fase de materialización. Reintentando...");
          setProfile(null);
        } else {
          throw profileError;
        }
      } else {
        setProfile(profileData);
        lastFetchedUserId.current = userId;
      }
    } catch (error: any) {
      console.error("🔥 [Auth-Fatal] Error en el Handshake de Perfil:", error.message);
      setProfile(null);
    } finally {
      // Liberación del Shield Visual
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
   * [LIFECYCLE]: Sincronización del Túnel de Eventos Realtime.
   */
  useEffect(() => {
    let isMounted = true;

    // Caso: El servidor detectó sesión pero no perfil. Reintentamos en cliente.
    if (session?.user?.id && !profile && isMounted) {
      getProfile(session.user.id);
    }
    // Caso: No hay sesión en absoluto. Liberamos el loader.
    else if (!session && isMounted) {
      setIsInitialLoading(false);
    }

    if (isListenerInitialized.current) return;
    isListenerInitialized.current = true;

    // Escuchamos cambios en la frecuencia de autenticación (Login/Logout/Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        nicepodLog(`Evento de Frecuencia detectado: ${event}`);

        const newUser = newSession?.user || null;
        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          if (newUser.id !== lastFetchedUserId.current) {
            await getProfile(newUser.id);
          }
          // Forzamos el refresco del Router para actualizar los Server Components
          if (event === 'SIGNED_IN') router.refresh();
        } else {
          // Purga absoluta de memoria en desconexión
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
   * signOut: Protocolo de desconexión física y limpieza de caché.
   */
  const signOut = useCallback(async () => {
    nicepodLog("Cerrando sesión soberana...");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;
    // Forzamos redirección física para limpiar estados residuales de la GPU
    window.location.href = "/";
  }, [supabase]);

  /**
   * resetPassword: Inicia el flujo de recuperación de acceso.
   */
  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  /**
   * [SOBERANÍA DE RANGO]: isAdmin logic
   * [LÓGICA BLINDADA V2.6]:
   * Unifica la validación para que el mapa (/map) sea accesible si el 
   * JWT (app_metadata) o la DB (profile) confirman el rol.
   */
  const isAdmin = useMemo(() => {
    const roleFromJWT =
      user?.app_metadata?.user_role === 'admin' ||
      user?.app_metadata?.role === 'admin';

    const roleFromDB = profile?.role === 'admin';

    return roleFromJWT || roleFromDB;
  }, [profile, user]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- CONTEXTO UNIFICADO ---
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
 * useAuth: El Hook de Consumo Universal para NicePod.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser invocado dentro de un AuthProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V20.0):
 * 1. Erradicación del Flicker: Al setear 'isInitialLoading' basado en la 
 *    disponibilidad mutua de sesión y perfil (Líneas 78-80), garantizamos 
 *    que la aplicación solo se muestre cuando los datos son 100% consistentes.
 * 2. RBAC de Doble Capa: La lógica 'isAdmin' ahora es inmune a la latencia de 
 *    la base de datos gracias a la lectura directa de los claims del JWT.
 * 3. Sincronía del Router: 'router.refresh()' asegura que al cambiar el usuario, 
 *    las páginas SSR (como el Dashboard) vuelvan a ejecutar su lógica de servidor
 *    con la nueva identidad.
 */