// components/create-flow/steps/final-step.tsx
// VERSIÓN: 9.1 (NicePod Final Manifest - Type Integrity Edition)
// Misión: Validar la configuración final y autorizar el handover a producción binaria.
// [ESTABILIZACIÓN]: Resolución definitiva del error ts(2339) mediante sincronía con ResearchSource.

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { 
    Activity, 
    BrainCircuit, 
    CheckCircle2, 
    Clock, 
    ExternalLink, 
    FileText,
    Globe, 
    MapPin, 
    Mic2, 
    Quote, 
    ShieldCheck, 
    Sparkles, 
    Zap,
    X,
    ChevronRight
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- INFRAESTRUCTURA UI ---
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn, formatTime } from "@/lib/utils";
import { ResearchSource } from "@/types/podcast";

/**
 * COMPONENTE: FinalStep
 * Punto de auditoría final antes de la materialización acústica.
 */
export function FinalStep() {
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const formData = watch();
  
  const [isMobileSourcesOpen, setIsMobileSourcesOpen] = useState(false);

  /**
   * SINCRO DE PRODUCCIÓN: 
   * Alineación automática de agentes según el propósito de la misión.
   */
  useEffect(() => {
    if (formData.purpose === 'local_soul') {
      setValue("agentName", "local-concierge-v1");
      setValue("creation_mode", "situational");
    }
    if (formData.purpose === 'explore') {
      setValue("agentName", "connection-architect-v1");
    }
    setValue("generateAudioDirectly", true);
  }, [formData.purpose, setValue]);

  const friendlyAgentName = useMemo(() => {
    const names: Record<string, string> = {
      'narrador': 'El Narrador',
      'esceptico': 'El Escéptico',
      'mentor': 'El Mentor',
      'amigo': 'Tu Amigo',
      'rebelde': 'El Rebelde',
      'minimalista': 'El Minimalista',
      'local-concierge-v1': 'Guía Local',
      'connection-architect-v1': 'Arquitecto de Ideas'
    };
    return names[formData.agentName] || "Agente NicePod";
  }, [formData.agentName]);

  // [LOGICA DE SOBERANÍA]: Casteo seguro a ResearchSource para cumplir con el Build Shield
  const sources = (formData.sources as ResearchSource[]) || [];

  const coreTopic = useMemo(() => {
    switch (formData.purpose) {
      case 'explore': return `${formData.link_topicA} & ${formData.link_topicB}`;
      case 'local_soul': return formData.location?.placeName || "Anclaje Geoespacial";
      default: return formData.solo_topic;
    }
  }, [formData.purpose, formData.link_topicA, formData.link_topicB, formData.location, formData.solo_topic]);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-700 relative overflow-hidden bg-transparent pb-20 lg:pb-0">

      {/* 1. HEADER: IDENTIDAD INDUSTRIAL */}
      <header className="flex-shrink-0 text-center lg:text-left p-6 lg:p-10 border-b border-white/5 bg-zinc-900/60 backdrop-blur-3xl z-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 max-w-7xl mx-auto w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-black uppercase tracking-[0.4em] text-[9px]">
              <Zap size={12} className="animate-pulse fill-current" /> Auditoría de Integridad
            </div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-none italic">
              Manifiesto <span className="text-primary">Final</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-primary/10 p-5 rounded-3xl border border-primary/20 shadow-2xl">
            <ShieldCheck className="text-primary" size={28} />
            <div className="text-left">
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1.5">Estatus</p>
              <p className="text-xs font-black text-white uppercase tracking-tighter">Nodo Verificado</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. AREA DE REVISIÓN */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-hidden relative">

        {/* --- SECCIÓN A: RESUMEN DE LA IDEA --- */}
        <main className="flex-1 lg:col-span-8 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-10">
          <div className="max-w-4xl mx-auto space-y-10">

            <div className="p-8 lg:p-12 rounded-[3rem] bg-white/[0.03] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                <FileText size={150} />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-primary text-white border-none font-black text-[10px] tracking-[0.2em] px-4 py-1 rounded-lg">
                  {formData.purpose?.toUpperCase()}
                </Badge>
              </div>

              <h3 className="text-3xl lg:text-5xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8 italic">
                {formData.final_title || "Crónica de Conocimiento"}
              </h3>

              <div className="relative p-6 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                <Quote className="absolute -top-3 -left-3 h-8 w-8 text-primary/20" />
                <p className="text-base lg:text-lg font-medium text-zinc-400 italic leading-relaxed">
                  {coreTopic || "Definiendo el eje central..."}
                </p>
              </div>
            </div>

            {/* GRID DE ESPECIFICACIONES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Duración', val: formData.duration, icon: Clock },
                { label: 'Análisis', val: formData.narrativeDepth, icon: BrainCircuit },
                { label: 'Agente', val: friendlyAgentName, icon: Mic2 },
                { label: 'Voz', val: formData.voiceStyle, icon: Activity }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center gap-3 shadow-sm">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <item.icon className="text-primary opacity-60" size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">{item.label}</p>
                    <p className="text-xs font-black text-white uppercase truncate px-2">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* --- SECCIÓN B: DOSSIER DE FUENTES (Desktop) --- */}
        <aside className="hidden lg:flex lg:col-span-4 border-l border-white/5 bg-zinc-900/60 backdrop-blur-3xl flex-col shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3 text-primary">
              <Globe size={20} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Fuentes de Sabiduría</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-white/10 font-mono px-3 bg-black/40 text-primary">
              {sources.length}
            </Badge>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              {sources.length > 0 ? (
                sources.map((s, i) => (
                  <div key={i} className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group">
                    <div className="flex items-center gap-2 mb-3">
                      {s.origin === 'vault' ? 
                        <ShieldCheck size={12} className="text-primary" /> : 
                        <Globe size={12} className="text-blue-400" />
                      }
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                        {s.origin.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-black text-white line-clamp-2 leading-tight uppercase mb-3 tracking-tight">
                      {s.title}
                    </p>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 font-mono truncate">
                      <ExternalLink size={10} /> {s.url}
                    </a>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center opacity-10">
                  <Sparkles size={48} className="mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Investigación Pura</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* MÓVIL: BOTÓN DE ACCESO AL DOSSIER */}
        <div className="lg:hidden fixed bottom-24 left-0 right-0 p-4 z-40">
          <button 
            onClick={() => setIsMobileSourcesOpen(true)}
            className="w-full h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between px-6 shadow-2xl backdrop-blur-xl active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ver Dossier de Fuentes</span>
            </div>
            <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black">{sources.length}</Badge>
          </button>
        </div>
      </div>

      {/* DRAWER DE FUENTES PARA MÓVIL */}
      <AnimatePresence>
        {isMobileSourcesOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileSourcesOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-zinc-950 border-t border-white/10 z-[110] rounded-t-[3rem] flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Dossier de Inteligencia</h3>
                <button onClick={() => setIsMobileSourcesOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {sources.map((s, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-xs font-black text-white uppercase mb-2 leading-tight">{s.title}</p>
                    {/* [FIX CRÍTICO ts2339]: Uso de Optional Chaining para 'snippet' */}
                    {s.snippet && (
                      <p className="text-[10px] text-zinc-500 mb-3 italic">"{s.snippet.substring(0, 200)}..."</p>
                    )}
                    <a href={s.url} target="_blank" className="text-[10px] text-primary flex items-center gap-2 font-bold uppercase"><ExternalLink size={12}/> Ir a la Fuente</a>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}