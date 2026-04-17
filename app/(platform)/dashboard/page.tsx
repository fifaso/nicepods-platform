/**
 * ARCHIVO: app/(platform)/dashboard/page.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Cosecha de inteligencia blindada y orquestación de datos en el servidor con trazabilidad industrial.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { Tables } from "@/types/database.types";
import { nicepodLog } from "@/lib/utils";

/**
 * DashboardPage: El orquestador de datos de alto nivel en el servidor.
 * Misión: Ejecutar el Handshake T0 y la cosecha de capital intelectual previa.
 */
export default async function DashboardPage() {
  // 1. INSTANCIACIÓN DEL PUENTE DE RED SOBERANO (SUPABASE SERVER)
  const supabaseSovereignClient = createClient();

  /**
   * 2. HANDSHAKE DE IDENTIDAD T0 (SERVER SIDE AUTH)
   * Validamos la autoridad del Voyager directamente en el metal del servidor.
   */
  const { 
    data: { user: authenticatedUser }, 
    error: authenticationHardwareException 
  } = await supabaseSovereignClient.auth.getUser();

  // Si la identidad es nula o el hardware de red falla, expulsión inmediata por seguridad.
  if (authenticationHardwareException || !authenticatedUser) {
    redirect("/login");
  }

  const authenticatedUserIdentification = authenticatedUser.id;

  nicepodLog(`🛰️ [Dashboard] Iniciando Handshake T0 para: ${authenticatedUserIdentification.substring(0, 8)}`);

  try {
    /**
     * 3. COSECHA PARALELA DE INTELIGENCIA (THE FAN-OUT PIPELINE)
     * Misión: Concurrencia de consultas para minimizar el Time To First Byte (TTFB).
     */
    const [
      discoveryFeedNetworkResponse, 
      userProfileDatabaseResponse, 
      resonanceMetricsDatabaseResponse
    ] = await Promise.all([
      // A. Cosecha del Feed semántico adaptativo
      supabaseSovereignClient.rpc('get_user_discovery_feed', { 
        user_identification_parameter: authenticatedUserIdentification 
      }),
      // B. Cosecha del perfil de autoridad
      supabaseSovereignClient.from('profiles').select('*').eq('id', authenticatedUserIdentification).maybeSingle(),
      // C. Cosecha de métricas de resonancia geodésica
      supabaseSovereignClient.from('user_resonance_profiles').select('*').eq('user_id', authenticatedUserIdentification).maybeSingle()
    ]);

    /**
     * 4. BARRERA DE PROTECCIÓN Y SANEAMIENTO (DATA HYGIENE)
     */

    // A. Saneamiento del Feed de Inteligencia [RESOLUCIÓN TS2322]
    const rawIntelligenceFeedData = discoveryFeedNetworkResponse.data || { epicenter: [], semantic_connections: [] };
    
    const initialIntelligenceFeedCollection = {
      epicenterPodcastsCollection: Array.isArray(rawIntelligenceFeedData.epicenter) 
        ? rawIntelligenceFeedData.epicenter 
        : [],
      semanticConnectionsCollection: Array.isArray(rawIntelligenceFeedData.semantic_connections) 
        ? rawIntelligenceFeedData.semantic_connections 
        : []
    };

    // B. Saneamiento del Perfil de Autoridad [BUILD SHIELD SOVEREIGNTY]
    /** 
     * initialAdministratorProfile: Se garantiza el tipado mediante Tables<'profiles'>
     * evitando el uso de 'any' durante el despacho hacia el Cristal.
     */
    const initialAdministratorProfile: Tables<'profiles'> = userProfileDatabaseResponse.data || {
      id: authenticatedUserIdentification,
      full_name: authenticatedUser.user_metadata?.full_name || "Voyager NicePod",
      username: authenticatedUser.user_metadata?.user_name || "curador_identidad",
      role: (authenticatedUser.app_metadata?.user_role as string) || 'user',
      avatar_url: authenticatedUser.user_metadata?.avatar_url || null,
      bio: null,
      bio_short: null,
      website_url: null,
      reputation_score: 0,
      active_creation_jobs: 0,
      followers_count: 0,
      following_count: 0,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // C. Saneamiento de Resonancia Geodésica
    const initialResonanceMetrics = resonanceMetricsDatabaseResponse.data || null;

    /**
     * 5. DETERMINACIÓN DE AUTORIDAD (RBAC PROTOCOL)
     * Verificación de rango administrativo mediante validación de tokens y base de datos.
     */
    const isAdministratorAuthorityStatus =
      authenticatedUser.app_metadata?.user_role === 'admin' ||
      authenticatedUser.app_metadata?.role === 'admin' ||
      (userProfileDatabaseResponse.data?.role === 'admin');

    /**
     * 6. DESPACHO AL CHASIS CLIENTE (HANDOVER)
     * [RESOLUCIÓN FINAL TS2322]: Alineación absoluta de descriptores nominales.
     */
    return (
      <DashboardClient
        initialIntelligenceFeedCollection={initialIntelligenceFeedCollection}
        initialAdministratorProfile={initialAdministratorProfile}
        initialResonanceMetrics={initialResonanceMetrics}
        isAdministratorAuthorityStatus={isAdministratorAuthorityStatus}
      />
    );

  } catch (criticalSystemException: unknown) {
    /**
     * 7. PROTOCOLO DE GESTIÓN DE PÁNICO (EMERGENCY FALLBACK)
     * Garantizamos que el Voyager acceda a la terminal incluso ante colapsos de red.
     */
    const exceptionMessage = criticalSystemException instanceof Error 
      ? criticalSystemException.message 
      : "Fallo desconocido en la cosecha T0.";
    
    console.error("🔥 [Dashboard-Fatal-Exception]:", exceptionMessage);

    return (
      <DashboardClient
        initialIntelligenceFeedCollection={{ 
          epicenterPodcastsCollection: [], 
          semanticConnectionsCollection: [] 
        }}
        initialAdministratorProfile={{
          id: authenticatedUserIdentification,
          full_name: "Voyager (Modo Resiliencia)",
          username: "curador_seguro",
          role: "user",
          reputation_score: 0,
          created_at: new Date().toISOString()
        } as Tables<'profiles'>}
        initialResonanceMetrics={null}
        isAdministratorAuthorityStatus={false}
      />
    );
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V24.0):
 * 1. Zero Abbreviations Policy (ZAP): Purificación total. 'res' -> 'Response', 
 *    'err' -> 'HardwareException', 'id' -> 'Identification', 'feed' -> 'IntelligenceFeedCollection'.
 * 2. TS2322 Resolution: Sincronización milimétrica del objeto de propiedades enviado 
 *    al 'DashboardClient', eliminando la amnesia nominal del servidor.
 * 3. BSS Contract Seal: Se ha eliminado el casting 'as any' en la entrega del perfil, 
 *    utilizando una estructura de fallback que satisface el tipo 'Tables<'profiles'>'.
 */