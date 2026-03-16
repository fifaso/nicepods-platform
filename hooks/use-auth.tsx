// hooks/use-auth.tsx
// VERSIÓN: 21.0 (NiceCore V2.6 - Sovereign Identity & Zero-Flicker Edition)
// Misión: Orquestar la identidad atómica, el control de roles y la hidratación síncrona.
// [ESTABILIZACIÓN]: Integración total con SSR para aniquilar el flasheo de sesión.

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
 * Inicia el estado con los datos inyectados por el Root Layout (SSR), 
 * evitando el salto visual de 'Invitado' a 'Usuario'.
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
  // Singleton del cliente Supabase para evitar fugas de red.
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // --- ESTADOS DE IDENTIDAD ATÓMICA ---
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  /**
   * [LÓGICA DE CARGA V21.0]:
   * El sistema solo se considera en 'Carga' si el servidor detectó una sesión
   * pero el perfil no llegó (o viceversa). 
   * Si ambos son null (Guest) o ambos están presentes (User), isInitialLoading es false 
   * desde el milisegundo cero, matando el flickering.
   */
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(
    !!initialSession && !initialProfile
  );
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // --- GUARDIAS DE MEMORIA ---
  const isFetchingProfile = useRef<boolean>(false);
  const lastFetchedUserId = useRef<string | null>(initialProfile?.id || null);
  const isListenerInitialized = useRef<boolean>(false);

  /**
   * getProfile: Recuperación reactiva de metadatos desde PostgreSQL.
   */
  const getProfile = useCallback(async (userId: string, force: boolean = false) => {
    // Protección contra peticiones redundantes
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
        // Manejo de error de registro nuevo (perfil aún no creado por trigger SQL)
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
   * refreshProfile: Acción de actualización manual de privilegios.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) await getProfile(user.id, true);
  }, [user, getProfile]);

  /**
   * [LIFECYCLE]: Sincronización del Túnel de Eventos Realtime (Supabase Auth).
   */
  useEffect(() => {
    let isMounted = true;

    // Caso de emergencia: Sesión presente pero perfil ausente en hidratación.
    if (session?.user?.id && !profile && isMounted) {
      getProfile(session.user.id);
    } 
    // Caso: Invitado confirmado.
    else if (!session && isMounted) {
      setIsInitialLoading(false);
    }

    if (isListenerInitialized.current) return;
    isListenerInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        nicepodLog(`Frecuencia de Auth: ${event}`);

        const newUser = newSession?.user || null;
        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          if (newUser.id !== lastFetchedUserId.current) {
            await getProfile(newUser.id);
          }
          // El refresh del router asegura que los Server Components 
          // (como el Middleware) reciban la nueva cookie.
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            router.refresh();
          }
        } else {
          // Purga absoluta en desconexión.
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
   * signOut: Protocolo de desconexión física y limpieza de GPU.
   */
  const signOut = useCallback(async () => {
    nicepodLog("Desconectando Nodo Soberano...");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;
    // Forzamos recarga física para limpiar el caché del navegador y estados de memoria.
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
   * Lógica de doble validación (JWT + DB) para máxima seguridad.
   */
  const isAdmin = useMemo(() => {
    const roleFromJWT =
      user?.app_metadata?.user_role === 'admin' ||
      user?.app_metadata?.role === 'admin';

    const roleFromDB = profile?.role === 'admin';

    return roleFromJWT || roleFromDB;
  }, [profile, user]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- MEMOIZACIÓN DEL VALOR DEL CONTEXTO ---
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
 * useAuth: El Hook de Consumo Universal.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser invocado dentro de un AuthProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V21.0):
 * 1. Muerte del Pestañeo: Al alinear 'isInitialLoading' con el resultado dual 
 *    del servidor (initialSession + initialProfile), el cliente sabe si debe 
 *    mostrar el Dashboard o el Login desde el constructor.
 * 2. Estabilidad de Rango: Al priorizar los claims del JWT en 'isAdmin', 
 *    eliminamos el bloqueo en el acceso al mapa que ocurría por latencia de la DB.
 * 3. Gestión de Memoria: El uso de 'window.location.href' en el signOut es 
 *    intencional; asegura que todos los estados de React y variables de Mapbox
 *    se purguen físicamente del dispositivo del usuario.
 */