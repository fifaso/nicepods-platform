// components/podcast-view.tsx

"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, Download, CheckCircle, Copy, Clock, BookOpen, ChevronUp, ChevronDown, Loader2, Play, Pause } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAudio } from "@/contexts/audio-context";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

// El tipo ahora coincide con la consulta del servidor
type PodcastData = Tables<'micro_pods'> & {
  profiles: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'> | null
};

interface PodcastViewProps { podcastData: PodcastData; user: User; initialIsLiked: boolean; }

export function PodcastView({ podcastData: initialPodcastData, user, initialIsLiked }: PodcastViewProps) {
  const router = useRouter();
  const { playPodcast, currentPodcast, isPlaying, currentTime, duration, seekTo } = useAudio();
  const { toast } = useToast();
  const { supabase } = useAuth();
  
  const [podcastData, setPodcastData] = useState(initialPodcastData);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(podcastData.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setIsLiked(initialIsLiked); }, [initialIsLiked]);

  const handleLikeToggle = async () => { /* ... (sin cambios) ... */ };
  const handlePlayPodcast = () => { /* ... (sin cambios) ... */ };
  const handleCopyLink = async () => { /* ... (sin cambios) ... */ };
  const formatTime = (time: number) => { /* ... (sin cambios) ... */ };
  const handleApprove = async () => { /* ... (sin cambios) ... */ };

  const isCurrentlyPlaying = currentPodcast?.id === podcastData.id.toString() && isPlaying;
  const canApprove = user.id === podcastData.user_id && podcastData.status === 'pending_approval';
  const authorName = podcastData.profiles?.full_name || "Anonymous Creator";

  return (
    <div className="min-h-screen gradient-mesh pt-0">
      <div className="max-w-4xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center ... ${podcastData.status === 'published' ? 'text-green-800' : 'text-yellow-800'}`}>
            {podcastData.status === 'published' ? <CheckCircle className="h-5 w-5 ..." /> : <Clock className="h-5 w-5 ..." />}
            <span>{podcastData.status === 'published' ? 'Podcast is Live' : 'Pending Your Approval'}</span>
          </div>
          <h1 className="heading-lg ...">{podcastData.title}</h1>
          <p className="...">{podcastData.description}</p>
        </div>

        <Card className="glass-card border-0 shadow-glass mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {podcastData.category && <Badge className="bg-white/20 ...">{podcastData.category}</Badge>}
                  {podcastData.duration_seconds && <span className="..."><Clock className="inline h-4 w-4 mr-1" />{Math.floor(podcastData.duration_seconds / 60)} min</span>}
                </div>
                <CardTitle className="text-2xl mb-2">{podcastData.title}</CardTitle>
                <CardDescription className="...">{podcastData.description}</CardDescription>
              </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Aquí iría la lógica del reproductor, que ya es dinámica */}
          </CardContent>
        </Card>

        {podcastData.script_text && (
          <Card className="glass-card border-0 shadow-glass mb-8">
            <Collapsible open={isScriptOpen} onOpenChange={setIsScriptOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer ...">
                   {/* ... */}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ScrollArea className="h-64 ...">
                    <div className="prose ...">
                      {podcastData.script_text.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {canApprove && (<Button onClick={handleApprove} size="lg" disabled={isApproving} className="..."><CheckCircle className="h-5 w-5 mr-2" />Approve & Publish</Button>)}
          <Button asChild variant="outline" className="glass-button ..."><Link href="/podcasts">Browse Library</Link></Button>
        </div>
      </div>
    </div>
  );
}