// hooks/use-auth.tsx
// VERSIÓN: 19.3

"use client";

import { 
  createContext, 
  useCallback, 
  useContext, 
  useEffect, 
  useMemo, 
  useRef, 
  useState 
} from "react";
import { useRouter } from "next/navigation";
import type { 
  AuthError, 
  Session, 
  User 
} from "@supabase/supabase-js";

// --- INFRAESTRUCTURA DE DATOS ---
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";

/**
 * [TIPADO SOBERANO]
 * Extraemos el contrato del perfil directamente de la base de datos de NicePod.
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
  isInitialLoading: boolean; // Controla la visibilidad del 'Splash Screen' global
  isProfileLoading: boolean; // Controla actualizaciones parciales del perfil
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * El Gran Orquestador de la transición Servidor-Cliente.
 * 
 * [ESTRATEGIA ZERO-FLICKER]:
 * Recibe 'initialSession' e 'initialProfile' desde el servidor (SSR) para 
 * que el cliente nazca con la identidad ya resuelta en el primer frame.
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
  // Instanciamos el cliente único (Singleton) de NicePod
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // --- ESTADOS DE IDENTIDAD ATÓMICA ---
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  /**
   * [ESTADO CRÍTICO]: isInitialLoading
   * Se inicializa en 'true' solo si el servidor no pudo entregar una sesión previa.
   */
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!initialSession);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // --- GUARDIAS DE MEMORIA Y CICLO DE VIDA ---
  const isFetchingProfile = useRef<boolean>(false);
  const lastFetchedUserId = useRef<string | null>(initialProfile?.id || null);
  const isListenerInitialized = useRef<boolean>(false);

  /**
   * logger: Telemetría técnica de identidad.
   */
  const logger = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [Auth-Sincro] ${message}`, data ?? '');
    }
  };

  /**
   * getProfile: Recuperación de metadatos soberanos desde PostgreSQL.
   * 
   * [PROTOCOLO DE SEGURIDAD]:
   * Incluye un bloque 'finally' de liberación absoluta para garantizar 
   * que la UI nunca se bloquee en una pantalla negra (Safety Escape).
   */
  const getProfile = useCallback(async (userId: string, force: boolean = false) => {
    if ((isFetchingProfile.current || lastFetchedUserId.current === userId) && !force) {
      setIsInitialLoading(false);
      return;
    }

    isFetchingProfile.current = true;
    setIsProfileLoading(true);

    try {
      logger(`Sincronizando Bóveda para Nodo: ${userId.substring(0, 8)}...`);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // PGRST116: El perfil aún no ha sido creado por el trigger de Auth.
        if (profileError.code === 'PGRST116') {
          logger("Perfil en fase de creación. Sincronía en espera.");
          setProfile(null);
        } else {
          throw profileError;
        }
      } else {
        setProfile(profileData);
        lastFetchedUserId.current = userId;
      }
    } catch (error: any) {
      console.error("🔥 [Auth-Fatal] Error al recuperar perfil:", error.message);
      setProfile(null);
    } finally {
      // [LIBERACIÓN SUPREMA]: Garantizamos que el cargador siempre se apague.
      isFetchingProfile.current = false;
      setIsProfileLoading(false);
      setIsInitialLoading(false);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await getProfile(user.id, true);
  }, [user, getProfile]);

  /**
   * [LIFECYCLE]: Gestión del Túnel de Eventos Realtime de Auth.
   */
  useEffect(() => {
    let isMounted = true;

    // Sincronía Inicial: Si el servidor falló pero hay sesión, reintentamos una vez.
    if (session?.user?.id && !profile && isMounted) {
      getProfile(session.user.id);
    } else if (!session && isMounted) {
      setIsInitialLoading(false);
    }

    // Singleton Listener: Previene duplicidad de suscripciones.
    if (isListenerInitialized.current) return;
    isListenerInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        logger(`Evento de Frecuencia: ${event}`);

        const newUser = newSession?.user || null;
        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          // Si el ID de usuario cambió realmente, disparamos el fetch del perfil.
          if (newUser.id !== lastFetchedUserId.current) {
            await getProfile(newUser.id);
          }
          // En Login exitoso, refrescamos el router para actualizar Server Components.
          if (event === 'SIGNED_IN') router.refresh();
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
   * signOut: Protocolo de desconexión soberana y purga de caché.
   */
  const signOut = useCallback(async () => {
    logger("Cerrando frecuencia de usuario...");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    lastFetchedUserId.current = null;
    // Redirección física para limpiar estados residuales de memoria.
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
   * 
   * [LÓGICA REDUNDANTE V19.3]:
   * Para evitar el bloqueo en el Middleware, verificamos el rol en dos capas:
   * 1. Metadata del JWT (app_metadata): Lo que lee el Middleware.
   * 2. Tabla Profiles (DB): La fuente de verdad histórica.
   */
  const isAdmin = useMemo(() => {
    const roleFromMetadata = 
      user?.app_metadata?.user_role === 'admin' || 
      user?.app_metadata?.role === 'admin';
      
    const roleFromProfile = profile?.role === 'admin';
    
    return roleFromMetadata || roleFromProfile;
  }, [profile, user]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // --- CONTEXTO DE IDENTIDAD UNIFICADO ---
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
 * useAuth: Hook de consumo para la Workstation.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider validado.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (POST-AUDITORÍA):
 * 1. Resolución de Bloqueo GEO: La redundancia en 'isAdmin' asegura que si el 
 *    Administrador eleva su rango vía SQL, el cliente reconozca el cambio 
 *    incluso antes de que el JWT se refresque, sincronizando la UI con el Middleware.
 * 2. Protección de Hidratación: Al inicializar estados con datos SSR, el 
 *    pestañeo visual de 'Invitado' a 'Administrador' es de 0ms.
 * 3. Robusto ante Fallos: La cláusula 'setIsInitialLoading(false)' en el finally 
 *    de getProfile es el seguro de vida contra pantallas negras en conexiones lentas.
 */