/**
 * ARCHIVO: app/(platform)/podcasts/page.tsx
 * VERSIÓN: 16.0 (NicePod Library Orchestrator - Full Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la cosecha y el despacho de capital intelectual desde el 
 * Metal (Supabase) hacia la Estación de Podcasts en el cliente, garantizando 
 * la integridad de los contratos de datos y la soberanía administrativa.
 * [REFORMA V16.0]: Sincronización nominal absoluta con LibraryTabs V19.0. 
 * Resolución de errores TS2322 mediante la transmutación de propiedades a 
 * descriptores industriales (userCreationJobsCollection). Purificación total 
 * bajo la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CuratedShelvesData, LibraryTabs } from "./library-tabs";

/**
 * METADATA SOBERANA:
 * Identidad técnica de la Bóveda para la persistencia en el ecosistema digital.
 */
export const metadata: Metadata = {
  title: "Bóveda de Sabiduria | NicePod",
  description: "Estación de peritaje y consumo de capital intelectual geolocalizado.",
};

/**
 * PodcastsPage: El orquestador de datos en el servidor (Server Component).
 * Misión: Validar autoridad y recolectar la inteligencia de la malla urbana.
 */
export default async function PodcastsPage() {
  const supabaseSovereignClient = createClient();

  /**
   * 1. HANDSHAKE DE IDENTIDAD (FASE T0)
   * Validamos la autoridad en el servidor antes de iniciar la cosecha paralela.
   */
  const {
    data: { user: authenticatedUser },
    error: authenticationHardwareException
  } = await supabaseSovereignClient.auth.getUser();

  // Si la sesión es inexistente o el silicio reporta error, expulsión inmediata.
  if (authenticationHardwareException || !authenticatedUser) {
    redirect("/login?redirect=/podcasts");
  }

  const authenticatedUserIdentification = authenticatedUser.id;

  try {
    /**
     * 2. COSECHA PARALELA DE INTELIGENCIA (THE METAL FAN-OUT)
     * Optimizamos el rendimiento térmico ejecutando las consultas de forma concurrente.
     */
    const [
      creationJobsQueryResponse,
      createdPodcastsQueryResponse,
      allPublishedPodcastsQueryResponse,
      curatedShelvesQueryResponse
    ] = await Promise.all([
      // A. Procesos de forja activos para el Voyager.
      supabaseSovereignClient
        .from('podcast_creation_jobs')
        .select('*')
        .eq('user_id', authenticatedUserIdentification)
        .order('created_at', { ascending: false }),

      // B. Crónicas materializadas por el autor.
      supabaseSovereignClient
        .from('micro_pods')
        .select('*, profiles(*)')
        .eq('user_id', authenticatedUserIdentification)
        .order('created_at', { ascending: false }),

      // C. Resonancias globales publicadas en la Malla de Madrid.
      supabaseSovereignClient
        .from('micro_pods')
        .select('*, profiles(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50),

      // D. Estanterías curadas mediante función lógica de base de datos.
      supabaseSovereignClient.rpc('get_curated_library_shelves', {
        p_user_id: authenticatedUserIdentification
      })
    ]);

    /**
     * 3. SANEAMIENTO NOMINAL Y CONSTRUCCIÓN DE COLECCIONES (ZAP)
     */
    const initialUserCreationJobsCollection = creationJobsQueryResponse.data || [];
    const initialUserCreatedPodcastsCollection = createdPodcastsQueryResponse.data || [];
    const allPublishedPodcastsCollection = allPublishedPodcastsQueryResponse.data || [];

    const initialCuratedShelvesMetadata = (curatedShelvesQueryResponse.data as unknown as CuratedShelvesData) || {
      most_resonant: [],
      deep_thought: [],
      practical_tools: [],
      tech_and_innovation: [],
      wellness_and_mind: [],
      narrative_and_stories: []
    };

    /**
     * 4. DESPACHO AL CHASIS DE INTERFAZ (UI COMPOSITION)
     * [SINCRO V16.0]: Sincronización de propiedades con el contrato LibraryTabsProperties.
     */
    return (
      <main className="min-h-screen bg-transparent isolate">
        <LibraryTabs
          defaultTab="discover"
          authenticatedUser={authenticatedUser}
          userCreationJobsCollection={initialUserCreationJobsCollection}
          userCreatedPodcastsCollection={initialUserCreatedPodcastsCollection as any}
          allPodcastsCollection={allPublishedPodcastsCollection as any}
          curatedShelvesMetadata={initialCuratedShelvesMetadata}
        />
      </main>
    );

  } catch (databaseOperationException: unknown) {
    /**
     * 5. GESTIÓN DE COLAPSO (EMERGENCY FALLBACK)
     */
    const exceptionMessage = databaseOperationException instanceof Error
      ? databaseOperationException.message
      : String(databaseOperationException);

    console.error("🔥 [Podcasts-SSR-Fatal]:", exceptionMessage);

    return (
      <main className="min-h-screen bg-transparent">
        <LibraryTabs
          defaultTab="discover"
          authenticatedUser={authenticatedUser}
          userCreationJobsCollection={[]}
          userCreatedPodcastsCollection={[]}
          allPodcastsCollection={[]}
          curatedShelvesMetadata={{
            most_resonant: [],
            deep_thought: [],
            practical_tools: [],
            tech_and_innovation: [],
            wellness_and_mind: [],
            narrative_and_stories: []
          }}
        />
      </main>
    );
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V16.0):
 * 1. Build Shield Compliance: Se erradicó el error TS2322 al alinear los nombres 
 *    de las propiedades ('userCreationJobsCollection') con la definición del 
 *    componente 'LibraryTabs' V19.0.
 * 2. ZAP Absolute Compliance: Purificación total de variables de servidor. No 
 *    se permiten términos como 'jobs', 'pods', 'id' o 'err'.
 * 3. Data Integrity: El casting forzado hacia 'any' en las colecciones se mantiene 
 *    temporalmente mientras se unifica el tipo 'PodcastWithProfile' en la Bóveda, 
 *    pero el contrato de la interfaz es ahora sólido.
 */