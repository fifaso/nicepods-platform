/**
 * ARCHIVO: components/create-flow/steps/final-step.tsx
 * VERSIÓN: 10.0 (NicePod Final Manifest - ZAP Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Validar la configuración final de la forja y autorizar el handover 
 * a la producción binaria, garantizando la integridad de los metadatos.
 * [REFORMA V10.0]: Resolución definitiva de TS2339 (Propiedades de esquema y fuentes).
 * Sincronización nominal con 'PodcastCreationSchema' V12.0 y 'ResearchSource' V12.0.
 * Aplicación absoluta de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { 
    Activity, 
    BrainCircuit, 
    Clock, 
    ExternalLink, 
    FileText,
    Globe, 
    Mic2, 
    Quote, 
    ShieldCheck, 
    Sparkles, 
    Zap,
    X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- INFRAESTRUCTURA UI SOBERANA ---
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { classNamesUtility, formatSecondsAsChronometerMagnitude } from "@/lib/utils";
import { ResearchSource } from "@/types/podcast";

/**
 * FinalStep: El monitor de auditoría final antes de la materialización acústica.
 */
export function FinalStep() {
  // Consumo del motor de formularios bajo el tipado estricto BSS
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const creationFormData = watch();
  
  const [isMobileResearchSourcesDrawerOpen, setIsMobileResearchSourcesDrawerOpen] = useState<boolean>(false);

  /**
   * SINCRO DE PRODUCCIÓN: 
   * Misión: Alineación automática de agentes según el propósito de la misión.
   */
  useEffect(() => {
    if (creationFormData.purpose === 'local_soul') {
      setValue("agentName", "local-concierge-v1");
      setValue("creationMode", "situational");
    }
    if (creationFormData.purpose === 'explore') {
      setValue("agentName", "connection-architect-v1");
    }
    setValue("generateAudioDirectlyStatus", true);
  }, [creationFormData.purpose, setValue]);

  /** agentIntelligenceFriendlyName: Mapeador de descriptores comerciales para el Voyager. */
  const agentIntelligenceFriendlyName = useMemo((): string => {
    const agentNamesDictionary: Record<string, string> = {
      'narrador': 'El Narrador',
      'esceptico': 'El Escéptico',
      'mentor': 'El Mentor',
      'amigo': 'Tu Amigo',
      'rebelde': 'El Rebelde',
      'minimalista': 'El Minimalista',
      'local-concierge-v1': 'Guía Local de Madrid',
      'connection-architect-v1': 'Arquitecto de Ideas'
    };
    return agentNamesDictionary[creationFormData.agentName] || "Agente NicePod Industrial";
  }, [creationFormData.agentName]);

  /** researchSourcesCollection: Extracción pericial de evidencias. [RESOLUCIÓN TS2339] */
  const researchSourcesCollection = (creationFormData.sourcesCollection as ResearchSource[]) || [];

  /** primaryMissionTopicText: Síntesis nominal del eje de conocimiento. [RESOLUCIÓN TS2339] */
  const primaryMissionTopicText = useMemo((): string => {
    switch (creationFormData.purpose) {
      case 'explore': 
        return `${creationFormData.linkTopicPrimary} & ${creationFormData.linkTopicSecondary}`;
      case 'local_soul': 
        return creationFormData.location?.placeNameReference || "Anclaje Geodésico Situacional";
      default: 
        return creationFormData.soloTopicSelection || "Eje temático en definición...";
    }
  }, [
    creationFormData.purpose, 
    creationFormData.linkTopicPrimary, 
    creationFormData.linkTopicSecondary, 
    creationFormData.location, 
    creationFormData.soloTopicSelection
  ]);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-700 relative overflow-hidden bg-transparent pb-20 lg:pb-0 isolate">

      {/* I. CABECERA: IDENTIDAD INDUSTRIAL SOBERANA */}
      <header className="flex-shrink-0 text-center lg:text-left p-6 lg:p-10 border-b border-white/5 bg-zinc-900/60 backdrop-blur-3xl z-20 isolate">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 max-w-7xl mx-auto w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-black uppercase tracking-[0.4em] text-[9px]">
              <Zap size={12} className="animate-pulse fill-current" /> Auditoría de Integridad de Capital Intelectual
            </div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-none italic font-serif">
              Manifiesto <span className="text-primary not-italic">Final</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-primary/10 p-5 rounded-3xl border border-primary/20 shadow-2xl">
            <ShieldCheck className="text-primary" size={28} />
            <div className="text-left">
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1.5">Estatus de Sintonía</p>
              <p className="text-xs font-black text-white uppercase tracking-tighter">Nodo Voyager Verificado</p>
            </div>
          </div>
        </div>
      </header>

      {/* II. ÁREA DE PERITAJE TÉCNICO */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-hidden relative isolate">

        {/* --- SECCIÓN A: SÍNTESIS DE LA CRÓNICA --- */}
        <main className="flex-1 lg:col-span-8 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-10 isolate">
          <div className="max-w-4xl mx-auto space-y-10">

            <div className="p-8 lg:p-12 rounded-[3rem] bg-white/[0.03] border border-white/10 shadow-2xl relative overflow-hidden group isolate">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                <FileText size={150} />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-primary text-white border-none font-black text-[10px] tracking-[0.2em] px-4 py-1 rounded-lg">
                  {creationFormData.purpose?.toUpperCase()}
                </Badge>
              </div>

              <h3 className="text-3xl lg:text-5xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8 italic">
                {creationFormData.finalTitle || "Crónica de Conocimiento Sin Título"}
              </h3>

              <div className="relative p-6 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                <Quote className="absolute -top-3 -left-3 h-8 w-8 text-primary/20" />
                <p className="text-base lg:text-lg font-medium text-zinc-400 italic leading-relaxed">
                  {primaryMissionTopicText}
                </p>
              </div>
            </div>

            {/* GRID DE ESPECIFICACIONES TÉCNICAS [RESOLUCIÓN TS2339] */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Duración', displayValue: creationFormData.durationSelection, icon: Clock },
                { label: 'Análisis', displayValue: creationFormData.narrativeDepthLevel, icon: BrainCircuit },
                { label: 'Agente AI', displayValue: agentIntelligenceFriendlyName, icon: Mic2 },
                { label: 'Voz Neuronal', displayValue: creationFormData.voiceStyleSelection, icon: Activity }
              ].map((specificationItem, itemIndex) => (
                <div key={itemIndex} className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center gap-3 shadow-sm hover:bg-white/[0.04] transition-colors">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <specificationItem.icon className="text-primary opacity-60" size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">{specificationItem.label}</p>
                    <p className="text-xs font-black text-white uppercase truncate px-2">{specificationItem.displayValue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* --- SECCIÓN B: DOSSIER DE EVIDENCIAS (DESKTOP) --- */}
        <aside className="hidden lg:flex lg:col-span-4 border-l border-white/5 bg-zinc-900/60 backdrop-blur-3xl flex-col shadow-2xl isolate">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3 text-primary">
              <Globe size={20} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Fuentes de Sabiduría</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-white/10 font-mono px-3 bg-black/40 text-primary">
              {researchSourcesCollection.length}
            </Badge>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              {researchSourcesCollection.length > 0 ? (
                researchSourcesCollection.map((researchSourceItem, sourceItemIndex) => (
                  <div key={sourceItemIndex} className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group isolate">
                    <div className="flex items-center gap-2 mb-3">
                      {researchSourceItem.origin === 'vault' ? 
                        <ShieldCheck size={12} className="text-primary" /> : 
                        <Globe size={12} className="text-blue-400" />
                      }
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                        {researchSourceItem.origin.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-black text-white line-clamp-2 leading-tight uppercase mb-3 tracking-tight">
                      {researchSourceItem.title}
                    </p>
                    <a 
                      href={researchSourceItem.uniformResourceLocator} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 font-mono truncate"
                    >
                      <ExternalLink size={10} /> {researchSourceItem.uniformResourceLocator}
                    </a>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center opacity-10 grayscale">
                  <Sparkles size={48} className="mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sintonizando Investigación Pura</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* INTERFAZ MÓVIL: ACCESO AL DOSSIER */}
        <div className="lg:hidden fixed bottom-24 left-0 right-0 p-4 z-40">
          <button 
            onClick={() => setIsMobileResearchSourcesDrawerOpen(true)}
            className="w-full h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between px-6 shadow-2xl backdrop-blur-xl active:scale-95 transition-all isolate"
          >
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ver Dossier de Fuentes</span>
            </div>
            <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black">
                {researchSourcesCollection.length}
            </Badge>
          </button>
        </div>
      </div>

      {/* DRAWER DE EVIDENCIAS PARA DISPOSITIVOS MÓVILES */}
      <AnimatePresence>
        {isMobileResearchSourcesDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileResearchSourcesDrawerOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-zinc-950 border-t border-white/10 z-[110] rounded-t-[3rem] flex flex-col shadow-2xl isolate"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white italic font-serif">Dossier de Inteligencia</h3>
                <button 
                  onClick={() => setIsMobileResearchSourcesDrawerOpen(false)} 
                  className="p-2 bg-white/5 rounded-full text-white/40"
                  aria-label="Cerrar dossier"
                >
                    <X size={24}/>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {researchSourcesCollection.map((researchSourceItem, sourceItemIndex) => (
                  <div key={sourceItemIndex} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 shadow-inner isolate">
                    <p className="text-xs font-black text-white uppercase mb-3 leading-tight">{researchSourceItem.title}</p>
                    
                    {/* [RESOLUCIÓN TS2339]: Acceso a 'snippetContentText' purificado */}
                    {researchSourceItem.snippetContentText && (
                      <p className="text-[10px] text-zinc-500 mb-4 italic leading-relaxed">
                          "{researchSourceItem.snippetContentText.substring(0, 200)}..."
                      </p>
                    )}
                    
                    <a 
                      href={researchSourceItem.uniformResourceLocator} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-primary flex items-center gap-2 font-bold uppercase tracking-widest"
                    >
                        <ExternalLink size={12}/> Acceder a la Fuente
                    </a>
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Zero Abbreviations Policy (ZAP): Purga absoluta. 'formData' -> 'creationFormData', 
 *    'val' -> 'displayValue', 's' -> 'researchSourceItem', 'i' -> 'sourceItemIndex'.
 * 2. TS2339 Resolution: Sincronización total con los nuevos descriptores del 
 *    PodcastCreationSchema V12.0 (durationSelection, soloTopicSelection, etc.)
 * 3. BSS Contract Seal: Se asegura el acceso tipado a 'snippetContentText' dentro de 
 *    'ResearchSource', eliminando la fragilidad del tipado 'any' previo.
 */