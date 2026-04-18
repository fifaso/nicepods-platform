/**
 * ARCHIVO: components/remix-dialog.tsx
 * VERSIÓN: 2.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Micro-estudio para la generación de hilos de audio (Remixes).
 * [REFORMA V2.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quote, CornerDownRight, Loader2, Sparkles } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * INTERFAZ: RemixDialogComponentProperties
 */
interface RemixDialogComponentProperties {
  isInterfaceOpenStatus: boolean;
  onInterfaceOpenChangeAction: (isInterfaceOpenStatus: boolean) => void;
  parentPodcastSnapshot: {
    identification: number;
    titleTextContent: string;
    authorProfile: { fullName: string | null; avatarUniformResourceLocator: string | null };
  };
  quoteContextText: string;
  playbackTimestampMagnitude: number;
}

export function RemixDialog({
  isInterfaceOpenStatus: isOpen,
  onInterfaceOpenChangeAction: onOpenChange,
  parentPodcastSnapshot: parentPodcast,
  quoteContextText: quoteContext,
  playbackTimestampMagnitude: timestamp
}: RemixDialogComponentProperties) {
  const { authenticatedUser, supabaseSovereignClient: supabase } = useAuth();
  const { toast } = useToast();
  
  const [reactionContentText, setReactionContentText] = useState("");
  const [isSubmissionProcessActive, setIsSubmissionProcessActive] = useState(false);
  const [isOperationSuccessfulStatus, setIsOperationSuccessfulStatus] = useState(false);

  const formatTimestampAction = (secondsMagnitude: number) => {
    const minutesValue = Math.floor(secondsMagnitude / 60);
    const secondsValue = Math.floor(secondsMagnitude % 60);
    return `${minutesValue}:${secondsValue.toString().padStart(2, '0')}`;
  };

  const handleCreateRemixAction = async () => {
    if (!authenticatedUser) {
        toast({ title: "Inicia sesión", description: "Necesitas una cuenta para responder.", variant: "destructive" });
        return;
    }
    if (!reactionContentText || reactionContentText.length < 5) {
        toast({ title: "Falta tu voz", description: "Graba una reacción para continuar.", variant: "destructive" });
        return;
    }

    setIsSubmissionProcessActive(true);

    try {
        const creationPayload = {
            creation_mode: 'remix',
            parent_id: parentPodcast.identification,
            quote_context: quoteContext,
            user_reaction: reactionContentText,
            agentName: 'reply-synthesizer-v1',
            inputs: {
                generateAudioDirectly: true,
                voiceGender: "Masculino",
                voiceStyle: "Energético"
            }
        };

        const { data: edgeFunctionResponse, error: communicationException } = await supabase.functions.invoke('queue-podcast-job', {
            body: creationPayload
        });

        if (communicationException) throw communicationException;
        if (!edgeFunctionResponse.success) throw new Error(edgeFunctionResponse.message);

        setIsOperationSuccessfulStatus(true);
        toast({ 
            title: "¡Respuesta en Camino!", 
            description: "Tu remix se está generando. Te avisaremos cuando esté listo." 
        });
        
        setTimeout(() => {
            onOpenChange(false);
            setIsOperationSuccessfulStatus(false);
            setReactionContentText("");
        }, 2000);

    } catch (hardwareException: any) {
        console.error("🔥 [RemixDialog] Operation failed:", hardwareException);
        toast({ title: "Error", description: hardwareException.message || "No se pudo enviar la respuesta.", variant: "destructive" });
    } finally {
        setIsSubmissionProcessActive(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-200">
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CornerDownRight className="h-5 w-5 text-purple-400" />
            Responder a {parentPodcast.authorProfile.fullName?.split(' ')[0]}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Crea un micro-podcast de respuesta a esta idea.
          </DialogDescription>
        </DialogHeader>

        {!isOperationSuccessfulStatus ? (
            <div className="space-y-6 py-2">
                <div className="relative pl-4 border-l-4 border-purple-500/50 bg-purple-500/5 p-3 rounded-r-lg">
                    <Quote className="absolute top-2 right-2 h-4 w-4 text-purple-500/20" />
                    <div className="flex items-center gap-2 mb-1 text-xs text-purple-300 font-mono">
                        <span className="bg-purple-500/20 px-1.5 py-0.5 rounded">
                            {formatTimestampAction(timestamp)}
                        </span>
                        <span>Contexto Original</span>
                    </div>
                    <ScrollArea className="h-24">
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            "{quoteContext || 'Escuchando fragmento...'}"
                        </p>
                    </ScrollArea>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Tu Reacción (Máx 10s)
                    </label>
                    
                    {reactionContentText ? (
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 animate-in fade-in">
                            <p className="text-sm text-white">"{reactionContentText}"</p>
                            <Button 
                                variant="link" 
                                size="sm" 
                                onClick={() => setReactionContentText("")}
                                className="h-auto p-0 mt-2 text-xs text-red-400"
                            >
                                Borrar y grabar de nuevo
                            </Button>
                        </div>
                    ) : (
                        <VoiceInput 
                            onTextGeneratedAction={setReactionContentText}
                            className="w-full"
                        />
                    )}
                </div>
            </div>
        ) : (
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

        {!isOperationSuccessfulStatus && (
            <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmissionProcessActive}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleCreateRemixAction}
                    disabled={!reactionContentText || isSubmissionProcessActive}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {isSubmissionProcessActive ? (
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
