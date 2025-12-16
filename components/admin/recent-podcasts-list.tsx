"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Star } from "lucide-react";
import { toggleFeaturedStatus } from "@/lib/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function RecentPodcastsList({ podcasts }: { podcasts: any[] }) {
  const { toast } = useToast();

  const handleToggleFeatured = async (id: number, currentStatus: boolean) => {
    try {
      await toggleFeaturedStatus(id, currentStatus);
      toast({ 
        title: currentStatus ? "Quitado de destacados" : "¡Destacado!", 
        description: "El feed público se actualizará en breve." 
      });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (podcasts.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-10">Sin actividad reciente.</p>;
  }

  return (
    <div className="space-y-3">
      {podcasts.map((pod) => (
        <div key={pod.id} className={cn(
            "p-4 rounded-xl border transition-all group relative",
            pod.is_featured 
                ? "bg-yellow-950/10 border-yellow-500/30" 
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
        )}>
            {/* BOTÓN DE ESTRELLA (CURADOR) */}
            <div className="absolute top-3 right-3 z-10">
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className={cn(
                        "h-7 w-7 transition-all",
                        pod.is_featured ? "text-yellow-400 hover:text-yellow-200" : "text-slate-600 hover:text-yellow-400"
                    )}
                    onClick={() => handleToggleFeatured(pod.id, pod.is_featured || false)}
                    title={pod.is_featured ? "Quitar destacado" : "Destacar en la comunidad"}
                >
                    <Star className={cn("h-4 w-4", pod.is_featured && "fill-current")} />
                </Button>
            </div>

            <div className="flex justify-between items-start mb-2 pr-8"> {/* Padding right para la estrella */}
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={pod.profiles?.avatar_url} />
                        <AvatarFallback className="text-[10px]">{pod.profiles?.full_name?.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-400 truncate max-w-[120px]">{pod.profiles?.full_name}</span>
                </div>
            </div>
            
            <h4 className="font-semibold text-sm text-slate-200 line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors">
                {pod.title}
            </h4>

            <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center gap-2">
                     <Badge variant="outline" className={`text-[9px] border-0 ${
                        pod.status === 'published' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'
                    }`}>
                        {pod.status}
                    </Badge>
                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(pod.created_at).toLocaleDateString()}
                    </span>
                </div>
                
                {pod.audio_url && (
                    <a 
                        href={pod.audio_url} 
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