// hooks/use-auth.tsx
// VERSIÓN: 17.0 (Global Identity Synchronizer - SSR Handshake & Precision Lifecycle)
// Misión: Centralizar la soberanía de la sesión, eliminar parpadeos de identidad y proveer estados de carga granulares.

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
 * Extraemos el esquema de perfil directamente de las definiciones de Supabase.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextType
 * Define el contrato de seguridad y los datos de identidad disponibles para toda la plataforma.
 */
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  /**
   * isInitialLoading: True solo durante la primera reconciliación de la sesión.
   */
  isInitialLoading: boolean;
  /**
   * isProfileLoading: True mientras se recuperan los metadatos extendidos de la DB.
   * Vital para implementar el Auth-Skeleton State en la navegación.
   */
  isProfileLoading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * Orquestador de la identidad del usuario. 
 * Recibe 'session' desde el servidor (RootLayout) para eliminar el parpadeo visual inicial.
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

  // --- ESTADOS DE CARGA GRANULARES ---
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!initialSession);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(!!initialSession?.user);

  // Referencia para evitar colisiones en ráfagas de red
  const isFetchingProfile = useRef<boolean>(false);

  /**
   * getProfile
   * Recupera los metadatos del curador (reputación, rol, avatar) de la tabla pública.
   */
  const getProfile = useCallback(async (userId: string) => {
    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      console.log(`👤 [Auth] Sincronizando ADN de usuario: ${userId.substring(0, 8)}...`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Caso específico: El trigger de DB aún no ha creado el perfil (nuevo usuario)
        if (error.code === 'PGRST116') {
          console.warn("[Auth] Perfil en proceso de creación.");
        } else {
          throw error;
        }
      }

      setProfile(data);
    } catch (error: any) {
      console.error("🔥 [Auth-Profile-Sync-Fail]:", error.message);
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, [supabase]);

  /**
   * refreshProfile
   * Expone una vía manual para actualizar la identidad tras cambios en ajustes.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await getProfile(user.id);
    }
  }, [user, getProfile]);

  /**
   * [AUTH LIFECYCLE]: Escucha activa de eventos de sesión
   * Detecta cambios de token, logins y logouts en todas las pestañas abiertas.
   */
  useEffect(() => {
    let mounted = true;

    // Carga inmediata de perfil si el servidor ya validó la sesión
    if (initialSession?.user?.id) {
      getProfile(initialSession.user.id);
    } else if (!initialSession) {
      // Si no hay sesión inicial, terminamos la carga inicial de inmediato
      setIsInitialLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log(`🔐 [Auth-Protocol] Evento detectado: ${event}`);

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          // Re-sincronizamos el perfil ante cualquier cambio de sesión activa
          await getProfile(newSession.user.id);

          // Si es un inicio de sesión, refrescamos el router para actualizar Server Components
          if (event === 'SIGNED_IN') {
            router.refresh();
          }
        } else {
          // Limpieza atómica de estados
          setProfile(null);
          setIsProfileLoading(false);
          setIsInitialLoading(false);

          // Si es un cierre de sesión, notificamos a los Server Components
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
  }, [supabase, initialSession, getProfile, router]);

  /**
   * ACCIONES DE SOBERANÍA
   */

  const signOut = useCallback(async () => {
    console.log("🛑 [Auth] Ejecutando desconexión segura...");
    await supabase.auth.signOut();

    // Limpieza de estados locales
    setSession(null);
    setUser(null);
    setProfile(null);

    // Redirección forzada a la Landing Page para asegurar limpieza de caché de red
    window.location.href = "/";
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  // --- DERIVACIÓN DE ESTADOS MEMOIZADOS ---
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile]);
  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- CONSTRUCCIÓN DEL CONTEXTO FINAL ---
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
 * Punto de entrada para consumir la identidad del usuario en NicePod.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("CRITICAL: useAuth debe ser invocado dentro de un AuthProvider funcional.");
  }
  return context;
}