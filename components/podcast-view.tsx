// components/podcast-view.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

// --- Importaciones de Hooks y Tipos ---
import { useAuth } from "@/hooks/use-auth";
import { useAudio } from "@/contexts/audio-context";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast"; // MODIFICACIÓN: Importamos nuestro tipo unificado.

// --- Importaciones de Componentes de UI ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Download, CheckCircle, Copy, Clock, BookOpen, ChevronUp, ChevronDown, Loader2, Play, Pause } from "lucide-react";

// =================================================================================
// EL SCRIPT VIEWER AHORA VIVE AQUÍ (Componente Interno y Especializado)
// =================================================================================
type ScriptLine = {
  speaker: string;
  line: string;
};

interface ScriptViewerProps {
  scriptText: string | null;
}

function ScriptViewer({ scriptText }: ScriptViewerProps) {
  const parsedScript = useMemo(() => {
    if (!scriptText) return null;
    try {
      const scriptData = JSON.parse(scriptText);
      if (Array.isArray(scriptData)) {
        return scriptData as ScriptLine[];
      }
      return null;
    } catch (error) {
      console.error("Error al parsear el guion JSON:", error);
      return null;
    }
  }, [scriptText]);

  if (!parsedScript) {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert text-destructive">
        <p>El guion no se pudo cargar o tiene un formato incorrecto.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
      {parsedScript.map((item, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <p className="font-bold text-primary !mb-1">{item.speaker}:</p>
          <p className="!mt-0">{item.line}</p>
        </div>
      ))}
    </div>
  );
}
// =================================================================================

interface PodcastViewProps { 
  podcastData: PodcastWithProfile; 
  user: User; 
  initialIsLiked: boolean; 
}

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
    // ... (Tu lógica de 'like' es perfecta y permanece sin cambios)
  };

  const handlePlayPodcast = () => {
    // ... (Tu lógica de 'play' es perfecta y permanece sin cambios)
  };
  
  const handleCopyLink = async () => {
    // ... (Tu lógica de 'copy' es perfecta y permanece sin cambios)
  };

  const formatTime = (time: number) => {
    // ... (Tu lógica de 'formatTime' es perfecta y permanece sin cambios)
  };
  
  const handleApprove = async () => {
    // ... (Tu lógica de 'approve' es perfecta y permanece sin cambios)
  };
  
  const isCurrentlyPlaying = currentPodcast?.id === podcastData.id.toString() && isPlaying;
  const canApprove = user.id === podcastData.user_id && podcastData.status === 'pending_approval';

  return (
    <div className="min-h-screen gradient-mesh pt-0">
      <div className="max-w-4xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          {/* ... (Tu cabecera es perfecta y permanece sin cambios) ... */}
        </div>

        <Card className="glass-card border-0 shadow-glass mb-8 overflow-hidden">
          {/* ... (La cabecera y el reproductor de la tarjeta son perfectos y permanecen sin cambios) ... */}
        </Card>

        {podcastData.script_text && 
          <Card className="glass-card border-0 shadow-glass mb-8">
            <Collapsible open={isScriptOpen} onOpenChange={setIsScriptOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-600" />Guion del Podcast</CardTitle>
                    {isScriptOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ScrollArea className="h-64 w-full rounded-lg border bg-background/50 p-4">
                    {/* ================== LA INTEGRACIÓN DEFINITIVA ================== */}
                    {/* Reemplazamos el 'split' por nuestro componente profesional. */}
                    <ScriptViewer scriptText={podcastData.script_text} />
                    {/* ============================================================= */}
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        }
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {/* ... (Tus botones de acción son perfectos y permanecen sin cambios) ... */}
        </div>
      </div>
    </div>
  );
}