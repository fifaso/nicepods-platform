/**
 * ARCHIVO: hooks/use-auth.tsx
 * VERSIÓN: 5.1 (NicePod Sovereign Auth - Universal Sync Bridge Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la identidad atómica y la autoridad administrativa soberana, 
 * gestionando el Handshake síncrono entre el servidor y el cliente.
 * [REFORMA V5.1]: Implementación del 'Universal Sync Bridge'. Se proveen alias 
 * de legado para asegurar la compatibilidad con componentes no migrados, 
 * resolviendo 39 errores de tipos de forma transversal. Purificación total 
 * de la Zero Abbreviations Policy (ZAP) y sellado del Build Shield (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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
 * Extraemos el contrato del perfil directamente del esquema industrial.
 */
type ProfileEntry = Tables<'profiles'>;

/**
 * INTERFAZ: AuthContextProperties
 * Define el contrato de identidad total para la Workstation NicePod.
 */
interface AuthContextProperties {
  // --- NÚCLEO SOBERANO (INDUSTRIAL STANDARD) ---
  authenticatedUser: User | null;
  administratorProfile: ProfileEntry | null;
  authenticationSession: Session | null;
  isAdministratorAuthority: boolean;
  isUserAuthenticated: boolean;
  isInitialHandshakeLoading: boolean;
  isProfileSynchronizationLoading: boolean;
  onAuthenticationSignOutAction: () => Promise<void>;
  onPasswordResetAction: (emailAddress: string) => Promise<{ error: AuthError | null }>;
  refreshAdministratorProfile: () => Promise<void>;
  supabaseSovereignClient: ReturnType<typeof createClient>;

  // --- I. PUENTE DE COMPATIBILIDAD (LEGACY ALIASES) ---
  // Misión: Satisfacer los 39 errores TS2339 en los 24 archivos dependientes.
  // Estos alias se mantendrán hasta que la migración ZAP sea total.
  user: User | null;
  profile: ProfileEntry | null;
  session: Session | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  isProfileLoading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (emailAddress: string) => Promise<{ error: AuthError | null }>;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextProperties | undefined>(undefined);

/**
 * PROVIDER: AuthProvider
 * Orquestador síncrono del Handshake Servidor-Cliente (Fase T0).
 */
export function AuthProvider({
  initialAuthenticationSession,
  initialAdministratorProfile,
  children
}: {
  initialAuthenticationSession: Session | null;
  initialAdministratorProfile: ProfileEntry | null;
  children: React.ReactNode;
}) {
  // Singleton del cliente Supabase para evitar sockets redundantes (Pilar 2).
  const supabaseSovereignClient = useMemo(() => createClient(), []);
  const navigationRouter = useRouter();

  // --- II. ESTADOS DE IDENTIDAD ATÓMICA (ZAP COMPLIANT) ---
  const [authenticationSession, setAuthenticationSession] = useState<Session | null>(initialAuthenticationSession);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(initialAuthenticationSession?.user || null);
  const [administratorProfile, setAdministratorProfile] = useState<ProfileEntry | null>(initialAdministratorProfile);

  const [isInitialHandshakeLoading, setIsInitialHandshakeLoading] = useState<boolean>(
    !!initialAuthenticationSession && !initialAdministratorProfile
  );
  const [isProfileSynchronizationLoading, setIsProfileSynchronizationLoading] = useState<boolean>(false);

  // --- III. GUARDIAS DE CICLO DE VIDA (MUTABLE REFERENCES) ---
  const isFetchingProfileProcessActive = useRef<boolean>(false);
  const lastSynchronizedUserIdentification = useRef<string | null>(initialAdministratorProfile?.id || null);
  const isAuthStateListenerInitialized = useRef<boolean>(false);

  /**
   * synchronizeProfileFromMetalAction: 
   * Recuperación reactiva de metadatos desde el Metal (PostgreSQL).
   */
  const synchronizeProfileFromMetalAction = useCallback(async (userIdentification: string, forceRefresh: boolean = false) => {
    if ((isFetchingProfileProcessActive.current || lastSynchronizedUserIdentification.current === userIdentification) && !forceRefresh) {
      setIsInitialHandshakeLoading(false);
      return;
    }

    isFetchingProfileProcessActive.current = true;
    setIsProfileSynchronizationLoading(true);

    try {
      nicepodLog(`🛰️ [Auth] Sincronizando Perfil para Nodo: ${userIdentification.substring(0, 8)}`);

      const { data: profileRecord, error: databaseOperationException } = await supabaseSovereignClient
        .from('profiles')
        .select('*')
        .eq('id', userIdentification)
        .single();

      if (databaseOperationException) {
        if (databaseOperationException.code === 'PGRST116') {
          setAdministratorProfile(null);
        } else {
          throw databaseOperationException;
        }
      } else {
        setAdministratorProfile(profileRecord);
        lastSynchronizedUserIdentification.current = userIdentification;
      }
    } catch (hardwareException: unknown) {
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : String(hardwareException);
      console.error("🔥 [Auth-Fatal] Error en Handshake de Perfil:", exceptionMessage);
      setAdministratorProfile(null);
    } finally {
      isFetchingProfileProcessActive.current = false;
      setIsProfileSynchronizationLoading(false);
      setIsInitialHandshakeLoading(false);
    }
  }, [supabaseSovereignClient]);

  const refreshAdministratorProfile = useCallback(async () => {
    if (authenticatedUser?.id) {
      await synchronizeProfileFromMetalAction(authenticatedUser.id, true);
    }
  }, [authenticatedUser, synchronizeProfileFromMetalAction]);

  /**
   * [LIFECYCLE]: Gestión del Túnel de Eventos de Autenticación.
   */
  useEffect(() => {
    let isProviderMounted = true;

    if (authenticationSession?.user?.id && !administratorProfile && isProviderMounted) {
      synchronizeProfileFromMetalAction(authenticationSession.user.id);
    } else if (!authenticationSession && isProviderMounted) {
      setIsInitialHandshakeLoading(false);
    }

    if (isAuthStateListenerInitialized.current) return;
    isAuthStateListenerInitialized.current = true;

    const { data: { subscription: authEventSubscription } } = supabaseSovereignClient.auth.onAuthStateChange(
      async (authEventType, freshAuthenticationSession) => {
        if (!isProviderMounted) return;

        nicepodLog(`🔐 [Auth] Cambio de frecuencia detectado: ${authEventType}`);

        const freshUser = freshAuthenticationSession?.user || null;
        setAuthenticationSession(freshAuthenticationSession);
        setAuthenticatedUser(freshUser);

        if (freshUser) {
          if (freshUser.id !== lastSynchronizedUserIdentification.current) {
            await synchronizeProfileFromMetalAction(freshUser.id);
          }
          if (authEventType === 'SIGNED_IN' || authEventType === 'TOKEN_REFRESHED') {
            navigationRouter.refresh();
          }
        } else {
          setAdministratorProfile(null);
          lastSynchronizedUserIdentification.current = null;
          setIsInitialHandshakeLoading(false);
          if (authEventType === 'SIGNED_OUT') {
            navigationRouter.refresh();
          }
        }
      }
    );

    return () => {
      isProviderMounted = false;
      authEventSubscription.unsubscribe();
    };
  }, [supabaseSovereignClient, synchronizeProfileFromMetalAction, navigationRouter, administratorProfile, authenticationSession]);

  /**
   * onAuthenticationSignOutAction: 
   * Protocolo de desconexión física y purga de recursos.
   */
  const onAuthenticationSignOutAction = useCallback(async () => {
    nicepodLog("🔌 [Auth] Desconectando Nodo Soberano...");
    await supabaseSovereignClient.auth.signOut();
    setAuthenticationSession(null);
    setAuthenticatedUser(null);
    setAdministratorProfile(null);
    lastSynchronizedUserIdentification.current = null;
    window.location.href = "/";
  }, [supabaseSovereignClient]);

  /**
   * onPasswordResetAction: Flujo de recuperación de acceso.
   */
  const onPasswordResetAction = useCallback(async (emailAddress: string) => {
    return await supabaseSovereignClient.auth.resetPasswordForEmail(emailAddress, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
  }, [supabaseSovereignClient]);

  const isAdministratorAuthority = useMemo(() => {
    const roleFromWebToken =
      authenticatedUser?.app_metadata?.user_role === 'admin' ||
      authenticatedUser?.app_metadata?.role === 'admin';
    const roleFromDatabase = administratorProfile?.role === 'admin';
    return roleFromWebToken || roleFromDatabase;
  }, [administratorProfile, authenticatedUser]);

  const isUserAuthenticated = useMemo(() => !!authenticatedUser, [authenticatedUser]);

  /**
   * [MEMOIZACIÓN]: INTEGRACIÓN DEL PUENTE UNIVERSAL
   * Misión: Retornar un objeto que satisfaga tanto el nuevo estándar como el código de legado.
   */
  const authContextValue: AuthContextProperties = useMemo(() => ({
    // --- MIEMBROS SOBERANOS (NUEVO ESTÁNDAR) ---
    authenticatedUser,
    administratorProfile,
    authenticationSession,
    isAdministratorAuthority,
    isUserAuthenticated,
    isInitialHandshakeLoading,
    isProfileSynchronizationLoading,
    onAuthenticationSignOutAction,
    onPasswordResetAction,
    refreshAdministratorProfile,
    supabaseSovereignClient,

    // --- II. MAPEADORES DE COMPATIBILIDAD (LEGACY BRIDGE) ---
    user: authenticatedUser,
    profile: administratorProfile,
    session: authenticationSession,
    isAuthenticated: isUserAuthenticated,
    isInitialLoading: isInitialHandshakeLoading,
    isProfileLoading: isProfileSynchronizationLoading,
    signOut: onAuthenticationSignOutAction,
    resetPassword: onPasswordResetAction,
    supabase: supabaseSovereignClient
  }), [
    authenticatedUser, administratorProfile, authenticationSession,
    isAdministratorAuthority, isUserAuthenticated, isInitialHandshakeLoading,
    isProfileSynchronizationLoading, onAuthenticationSignOutAction,
    onPasswordResetAction, refreshAdministratorProfile, supabaseSovereignClient
  ]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth: El punto de consumo único para la autoridad administrativa.
 */
export function useAuth() {
  const contextReference = useContext(AuthContext);
  if (contextReference === undefined) {
    throw new Error("CRITICAL_ERROR: 'useAuth' invocado fuera de un AuthProvider nominal.");
  }
  return contextReference;
}