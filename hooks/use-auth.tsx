// hooks/use-auth.tsx
// VERSIÓN: 16.0 (Global Identity Synchronizer - SSR Handshake & Realtime Auth)
// Misión: Centralizar la soberanía de la sesión y garantizar la integridad del perfil en el Frontend.

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
 * Extraemos el tipo Profile directamente del esquema generado de la base de datos.
 */
type Profile = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextType
 * Define el contrato de seguridad y los datos de identidad disponibles para toda la App.
 */
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * Este componente envuelve la aplicación en app/layout.tsx.
 * Recibe la 'session' validada desde el servidor para evitar parpadeos de identidad.
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

  // --- ESTADO DE IDENTIDAD ---
  // Inicializamos con los datos del servidor para hidratación instantánea
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession);

  // Ref para evitar ciclos infinitos en actualizaciones de perfil
  const isFetchingProfile = useRef<boolean>(false);

  /**
   * getProfile
   * Recupera los metadatos extendidos del usuario desde la tabla public.profiles.
   * Incluye datos críticos como rol, reputación y avatar.
   */
  const getProfile = useCallback(async (userId: string) => {
    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;

    try {
      console.log(`👤 [Auth] Sincronizando perfil para UID: ${userId.substring(0, 8)}...`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si el perfil no existe aún (caso de nuevo registro en proceso de trigger)
        if (error.code === 'PGRST116') {
          console.warn("[Auth] Perfil no encontrado, esperando a trigger de creación.");
        } else {
          throw error;
        }
      }

      setProfile(data);
    } catch (error: any) {
      console.error("🔥 [Auth-Profile-Error]:", error.message);
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * refreshProfile
   * Permite a componentes externos (como Ajustes) forzar la recarga de la identidad.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await getProfile(user.id);
    }
  }, [user, getProfile]);

  /**
   * [CICLO DE VIDA]: Sincronización Realtime
   * Escucha eventos de autenticación (Login, Logout, Refresh Token) y reacciona.
   */
  useEffect(() => {
    let mounted = true;

    // Si nacemos con sesión de servidor, disparamos la carga del perfil inmediatamente
    if (initialSession?.user?.id) {
      getProfile(initialSession.user.id);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log(`🔐 [Auth-Event] Tipo: ${event}`);

        // Actualizamos estados de sesión y usuario
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          // Si hay una nueva sesión (Login o Refresh), traemos el perfil
          await getProfile(newSession.user.id);

          // [MEJORA ESTRATÉGICA]: Sincronizamos Server Components
          // Esto asegura que el Dashboard (Server Side) se entere del cambio de cookie.
          if (event === 'SIGNED_IN') {
            router.refresh();
          }
        } else {
          // Limpieza total en caso de Logout
          setProfile(null);
          setIsLoading(false);
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
   * ACCIONES MAESTRAS
   */

  const signOut = useCallback(async () => {
    console.log("🛑 [Auth] Cerrando sesión y limpiando rastro digital...");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    // Redirección forzada a la Landing para seguridad total
    window.location.href = "/";
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabase]);

  // Estados derivados memorizados para evitar re-renders en cascada
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile]);
  const isAuthenticated = useMemo(() => !!user, [user]);

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
 * Punto de entrada único para consumir la identidad del usuario en NicePod.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("CRITICAL: useAuth debe ser utilizado dentro de un AuthProvider validado.");
  }
  return context;
}