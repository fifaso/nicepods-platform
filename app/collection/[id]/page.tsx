// app/collection/[id]/page.tsx
// VERSIÓN: 1.0 (Public Journey Landing)

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CollectionJourneyView } from "@/components/social/collection-journey-view"; // Asumimos este nombre para el cliente

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: collection, error } = await supabase
    .from("collections")
    .select(`
      *,
      profiles ( full_name, avatar_url, username, reputation_score ),
      collection_items (
        pod_id,
        micro_pods (
          id, title, description, audio_url, cover_image_url, duration_seconds,
          profiles ( full_name, avatar_url, username )
        )
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !collection) notFound();

  // Transformar la estructura anidada de collection_items a un array plano de podcasts
  const podcasts = collection.collection_items
    .map((item: any) => item.micro_pods)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-20 px-4">
      <CollectionJourneyView 
        collection={collection} 
        podcasts={podcasts} 
      />
    </div>
  );
}