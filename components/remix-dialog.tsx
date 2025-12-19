// components/remix-dialog.tsx
// VERSIÓN: 1.0 (Micro-Studio for Audio Threads)

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quote, CornerDownRight, Loader2, Sparkles } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RemixDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  parentPodcast: {
    id: number;
    title: string;
    author: { full_name: string | null; avatar_url: string | null };
  };
  quoteContext: string; // El texto al que respondemos
  timestamp: number;    // El minuto exacto
}

export function RemixDialog({ isOpen, onOpenChange, parentPodcast, quoteContext, timestamp }: RemixDialogProps) {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  
  const [reactionText, setReactionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateRemix = async () => {
    if (!user) {
        toast({ title: "Inicia sesión", description: "Necesitas una cuenta para responder.", variant: "destructive" });
        return;
    }
    if (!reactionText || reactionText.length < 5) {
        toast({ title: "Falta tu voz", description: "Graba una reacción para continuar.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);

    try {
        // Payload especial para Modo Remix
        const payload = {
            creation_mode: 'remix',
            parent_id: parentPodcast.id,
            quote_context: quoteContext, // El texto original
            user_reaction: reactionText, // Tu opinión
            agentName: 'reply-synthesizer-v1', // El "Debater"
            inputs: {
                generateAudioDirectly: true, // Queremos audio sí o sí
                voiceGender: "Masculino", // Default o preferencia de usuario
                voiceStyle: "Energético"  // Tono de debate
            }
        };

        const { data, error } = await supabase.functions.invoke('queue-podcast-job', {
            body: payload
        });

        if (error) throw new Error(error.message);
        if (!data.success) throw new Error(data.message);

        setIsSuccess(true);
        toast({ 
            title: "¡Respuesta en Camino!", 
            description: "Tu remix se está generando. Te avisaremos cuando esté listo." 
        });
        
        // Cerrar después de un momento
        setTimeout(() => {
            onOpenChange(false);
            setIsSuccess(false);
            setReactionText("");
        }, 2000);

    } catch (error: any) {
        console.error("Remix Error:", error);
        toast({ title: "Error", description: error.message || "No se pudo enviar la respuesta.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-200">
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CornerDownRight className="h-5 w-5 text-purple-400" />
            Responder a {parentPodcast.author.full_name?.split(' ')[0]}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Crea un micro-podcast de respuesta a esta idea.
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
            <div className="space-y-6 py-2">
                {/* 1. CONTEXTO (LA CITA) */}
                <div className="relative pl-4 border-l-4 border-purple-500/50 bg-purple-500/5 p-3 rounded-r-lg">
                    <Quote className="absolute top-2 right-2 h-4 w-4 text-purple-500/20" />
                    <div className="flex items-center gap-2 mb-1 text-xs text-purple-300 font-mono">
                        <span className="bg-purple-500/20 px-1.5 py-0.5 rounded">
                            {formatTimestamp(timestamp)}
                        </span>
                        <span>Contexto Original</span>
                    </div>
                    <ScrollArea className="h-24">
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            "{quoteContext || 'Escuchando fragmento...'}"
                        </p>
                    </ScrollArea>
                </div>

                {/* 2. TU REACCIÓN (INPUT) */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Tu Reacción (Máx 10s)
                    </label>
                    
                    {reactionText ? (
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 animate-in fade-in">
                            <p className="text-sm text-white">"{reactionText}"</p>
                            <Button 
                                variant="link" 
                                size="sm" 
                                onClick={() => setReactionText("")} 
                                className="h-auto p-0 mt-2 text-xs text-red-400"
                            >
                                Borrar y grabar de nuevo
                            </Button>
                        </div>
                    ) : (
                        <VoiceInput 
                            onTextGenerated={setReactionText} 
                            className="w-full"
                        />
                    )}
                </div>
            </div>
        ) : (
            /* ESTADO DE ÉXITO */
            <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">¡Enviado!</h3>
                <p className="text-slate-400 mt-2 max-w-xs">
                    Tu respuesta se está cocinando. Aparecerá en el hilo en breve.
                </p>
            </div>
        )}

        {!isSuccess && (
            <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleCreateRemix} 
                    disabled={!reactionText || isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                    ) : (
                        "Publicar Respuesta"
                    )}
                </Button>
            </DialogFooter>
        )}

      </DialogContent>
    </Dialog>
  );
}