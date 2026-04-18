/**
 * ARCHIVO: app/(platform)/dashboard/page.tsx
 * VERSIÓN: 5.2 (Madrid Resonance)
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
 * Misión: Ejecutar el Handshake T0 y la cosecha de capital intelectual previa con peritaje industrial.
 */
export default async function DashboardPage() {
  // 1. INSTANCIACIÓN DEL PUENTE DE RED SOBERANO (SUPABASE SERVER)
  const supabaseSovereignClient = createClient();

  /**
   * 2. HANDSHAKE DE IDENTIDAD T0 (SERVER SIDE AUTH)
   * Validamos la autoridad del Voyager directamente en el metal del servidor.
   */
  const { 
    data: { user: authenticatedUserSnapshot },
    error: authenticationHardwareExceptionInformation
  } = await supabaseSovereignClient.auth.getUser();

  // Si la identidad es nula o el hardware de red falla, expulsión inmediata por seguridad de la Malla.
  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    nicepodLog("🛑 [Dashboard] Acceso denegado: Fallo en el Handshake de identidad.", authenticationHardwareExceptionInformation, 'error');
    redirect("/login");
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

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

    // A. Saneamiento del Feed de Inteligencia (Crystal Alignment)
    const rawIntelligenceFeedDataSnapshot = discoveryFeedNetworkResponse.data || { epicenter: [], semantic_connections: [] };
    
    const initialIntelligenceFeedCollection = {
      epicenterPodcastsCollection: Array.isArray(rawIntelligenceFeedDataSnapshot.epicenter)
        ? rawIntelligenceFeedDataSnapshot.epicenter
        : [],
      semanticConnectionsCollection: Array.isArray(rawIntelligenceFeedDataSnapshot.semantic_connections)
        ? rawIntelligenceFeedDataSnapshot.semantic_connections
        : []
    };

    // B. Saneamiento del Perfil de Autoridad (Build Shield Sovereignty)
    const initialAdministratorProfile: Tables<'profiles'> = userProfileDatabaseResponse.data || {
      id: authenticatedUserIdentification,
      full_name: authenticatedUserSnapshot.user_metadata?.full_name || "Voyager NicePod",
      username: authenticatedUserSnapshot.user_metadata?.user_name || "curador_identidad",
      role: (authenticatedUserSnapshot.app_metadata?.user_role as string) || 'user',
      avatar_url: authenticatedUserSnapshot.user_metadata?.avatar_url || null,
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
    const initialResonanceMetricsSnapshot = resonanceMetricsDatabaseResponse.data || null;

    /**
     * 5. DETERMINACIÓN DE AUTORIDAD (RBAC PROTOCOL)
     * Verificación de rango administrativo mediante validación de tokens y base de datos.
     */
    const isAdministratorAuthorityStatus =
      authenticatedUserSnapshot.app_metadata?.user_role === 'admin' ||
      authenticatedUserSnapshot.app_metadata?.role === 'admin' ||
      (userProfileDatabaseResponse.data?.role === 'admin');

    /**
     * 6. DESPACHO AL CHASIS CLIENTE (HANDOVER)
     */
    return (
      <DashboardClient
        initialIntelligenceFeedCollection={initialIntelligenceFeedCollection}
        initialAdministratorProfile={initialAdministratorProfile}
        initialResonanceMetrics={initialResonanceMetricsSnapshot}
        isAdministratorAuthorityStatus={isAdministratorAuthorityStatus}
      />
    );

  } catch (criticalSystemException: unknown) {
    /**
     * 7. PROTOCOLO DE GESTIÓN DE PÁNICO (EMERGENCY FALLBACK)
     * Garantizamos que el Voyager acceda a la terminal incluso ante colapsos de red.
     */
    const exceptionMessageText = criticalSystemException instanceof Error
      ? criticalSystemException.message 
      : "Fallo desconocido en la cosecha T0.";
    
    nicepodLog("🔥 [Dashboard-Fatal-Exception]:", exceptionMessageText, 'error');

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
 * NOTA TÉCNICA DEL ARCHITECT (V5.2):
 * 1. Industrial Traceability: Sustitución de console.error por nicepodLog en la barrera de pánico del Dashboard.
 * 2. ZAP Absolute Compliance: Purificación nominal de variables de servidor ('res' -> 'Response', 'feed' -> 'IntelligenceFeedCollection').
 * 3. BSS Contract Seal: Saneamiento exhaustivo del Perfil de Autoridad para evitar filtraciones de 'any'.
 */
