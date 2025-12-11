// components/create-flow/final-step.tsx
// VERSIÓN: 6.0 (Production Manifest: Rich Data, Sources & Forced Audio)

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, BrainCircuit, Sparkles, Mic2, FileText, Globe, Fingerprint, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FinalStep() {
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const formData = watch();

  // [LÓGICA]: Forzamos la generación de audio siempre.
  // Al montar este componente, aseguramos que el flag sea true.
  useEffect(() => {
    setValue("generateAudioDirectly", true);
  }, [setValue]);

  // Helpers de visualización
  const toneLabel = formData.purpose === 'inspire' 
    ? formData.selectedArchetype?.replace('archetype-', '') 
    : formData.selectedTone;

  const purposeLabel = {
      learn: "Lección",
      inspire: "Historia",
      explore: "Exploración",
      reflect: "Reflexión",
      answer: "Respuesta",
      freestyle: "Freestyle"
  }[formData.purpose] || "Podcast";

  // Extraer el "Input Semilla" (Lo que el usuario escribió originalmente)
  const getCoreTopic = () => {
    switch(formData.purpose) {
        case 'explore': return `${formData.link_topicA} + ${formData.link_topicB}`;
        case 'inspire': return formData.archetype_topic;
        case 'reflect': return formData.legacy_lesson;
        case 'answer': return formData.question_to_answer;
        default: return formData.solo_topic;
    }
  };

  const sources = formData.sources || [];

  return (
    <div className="flex flex-col h-full w-full justify-center animate-fade-in px-2 md:px-6 pb-2">
      
      {/* HEADER SIMPLE */}
      <div className="text-center mb-6 flex-shrink-0 w-full">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Confirmar Producción
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Todo listo para convertir tu idea en audio.
        </p>
      </div>

      {/* MANIFIESTO DE PRODUCCIÓN (Tarjeta Principal) */}
      <div className="w-full max-w-4xl mx-auto bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl flex flex-col md:flex-row">
        
        {/* SECCIÓN 1: EL GUIÓN (Izquierda / Principal) */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5">
            
            {/* Título & Propósito */}
            <div className="p-6 pb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <Badge variant="secondary" className="mb-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border-primary/20 bg-primary/10 text-primary">
                    {purposeLabel}
                </Badge>
                <h3 className="text-xl md:text-2xl font-black text-foreground leading-tight tracking-tight line-clamp-3">
                    {formData.final_title || "Sin Título Definido"}
                </h3>
            </div>

            <Separator className="bg-black/5 dark:bg-white/5" />

            {/* Grid de Especificaciones */}
            <div className="grid grid-cols-2 gap-px bg-black/5 dark:bg-white/5">
                <div className="bg-white/40 dark:bg-black/40 p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Clock className="h-4 w-4" /></div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Duración</p>
                        <p className="text-sm font-semibold">{formData.duration.split(' ')[0]}</p>
                    </div>
                </div>
                <div className="bg-white/40 dark:bg-black/40 p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-500/10 text-purple-500"><BrainCircuit className="h-4 w-4" /></div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Profundidad</p>
                        <p className="text-sm font-semibold">{formData.narrativeDepth}</p>
                    </div>
                </div>
                <div className="bg-white/40 dark:bg-black/40 p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/10 text-amber-500"><Sparkles className="h-4 w-4" /></div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Tono</p>
                        <p className="text-sm font-semibold capitalize">{toneLabel}</p>
                    </div>
                </div>
                <div className="bg-white/40 dark:bg-black/40 p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10 text-green-500"><Mic2 className="h-4 w-4" /></div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Locutor</p>
                        <p className="text-sm font-semibold">{formData.voiceGender}</p>
                    </div>
                </div>
            </div>

            {/* ADN (Input Original) */}
            <div className="p-5 flex-grow bg-white/20 dark:bg-white/5">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Fingerprint className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Concepto Semilla</span>
                </div>
                <p className="text-sm text-foreground/90 italic font-medium leading-relaxed border-l-2 border-primary/30 pl-3">
                    "{getCoreTopic()}"
                </p>
            </div>
        </div>

        {/* SECCIÓN 2: EVIDENCIA (Derecha / Lateral) */}
        <div className="w-full md:w-80 bg-black/5 dark:bg-black/20 flex flex-col">
            <div className="p-4 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-bold">Fuentes Utilizadas</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">{sources.length}</Badge>
                </div>
            </div>

            <ScrollArea className="flex-grow h-48 md:h-auto">
                <div className="p-4 space-y-3">
                    {sources.length > 0 ? (
                        sources.map((source, idx) => (
                            <div key={idx} className="flex flex-col gap-1 p-3 rounded-lg bg-white/40 dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all text-xs">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-semibold text-foreground line-clamp-2">{source.title || "Fuente Web"}</span>
                                    {source.url && <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />}
                                </div>
                                <span className="text-[10px] text-blue-400 truncate block opacity-80">
                                    {source.url ? new URL(source.url).hostname : "Desconocido"}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground opacity-60">
                            <FileText className="h-8 w-8 mb-2" />
                            <p className="text-xs">Sin fuentes externas.<br/>Generado con conocimiento interno.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* STATUS INDICATOR (Visual Only) */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-green-500/10">
                 <div className="flex items-center justify-center gap-2 text-green-500 text-xs font-bold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Audio Listo para Generar
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}