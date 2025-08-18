// app/podcast/[id]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PodcastView } from "@/components/podcast-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function PodcastDisplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/podcast/${params.id}`);
  }

  const { data: podcastData, error } = await supabase
    .from("micro_pods")
    .select(`*, profiles(full_name, avatar_url)`)
    .eq('id', params.id)
    .single();

  if (error || !podcastData) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Podcast Not Found</AlertTitle>
          <AlertDescription>
            The podcast you are looking for does not exist or you do not have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { data: likeData } = await supabase
    .from('podcast_likes')
    .select('id')
    .match({ podcast_id: params.id, user_id: user.id });

  const initialIsLiked = (likeData?.length ?? 0) > 0;
  
  return (
    <PodcastView podcastData={podcastData} user={user} initialIsLiked={initialIsLiked} />
  );
}