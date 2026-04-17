/**
 * ARCHIVO: app/(platform)/podcast/[id]/page.tsx
 * VERSIÓN: 6.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Punto de entrada de servidor para la visualización de crónicas.
 * [REFORMA V6.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

import { PodcastView } from "@/components/podcast-view";
import { PulsePillView } from "@/components/feed/pulse-pill-view";
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mapDatabasePodcastToSovereignPodcast } from "@/lib/podcast-utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PodcastPageProperties {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params: routeParameters }: PodcastPageProperties): Promise<Metadata> {
  const supabaseClient = createClient();
  const { data: pointOfKnowledge } = await supabaseClient
    .from("micro_pods")
    .select("title, description, cover_image_url")
    .eq('id', routeParameters.id)
    .single();

  if (!pointOfKnowledge) {
    return { title: "Punto de Sabiduría No Localizado | NicePod Intelligence" };
  }

  const openGraphImageUniformResourceLocator = pointOfKnowledge.cover_image_url || 
    'https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png';

  return {
    title: `${pointOfKnowledge.title} | NicePod Intelligence`,
    description: pointOfKnowledge.description || "Escucha esta Crónica de Sabiduría generada en la Workstation de NicePod.",
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

export default async function PodcastDisplayPage({ params: routeParameters }: PodcastPageProperties) {
  const supabaseClient = createClient();
  const podcastIdentification = routeParameters.id;

  const [
    podcastQueryResponse, 
    repliesQueryResponse, 
    authenticationResponse
  ] = await Promise.all([
    supabaseClient.from("micro_pods").select('*, profiles(*)').eq('id', podcastIdentification).single(),
    supabaseClient.from('micro_pods').select('*, profiles(*)').eq('parent_id', podcastIdentification).order('created_at', { ascending: true }),
    supabaseClient.auth.getUser()
  ]);

  const rawPodcastData = podcastQueryResponse.data;
  const authenticatedUser = authenticationResponse.data.user;

  if (podcastQueryResponse.error || !rawPodcastData) {
    console.error(`🛑 [NicePod-Router] Recurso inexistente: ${podcastIdentification}`);
    notFound();
  }

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

  const typeValidatedPodcast = mapDatabasePodcastToSovereignPodcast(rawPodcastData);
  const typeValidatedReplies = (repliesQueryResponse.data || [])
    .map((replyRow: any) => mapDatabasePodcastToSovereignPodcast(replyRow));

  const isPulsePillMode = typeValidatedPodcast.creationMetadataDossier?.creationMode === 'pulse';

  if (isPulsePillMode) {
    return (
      <PulsePillView
        initialPodcastData={typeValidatedPodcast}
      />
    );
  }

  return (
    <PodcastView
      initialPodcastData={typeValidatedPodcast}
      authenticatedUser={authenticatedUser}
      initialIsLikedStatus={initialIsLikedStatus}
      replies={typeValidatedReplies}
    />
  );
}
