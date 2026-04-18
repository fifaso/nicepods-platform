/**
 * ARCHIVO: app/(platform)/collection/[id]/page.tsx
 * VERSIÓN: 2.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Página de aterrizaje pública para colecciones de crónicas.
 * [REFORMA V2.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CollectionJourneyView } from "@/components/social/collection-journey-view";
import { mapDatabasePodcastToSovereignPodcast } from "@/lib/podcast-utils";

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const supabaseSovereignClient = createClient();

  const { data: collectionRecord, error: queryHardwareException } = await supabaseSovereignClient
    .from("collections")
    .select(`
      *,
      profiles ( full_name, avatar_url, username, reputation_score ),
      collection_items (
        pod_id,
        micro_pods (
          *,
          profiles ( * )
        )
      )
    `)
    .eq("id", params.id)
    .single();

  if (queryHardwareException || !collectionRecord) notFound();

  // Mapeo Soberano de la colección de activos
  const podcastsCollection = (collectionRecord.collection_items || [])
    .map((item: any) => item.micro_pods)
    .filter(Boolean)
    .map((podcastRow: any) => mapDatabasePodcastToSovereignPodcast(podcastRow));

  // Purificación Nominal de la Colección
  const purifiedCollection = {
    identification: collectionRecord.id,
    ownerUserIdentification: collectionRecord.owner_id,
    title: collectionRecord.title,
    descriptionTextContent: collectionRecord.description,
    isPublicSovereignty: collectionRecord.is_public,
    coverImageUniformResourceLocator: collectionRecord.cover_image_url,
    totalListenedCount: collectionRecord.total_listened_count,
    likesCountTotal: collectionRecord.likes_count,
    updateTimestamp: collectionRecord.updated_at,
    profiles: collectionRecord.profiles
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-20 px-4">
      <CollectionJourneyView 
        collectionSnapshot={purifiedCollection as any}
        podcastsCollection={podcastsCollection}
      />
    </div>
  );
}
