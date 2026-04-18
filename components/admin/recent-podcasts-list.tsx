/**
 * ARCHIVO: components/admin/recent-podcasts-list.tsx
 * VERSIÓN: 5.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Visualización de crónicas recientes para curaduría administrativa.
 * [REFORMA V5.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Star } from "lucide-react";
import { toggleFeaturedStatus } from "@/lib/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

interface RecentPodcastsListProperties {
  podcastsCollection: PodcastWithProfile[];
}

export function RecentPodcastsList({ podcastsCollection }: RecentPodcastsListProperties) {
  const { toast } = useToast();

  const handleToggleFeaturedAction = async (podcastIdentification: number, currentFeaturedStatus: boolean) => {
    try {
      const resonanceResponse = await toggleFeaturedStatus(podcastIdentification, currentFeaturedStatus);
      if (resonanceResponse.isOperationSuccessful) {
        toast({
          title: currentFeaturedStatus ? "Quitado de destacados" : "¡Destacado!",
          description: "El feed público se actualizará en breve."
        });
      } else {
        throw new Error(resonanceResponse.responseStatusMessage);
      }
    } catch (governanceException: any) {
      toast({ 
        title: "Error de Gobernanza",
        description: governanceException.message,
        variant: "destructive"
      });
    }
  };

  if (podcastsCollection.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-10">Sin actividad reciente.</p>;
  }

  return (
    <div className="space-y-3">
      {podcastsCollection.map((podcastItem) => (
        <div key={podcastItem.identification} className={cn(
            "p-4 rounded-xl border transition-all group relative",
            podcastItem.isFeaturedContentStatus
                ? "bg-yellow-950/10 border-yellow-500/30" 
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
        )}>
            <div className="absolute top-3 right-3 z-10">
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className={cn(
                        "h-7 w-7 transition-all",
                        podcastItem.isFeaturedContentStatus ? "text-yellow-400 hover:text-yellow-200" : "text-slate-600 hover:text-yellow-400"
                    )}
                    onClick={() => handleToggleFeaturedAction(podcastItem.identification, podcastItem.isFeaturedContentStatus || false)}
                    title={podcastItem.isFeaturedContentStatus ? "Quitar destacado" : "Destacar en la comunidad"}
                >
                    <Star className={cn("h-4 w-4", podcastItem.isFeaturedContentStatus && "fill-current")} />
                </Button>
            </div>

            <div className="flex justify-between items-start mb-2 pr-8">
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={podcastItem.profiles?.avatarUniformResourceLocator || ''} />
                        <AvatarFallback className="text-[10px]">{podcastItem.profiles?.fullName?.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-400 truncate max-w-[120px]">{podcastItem.profiles?.fullName}</span>
                </div>
            </div>
            
            <h4 className="font-semibold text-sm text-slate-200 line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors">
                {podcastItem.titleTextContent}
            </h4>

            <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center gap-2">
                     <Badge variant="outline" className={`text-[9px] border-0 ${
                        podcastItem.publicationStatus === 'published' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'
                    }`}>
                        {podcastItem.publicationStatus}
                    </Badge>
                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(podcastItem.creationTimestamp).toLocaleDateString()}
                    </span>
                </div>
                
                {podcastItem.audioUniformResourceLocator && (
                    <a 
                        href={podcastItem.audioUniformResourceLocator}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors"
                        title="Escuchar audio"
                    >
                        <PlayCircle className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
      ))}
    </div>
  );
}
