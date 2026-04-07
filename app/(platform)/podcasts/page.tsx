/**
 * ARCHIVO: app/(platform)/podcasts/page.tsx
 * VERSIÓN: 15.0 (NicePod Library Orchestrator - Hardened SSR Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Cosecha y despacho de capital intelectual para la Estación de Podcasts.
 * [REFORMA V15.0]: Sincronización nominal con LibraryTabs V15.0 y optimización 
 * de concurrencia en la adquisición de datos (Metal Fan-Out).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CuratedShelvesData, LibraryTabs } from "./library-tabs";

/**
 * METADATA SOBERANA:
 * Definición de la identidad de la página para motores de búsqueda y sistemas operativos.
 */
export const metadata: Metadata = {
  title: "Bóveda de Sabiduria | NicePod",
  description: "Estación de peritaje y consumo de capital intelectual geolocalizado.",
};

/**
 * PodcastsPage: El orquestador de datos en el servidor para la biblioteca.
 * Misión: Garantizar el Handshake T0 y recolectar la inteligencia necesaria.
 */
export default async function PodcastsPage() {
  const supabaseClient = createClient();

  /**
   * 1. HANDSHAKE DE IDENTIDAD (T0)
   * Validamos la autoridad en el metal del servidor antes de iniciar la cosecha.
   */
  const { data: { user: authenticatedUser }, error: authenticationError } = await supabaseClient.auth.getUser();

  // Si la sesión es inexistente o corrupta, redirección inmediata al control de acceso.
  if (authenticationError || !authenticatedUser) {
    redirect("/login");
  }

  const userIdentification = authenticatedUser.id;

  try {
    /**
     * 2. COSECHA PARALELA DE INTELIGENCIA (THE FAN-OUT PIPELINE)
     * Ejecutamos todas las consultas de forma concurrente para minimizar el TTFB.
     */
    const [
      creationJobsResponse,
      createdPodcastsResponse,
      allPublishedPodcastsResponse,
      curatedShelvesResponse
    ] = await Promise.all([
      // A. Tareas de forja activas para el usuario
      supabaseClient
        .from('podcast_creation_jobs')
        .select('*')
        .eq('user_id', userIdentification)
        .order('created_at', { ascending: false }),

      // B. Crónicas ya materializadas por el autor (incluyendo su perfil)
      supabaseClient
        .from('micro_pods')
        .select('*, profiles(*)')
        .eq('user_id', userIdentification)
        .order('created_at', { ascending: false }),

      // C. Todas las resonancias publicadas en la red global
      supabaseClient
        .from('micro_pods')
        .select('*, profiles(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50),

      // D. Cosecha de estanterías curadas mediante función de base de datos
      supabaseClient.rpc('get_curated_library_shelves', { p_user_id: userIdentification })
    ]);

    /**
     * 3. SANEAMIENTO Y ESTRUCTURACIÓN DE DATOS (DATA HYGIENE)
     */
    const initialCreationJobs = creationJobsResponse.data || [];
    const initialCreatedPodcasts = createdPodcastsResponse.data || [];
    const allPublishedPodcasts = allPublishedPodcastsResponse.data || [];

    // Casting de seguridad para el contrato de estanterías curadas
    const initialCuratedShelves = (curatedShelvesResponse.data as unknown as CuratedShelvesData) || {
      most_resonant: [],
      deep_thought: [],
      practical_tools: [],
      tech_and_innovation: [],
      wellness_and_mind: [],
      narrative_and_stories: []
    };

    /**
     * 4. DESPACHO AL CHASIS DE INTERFAZ (UI COMPOSITION)
     * [FIX]: Se utiliza 'authenticatedUser' para cumplir con el contrato de LibraryTabs V15.0.
     */
    return (
      <main className="min-h-screen bg-transparent">
        <LibraryTabs
          defaultTab="discover"
          authenticatedUser={authenticatedUser} // Corregido: Anteriormente 'user'
          userCreationJobs={initialCreationJobs}
          userCreatedPodcasts={initialCreatedPodcasts as any}
          allPodcasts={allPublishedPodcasts as any}
          curatedShelves={initialCuratedShelves}
        />
      </main>
    );

  } catch (exception: any) {
    /**
     * 5. GESTIÓN DE PÁNICO (EMERGENCY FALLBACK)
     * En caso de colapso de infraestructura, devolvemos un estado seguro.
     */
    console.error("🔥 [Podcasts-Hardened-SSR-Fatal]:", exception.message);

    return (
      <main className="min-h-screen bg-transparent">
        <LibraryTabs
          defaultTab="discover"
          authenticatedUser={authenticatedUser}
          userCreationJobs={[]}
          userCreatedPodcasts={[]}
          allPodcasts={[]}
          curatedShelves={{
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
 * NOTA TÉCNICA DEL ARCHITECT (V15.0):
 * 1. Zero Abbreviations Policy: Se han eliminado términos como 'user', 'jobs', 'pods' 
 *    y 'id', sustituyéndolos por descriptores técnicos completos.
 * 2. Contract Alignment: La propiedad 'authenticatedUser' ahora coincide con la interfaz 
 *    LibraryTabsProperties, eliminando el error de compilación en Vercel.
 * 3. Parallel Caching Strategy: El uso de Promise.all garantiza que la latencia de red 
 *    sea la del componente más lento y no la suma de todos.
 */