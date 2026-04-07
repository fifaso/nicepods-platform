/**
 * ARCHIVO: app/(platform)/podcast/[id]/page.tsx
 * VERSIÓN: 8.0 (NicePod View Orchestrator - Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Punto de entrada de servidor para la visualización inmersiva de crónicas.
 * [REFORMA V8.0]: Sincronización nominal total con PulsePillView V1.3 y 
 * cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { PodcastView } from "@/components/podcast-view";
import { PulsePillView } from "@/components/feed/pulse-pill-view";
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * Misión: Garantizar que el servidor consulte el Metal en cada petición.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * INTERFAZ: PodcastPageProperties
 */
interface PodcastPageProperties {
  params: {
    id: string;
  };
}

/**
 * generateMetadata: Motor de visibilidad y SEO técnico de grado industrial.
 */
export async function generateMetadata({ params: routeParameters }: PodcastPageProperties): Promise<Metadata> {
  const supabaseClient = createClient();
  const { data: pointOfKnowledge } = await supabaseClient
    .from("micro_pods")
    .select("title, description, cover_image_url, processing_status")
    .eq('id', routeParameters.id)
    .single();

  if (!pointOfKnowledge) {
    return { title: "Punto de Sabiduria no localizado | NicePod" };
  }

  const openGraphImageUniformResourceLocator = pointOfKnowledge.cover_image_url || 
    'https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png';

  return {
    title: `${pointOfKnowledge.title} | NicePod Intelligence`,
    description: pointOfKnowledge.description || "Escucha esta crónica de sabiduria generada en NicePod.",
    openGraph: {
      title: pointOfKnowledge.title,
      description: pointOfKnowledge.description || '',
      images: [openGraphImageUniformResourceLocator],
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title: pointOfKnowledge.title,
      description: pointOfKnowledge.description || '',
      images: [openGraphImageUniformResourceLocator],
    }
  };
}

/**
 * PodcastDisplayPage: El orquestador de datos en el servidor (SSR T0).
 */
export default async function PodcastDisplayPage({ params: routeParameters }: PodcastPageProperties) {
  const supabaseClient = createClient();
  const podcastIdentification = routeParameters.id;

  /**
   * [CORE]: Selección de campos de alta fidelidad.
   */
  const highFidelityFields = `
    *,
    profiles:user_id (
      full_name,
      avatar_url,
      username,
      reputation_score,
      is_verified
    )
  `;

  // 1. COSECHA PARALELA DE INTELIGENCIA (SSR T0)
  const [
    podcastQueryResponse, 
    repliesQueryResponse, 
    authenticationResponse
  ] = await Promise.all([
    supabaseClient.from("micro_pods").select(highFidelityFields).eq('id', podcastIdentification).single(),
    supabaseClient.from('micro_pods').select(highFidelityFields).eq('parent_id', podcastIdentification).order('created_at', { ascending: true }),
    supabaseClient.auth.getUser()
  ]);

  const rawPodcastData = podcastQueryResponse.data;
  const authenticatedUser = authenticationResponse.data.user;

  // 2. GUARDIA DE PERSISTENCIA
  if (podcastQueryResponse.error || !rawPodcastData) {
    console.error(`🛑 [NicePod-Router] Recurso inexistente: ${podcastIdentification}`);
    notFound();
  }

  // 3. CAPTURA DE ESTADO SOCIAL PRIVADO
  let initialIsLikedStatus = false;
  if (authenticatedUser) {
    const { data: interactionLikeData } = await supabaseClient
      .from('likes')
      .select('user_id')
      .eq('user_id', authenticatedUser.id)
      .eq('podcast_id', podcastIdentification)
      .maybeSingle();

    initialIsLikedStatus = !!interactionLikeData;
  }

  // 4. NORMALIZACIÓN DE TIPOS SOBERANOS
  const typeValidatedPodcast = rawPodcastData as unknown as PodcastWithProfile;
  const typeValidatedReplies = (repliesQueryResponse.data || []) as unknown as PodcastWithProfile[];

  /**
   * [BIFURCACIÓN DE VISTA SOBERANA]:
   * Misión: Decidir el componente basado en la intención original (creation_mode).
   */
  const isPulsePillMode = typeValidatedPodcast.creation_mode === 'pulse';

  if (isPulsePillMode) {
    return (
      <PulsePillView
        initialPodcastData={typeValidatedPodcast} // [FIX]: Sincronía con V1.3
        authenticatedUser={authenticatedUser}     // [FIX]: Sincronía con V1.3
        initialIsLikedStatus={initialIsLikedStatus} // [FIX]: Sincronía con V1.3
        replies={typeValidatedReplies}
      />
    );
  }

  /**
   * [DESPACHO ESTÁNDAR]:
   * Se utiliza el chasis PodcastView para crónicas narrativas convencionales.
   */
  return (
    <PodcastView
      initialPodcastData={typeValidatedPodcast}
      authenticatedUser={authenticatedUser}
      initialIsLikedStatus={initialIsLikedStatus}
      replies={typeValidatedReplies}
    />
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Zero Abbreviations Policy: Purificación total de nomenclatura (routeParameters, 
 *    podcastIdentification, authenticatedUser).
 * 2. Build Shield Synchronization: Se corrigieron las propiedades de PulsePillView 
 *    y PodcastView para coincidir con la arquitectura de Grado Industrial.
 * 3. Parallel Efficiency: El Handshake T0 se realiza mediante concurrencia pura 
 *    para minimizar la latencia de renderizado en el primer byte.
 */