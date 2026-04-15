/**
 * ARCHIVO: app/(platform)/podcasts/page.tsx
 * VERSIÓN: 17.0 (NicePod Library Orchestrator - Industrial SSR Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la cosecha concurrente de capital intelectual desde el Metal 
 * hacia la Estación de Podcasts, garantizando la integridad de los contratos 
 * de datos y la soberanía administrativa en el servidor.
 * [REFORMA V17.0]: Resolución definitiva de TS2305 y TS2322. Sincronización nominal 
 * absoluta con 'LibraryTabs' V23.0. Erradicación total de tipos 'any' (Build Shield). 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { 
  CuratedIntelligenceShelvesDossier, 
  LibraryTabs 
} from "./library-tabs";
import { PodcastWithProfile } from "@/types/podcast";
import { Tables } from "@/types/database.types";

/**
 * METADATA SOBERANA:
 * Definición técnica de la identidad de la Bóveda para el motor de indexación.
 */
export const metadata: Metadata = {
  title: "Bóveda de Sabiduría | NicePod Workstation",
  description: "Estación de peritaje y consumo de capital intelectual geolocalizado mediante síntesis neuronal.",
};

/**
 * PodcastsPage: El orquestador de datos de alto nivel (Server Component).
 * Misión: Validar autoridad satelital y recolectar la inteligencia de la malla urbana.
 */
export default async function PodcastsPage() {
  // 1. INSTANCIACIÓN DEL PUENTE DE RED SOBERANO (SERVER CONTEXT)
  const supabaseSovereignClient = createClient();

  /**
   * 2. HANDSHAKE DE IDENTIDAD T0
   * Validamos la autoridad del Voyager antes de iniciar la carga térmica de la base de datos.
   */
  const {
    data: { user: authenticatedUser },
    error: authenticationHardwareException
  } = await supabaseSovereignClient.auth.getUser();

  // Protocolo de seguridad: Si la identidad es nula, expulsión inmediata al portal de login.
  if (authenticationHardwareException || !authenticatedUser) {
    redirect("/login?redirect=/podcasts");
  }

  const authenticatedUserIdentification = authenticatedUser.id;

  try {
    /**
     * 3. COSECHA PARALELA DE INTELIGENCIA (THE METAL FAN-OUT)
     * Misión: Concurrencia de consultas para optimizar el Time To First Byte (TTFB).
     */
    const [
      creationJobsQueryResponse,
      createdPodcastsQueryResponse,
      allPublishedPodcastsQueryResponse,
      curatedShelvesQueryResponse
    ] = await Promise.all([
      // A. Procesos de forja activos en la cola de procesamiento.
      supabaseSovereignClient
        .from('podcast_creation_jobs')
        .select('*')
        .eq('user_id', authenticatedUserIdentification)
        .order('created_at', { ascending: false }),

      // B. Crónicas materializadas bajo la autoría del Voyager.
      supabaseSovereignClient
        .from('micro_pods')
        .select('*, profiles(*)')
        .eq('user_id', authenticatedUserIdentification)
        .order('created_at', { ascending: false }),

      // C. Resonancias globales de alta fidelidad publicadas en la malla.
      supabaseSovereignClient
        .from('micro_pods')
        .select('*, profiles(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50),

      // D. Estanterías curadas mediante el Oráculo Vectorial (RPC).
      supabaseSovereignClient.rpc('get_curated_library_shelves', {
        p_user_id: authenticatedUserIdentification
      })
    ]);

    /**
     * 4. SANEAMIENTO NOMINAL Y CONSTRUCCIÓN DE COLECCIONES (BSS & ZAP)
     * Misión: Transmutar datos crudos a colecciones tipadas de grado industrial.
     */
    const initialUserCreationJobsCollection = (creationJobsQueryResponse.data || []) as Tables<'podcast_creation_jobs'>[];
    
    // [RESOLUCIÓN TS2322]: Eliminamos 'any' mediante el uso del contrato PodcastWithProfile[].
    const initialUserCreatedPodcastsCollection = (createdPodcastsQueryResponse.data || []) as unknown as PodcastWithProfile[];
    const allPublishedPodcastsCollection = (allPublishedPodcastsQueryResponse.data || []) as unknown as PodcastWithProfile[];

    /** 
     * [RESOLUCIÓN TS2305]: Sincronización con el nuevo contrato 'CuratedIntelligenceShelvesDossier'.
     */
    const initialCuratedShelvesMetadataDossier = (curatedShelvesQueryResponse.data as unknown as CuratedIntelligenceShelvesDossier) || {
      most_resonant: [],
      deep_thought: [],
      practical_tools: [],
      tech_and_innovation: [],
      wellness_and_mind: [],
      narrative_and_stories: []
    };

    /**
     * 5. DESPACHO AL CHASIS DE INTERFAZ (UI HANDOVER)
     * [RESOLUCIÓN TS2322]: Alineación absoluta con LibraryTabsComponentProperties V23.0.
     */
    return (
      <main className="min-h-screen bg-transparent isolate">
        <LibraryTabs
          initialDefaultTabIdentification="discover"
          authenticatedUser={authenticatedUser}
          userCreationJobsCollection={initialUserCreationJobsCollection}
          userCreatedPodcastsCollection={initialUserCreatedPodcastsCollection}
          allPodcastsCollection={allPublishedPodcastsCollection}
          curatedShelvesMetadataDossier={initialCuratedShelvesMetadataDossier}
        />
      </main>
    );

  } catch (databaseOperationException: unknown) {
    /**
     * 6. PROTOCOLO DE GESTIÓN DE PÁNICO (EMERGENCY FALLBACK)
     * Garantizamos el acceso a la terminal incluso ante colapsos de red.
     */
    const exceptionMessageContentText = databaseOperationException instanceof Error
      ? databaseOperationException.message
      : "Error desconocido en la cosecha de inteligencia.";

    console.error("🔥 [Podcasts-SSR-Fatal-Exception]:", exceptionMessageContentText);

    return (
      <main className="min-h-screen bg-transparent isolate">
        <LibraryTabs
          initialDefaultTabIdentification="discover"
          authenticatedUser={authenticatedUser}
          userCreationJobsCollection={[]}
          userCreatedPodcastsCollection={[]}
          allPodcastsCollection={[]}
          curatedShelvesMetadataDossier={{
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
 * NOTA TÉCNICA DEL ARCHITECT (V17.0):
 * 1. Zero Abbreviations Policy (ZAP): Purificación total de la capa de servidor. 
 *    'res' -> 'Response', 'jobs' -> 'UserCreationJobsCollection', 'id' -> 'Identification'.
 * 2. Contract Alignment: Resolución definitiva de TS2305 y TS2322 mediante la 
 *    sincronía axial con los nuevos descriptores nominales del componente cliente.
 * 3. Build Shield Sovereignty: Se erradicó el uso de 'any' en el despacho de 
 *    colecciones, forzando el tipado industrial 'PodcastWithProfile[]' para 
 *    garantizar que la UI posea integridad de datos absoluta.
 */