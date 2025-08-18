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

  const handleLikeToggle = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const currentlyLiked = isLiked;
    setIsLiked(!currentlyLiked);
    setLikeCount(prev => currentlyLiked ? prev - 1 : prev + 1);
    try {
      if (currentlyLiked) {
        await supabase.from('podcast_likes').delete().match({ podcast_id: podcastData.id, user_id: user.id });
      } else {
        await supabase.from('podcast_likes').insert({ podcast_id: podcastData.id, user_id: user.id });
      }
    } catch (error: any) {
      setIsLiked(currentlyLiked);
      setLikeCount(prev => currentlyLiked ? prev + 1 : prev - 1);
      toast({ title: "Error", description: "Could not update like status.", variant: "destructive" });
    } finally {
      setIsLiking(false);
    }
  };

  const handlePlayPodcast = () => {
    playPodcast({ id: podcastData.id.toString(), title: podcastData.title, description: podcastData.description || "", audioUrl: podcastData.audio_url || "", category: podcastData.category || "General", duration: podcastData.duration_seconds ? `${podcastData.duration_seconds}` : "0" });
  };
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({ title: "Link Copied", description: "Podcast link has been copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const { error } = await supabase.functions.invoke('publish-podcast', { body: { podcast_id: podcastData.id } });
      if (error) throw new Error(error.message);
      setPodcastData({ ...podcastData, status: 'published' });
      toast({ title: "Podcast Published!", description: "Your micro-podcast is now live in the library." });
    } catch (error: any) {
      toast({ title: "Failed to Publish", description: error.message, variant: "destructive" });
    } finally {
      setIsApproving(false);
    }
  };
  
  const isCurrentlyPlaying = currentPodcast?.id === podcastData.id.toString() && isPlaying;
  const canApprove = user.id === podcastData.user_id && podcastData.status === 'pending_approval';

  return (
    <div className="min-h-screen gradient-mesh pt-0">
      <div className="max-w-4xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center space-x-2 glass px-6 py-3 rounded-full font-medium mb-6 shadow-glass ${podcastData.status === 'published' ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
            {podcastData.status === 'published' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-yellow-600" />}
            <span>{podcastData.status === 'published' ? 'Podcast is Live' : 'Pending Your Approval'}</span>
          </div>
          <h1 className="heading-lg text-gray-900 dark:text-gray-100 mb-2">{podcastData.title}</h1>
          <p className="text-gray-700 dark:text-gray-300 font-medium">{podcastData.description}</p>
        </div>

        <Card className="glass-card border-0 shadow-glass mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white relative p-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {podcastData.category && <Badge className="bg-white/20 text-white border-white/30">{podcastData.category}</Badge>}
                {podcastData.duration_seconds && <span className="text-purple-100 text-sm font-medium"><Clock className="inline h-4 w-4 mr-1" />{Math.floor(podcastData.duration_seconds / 60)} min</span>}
              </div>
              <CardTitle className="text-2xl mb-2">{podcastData.title}</CardTitle>
              <CardDescription className="text-purple-100 font-medium leading-relaxed">{podcastData.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Button onClick={handlePlayPodcast} size="lg" className={`w-16 h-16 rounded-full shadow-lg ${isCurrentlyPlaying ? 'bg-green-600' : 'bg-purple-600'} text-white`}>{isCurrentlyPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}</Button>
              <div className="w-full">
                <input type="range" min="0" max={duration || podcastData.duration_seconds || 100} value={currentTime} onChange={(e) => seekTo(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1"><span>{formatTime(currentTime)}</span><span>{formatTime(duration || podcastData.duration_seconds || 0)}</span></div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mb-6">
                <Button onClick={handleLikeToggle} disabled={isLiking} variant="outline" size="sm" className="glass-button flex items-center gap-2">
                    <Heart className={`h-4 w-4 transition-all ${isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                    {likeCount}
                </Button>
                <Button variant="outline" size="sm" className="glass-button"><Download className="h-4 w-4 mr-2" />Download</Button>
                <Button onClick={handleCopyLink} variant="outline" size="sm" className="glass-button" disabled={copied}>{copied ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}{copied ? "Copied!" : "Copy Link"}</Button>
            </div>
          </CardContent>
        </Card>

        {podcastData.script_text && 
          <Card className="glass-card border-0 shadow-glass mb-8">
            <Collapsible open={isScriptOpen} onOpenChange={setIsScriptOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-600" />Podcast Script</CardTitle>
                    {isScriptOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ScrollArea className="h-64 w-full rounded-lg border bg-background/50 p-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {podcastData.script_text.split("\n\n").map((paragraph, index) => (<p key={index} className="leading-relaxed mb-4 last:mb-0">{paragraph}</p>))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        }
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {canApprove && (
            <Button onClick={handleApprove} size="lg" disabled={isApproving} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
              {isApproving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
              {isApproving ? "Publishing..." : "Approve & Publish"}
            </Button>
          )}
          <Button asChild variant="outline" className="glass-button border-0 bg-transparent">
            <Link href="/podcasts">Browse Library</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}