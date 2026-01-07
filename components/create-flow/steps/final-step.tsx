// components/create-flow/steps/final-step.tsx
// VERSIÓN: 7.0 (Master Manifest - Total Provenance Visibility)

"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, BrainCircuit, Sparkles, Mic2, FileText, Globe, Fingerprint, MapPin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FinalStep() {
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const formData = watch();

  // SINCRONIZACIÓN FINAL: Aseguramos agentName y mode antes del clic de producción
  useEffect(() => {
    if (formData.purpose === 'local_soul') {
        setValue("agentName", "local-concierge-v1");
        setValue("creation_mode", "situational");
    }
    if (formData.purpose === 'explore') {
        setValue("agentName", "connection-architect-v1");
    }
  }, [formData.purpose, setValue]);

  const sources = formData.sources || [];
  const hasLocation = !!formData.location;

  return (
    <div className="flex flex-col h-full w-full justify-center animate-in fade-in zoom-in-95 duration-700 px-4 md:px-10 pb-6 overflow-hidden">
      
      <header className="text-center mb-8 shrink-0">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none mb-2">
            Confirmar <span className="text-primary italic">Manifiesto</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Revisión final de inteligencia y custodia
        </p>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* LADO IZQUIERDO: INTEGRIDAD DEL PODCAST */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/5">
            <div className="p-8 relative">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-widest">
                    {formData.purpose?.toUpperCase()}
                </Badge>
                <h3 className="text-2xl font-black text-white leading-tight tracking-tight line-clamp-2">
                    {formData.final_title || "Construcción en curso..."}
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/5 border-y border-white/5">
                <div className="bg-black/20 p-5 flex items-center gap-4">
                    <Clock className="text-primary h-5 w-5 opacity-60" />
                    <div>
                        <p className="text-[9px] uppercase text-zinc-500 font-black tracking-widest">Duración</p>
                        <p className="text-sm font-bold text-white capitalize">{formData.duration}</p>
                    </div>
                </div>
                <div className="bg-black/20 p-5 flex items-center gap-4">
                    <Sparkles className="text-primary h-5 w-5 opacity-60" />
                    <div>
                        <p className="text-[9px] uppercase text-zinc-500 font-black tracking-widest">Análisis</p>
                        <p className="text-sm font-bold text-white capitalize">{formData.narrativeDepth}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-6 flex-1">
                {/* Visualización Situacional */}
                {hasLocation && (
                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-in slide-in-from-left-4">
                        <MapPin className="text-primary h-5 w-5" />
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1">Localización Verificada</p>
                            <p className="text-sm font-bold text-white truncate">{formData.location?.placeName || "Coordenadas Activas"}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Fingerprint size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Gobernanza de IA</span>
                    </div>
                    <p className="text-sm text-zinc-300 italic font-medium leading-relaxed">
                        Procesado por <span className="text-white font-bold">{formData.agentName}</span> con voz <span className="text-white font-bold">{formData.voiceGender} {formData.voiceStyle}</span>.
                    </p>
                </div>
            </div>
        </div>

        {/* LADO DERECHO: CUSTODIA DE FUENTES */}
        <div className="w-full md:w-80 flex flex-col bg-black/20">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400">
                    <Globe size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Grounding</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-white/10 font-mono">{sources.length}</Badge>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                    {sources.length > 0 ? (
                        sources.map((s, i) => (
                            <div key={i} className="space-y-1 group">
                                <p className="text-xs font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{s.title}</p>
                                <p className="text-[10px] text-zinc-500 truncate">{s.url}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-zinc-600 italic text-center py-10">Basado en corpus de conocimiento interno.</p>
                    )}
                </div>
            </ScrollArea>

            <div className="p-6 mt-auto bg-primary/5 border-t border-white/5 text-center">
                 <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Ready for Production</p>
            </div>
        </div>
      </div>
    </div>
  );
}