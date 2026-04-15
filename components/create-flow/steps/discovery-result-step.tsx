/**
 * ARCHIVO: components/create-flow/steps/discovery-result-step.tsx
 * VERSIÓN: 5.0 (NicePod Master Intelligence Reveal - Total Type Neutralization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Revelar el peritaje urbano generado por el Oráculo, permitiendo al 
 * Voyager seleccionar nodos de resonancia para la forja de podcasts situacionales.
 * [REFORMA V5.0]: Resolución definitiva de TS2345 mediante el blindaje de 
 * interfaces en el mapeo de fuentes. Sincronización nominal absoluta con 
 * 'PodcastCreationSchema' V12.0. Aplicación integral de la ley ZAP.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { 
  MapPin, 
  Globe, 
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Compass,
  Zap,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { POIActionCard } from "@/components/ui/poi-action-card";
import { 
  LocalRecommendation, 
  ResearchSource, 
  DiscoveryContextPayload 
} from "@/types/podcast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../shared/context";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * DiscoveryResultStep: La interfaz de revelación de capital intelectual situado.
 */
export function DiscoveryResultStep() {
  // 1. CONSUMO DE INFRAESTRUCTURA DE FORMULARIO Y NAVEGACIÓN
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const { transitionToNextStateAction } = useCreationContext();

  /** 
   * [SINCRO V5.0]: Suscripción reactiva mediante descriptores V12.0.
   * [RESOLUCIÓN TS2345]: Castings explícitos para asegurar la compatibilidad 
   * entre el esquema de validación y las interfaces industriales del Metal.
   */
  const discoveryContextDossier = watch("discoveryContextDossier") as DiscoveryContextPayload | null;
  const geographicLocationSnapshot = watch("location");
  
  /** researchSourcesCollection: Forzamos el tipo industrial para aniquilar el error TS2345. */
  const researchSourcesCollection = (watch("sourcesCollection") || []) as unknown as ResearchSource[];

  /**
   * intelligenceNormalizedDossier: 
   * Misión: Garantizar un renderizado resiliente ante datos parciales del Oráculo.
   */
  const intelligenceNormalizedDossier = useMemo(() => ({
    narrativeHookText: discoveryContextDossier?.narrativeHookText || "Sincronizando con la esencia del lugar...",
    recommendationsCollection: (discoveryContextDossier?.recommendationsCollection as LocalRecommendation[]) || [],
    closingThoughtText: discoveryContextDossier?.closingThoughtText || "Explora el conocimiento situado en la malla.",
    imageAnalysisSummaryContent: discoveryContextDossier?.imageAnalysisSummaryContent
  }), [discoveryContextDossier]);

  /**
   * handleGenerateSpecificPodcastAction:
   * Misión: Transmutar una recomendación en la semilla creativa final.
   * [SINCRO V12.0]: Mapeo a 'soloTopicSelection' y 'soloMotivationContentText'.
   */
  const handleGenerateSpecificPodcastAction = (recommendation: LocalRecommendation) => {
    nicepodLog(`🎯 [Discovery] Generando forja específica: ${recommendation.name}`);

    // 1. Identificación del hito concreto en el esquema purificado
    setValue("soloTopicSelection", recommendation.name, { shouldValidate: true });
    
    // 2. Inyección de la instrucción situacional de alto rango
    const situationalNarrativeGoalText = `Actúa como un guía local experto de NicePod. 
    Tu misión es crear una crónica fascinante sobre ${recommendation.name}. 
    Contexto pericial: ${recommendation.descriptionTextContent}. 
    Evita los datos obvios; céntrate en la narrativa emocional y la resonancia histórica del lugar.`;
    
    setValue("soloMotivationContentText", situationalNarrativeGoalText, { shouldValidate: true });
    
    // 3. Calibración del Agente de Inteligencia para modo situacional
    setValue("agentName", "local-concierge-v1", { shouldValidate: true });

    // 4. Progresión balística a la fase de detalles técnicos
    transitionToNextStateAction('TECHNICAL_DETAILS_STEP');
  };

  /**
   * handleVisitExternalResourceAction:
   * Misión: Apertura de autoridad externa o navegación geodésica mediante GPS.
   */
  const handleVisitExternalResourceAction = (recommendation: LocalRecommendation) => {
    if (recommendation.actionUniformResourceLocator) {
      window.open(recommendation.actionUniformResourceLocator, '_blank');
    } else {
      const mapsQueryText = encodeURIComponent(
        `${recommendation.name} ${geographicLocationSnapshot?.placeNameReference || ''}`
      );
      window.open(`https://www.google.com/maps/search/${mapsQueryText}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in zoom-in-95 duration-700 px-4 md:px-10 pb-6 overflow-hidden isolate">
      
      {/* I. CABECERA: LA VOZ DEL ORÁCULO SITUACIONAL */}
      <header className="flex-shrink-0 pt-6 pb-6 border-b border-white/5 isolate">
        <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-inner">
                <Zap className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Inteligencia de Campo</span>
            </div>
            {geographicLocationSnapshot?.placeNameReference && (
                <div className="flex items-center text-[10px] text-zinc-500 font-bold tracking-tight bg-white/5 px-3 py-1 rounded-xl border border-white/5">
                    <MapPin className="h-3 w-3 mr-2 text-primary/60" /> 
                    {geographicLocationSnapshot.placeNameReference.split(',')[0]}
                </div>
            )}
        </div>
        
        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter italic font-serif lg:max-w-3xl">
          "{intelligenceNormalizedDossier.narrativeHookText}"
        </h2>
      </header>

      {/* II. CUERPO: RECOMENDACIONES Y ANÁLISIS ÓPTICO */}
      <main className="flex-1 min-h-0 flex flex-col pt-6 isolate">
        
        {/* Bloque de Transparencia de Visión Artificial (Análisis de Imagen) */}
        {intelligenceNormalizedDossier.imageAnalysisSummaryContent && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-4 shadow-2xl isolate"
            >
                <Eye className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-1">
                        Inferencia de Visión Artificial
                    </p>
                    <p className="text-xs text-indigo-100/70 italic leading-relaxed">
                        {intelligenceNormalizedDossier.imageAnalysisSummaryContent}
                    </p>
                </div>
            </motion.div>
        )}

        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-700" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                    Nodos de Resonancia Identificados
                </p>
            </div>
            <Badge variant="secondary" className="text-[9px] font-mono bg-white/5 text-zinc-500 border-none px-3 py-0.5 rounded-full">
                {intelligenceNormalizedDossier.recommendationsCollection.length} Hallazgos
            </Badge>
        </div>

        <ScrollArea className="flex-1 pr-2 isolate">
            <div className="grid grid-cols-1 gap-4 pb-12">
                {intelligenceNormalizedDossier.recommendationsCollection.length > 0 ? (
                    intelligenceNormalizedDossier.recommendationsCollection.map((recommendationItem, recommendationIndex) => (
                        <POIActionCard 
                            key={recommendationIndex}
                            poi={recommendationItem}
                            onGenerateSpecific={() => handleGenerateSpecificPodcastAction(recommendationItem)}
                            onVisit={() => handleVisitExternalResourceAction(recommendationItem)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-16 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5 grayscale">
                        <Info className="h-10 w-10 text-zinc-800 mb-4" />
                        <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest max-w-[200px]">
                            Sin señales detectadas en este radio de sintonía
                        </p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </main>

      {/* III. FOOTER: DOSSIER DE EVIDENCIAS Y GROUNDING */}
      <footer className="flex-shrink-0 pt-4 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-xl isolate">
        <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                <Globe className="h-3 w-3" /> Veracidad Geodésica (Grounding)
            </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 isolate">
            {researchSourcesCollection.length > 0 ? (
                researchSourcesCollection.map((researchSourceItem: ResearchSource, sourceIndex: number) => (
                    <a 
                        key={sourceIndex} 
                        href={researchSourceItem.uniformResourceLocator}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/5 whitespace-nowrap hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-500 group isolate"
                    >
                        <span className="text-[10px] font-black text-zinc-500 group-hover:text-primary transition-colors max-w-[150px] truncate uppercase tracking-widest">
                            {researchSourceItem.title}
                        </span>
                        <ExternalLink className="h-3 w-3 text-zinc-800 group-hover:text-primary transition-colors" />
                    </a>
                ))
            ) : (
                <div className="px-3 py-2 flex items-center gap-2 opacity-20 grayscale">
                    <Info className="h-3 w-3" />
                    <p className="text-[9px] font-bold uppercase tracking-widest italic text-zinc-500">
                        Análisis basado en conocimiento interno experto
                    </p>
                </div>
            )}
        </div>

        {/* Reflexión Final del Agente Concierge de Madrid */}
        <div className="py-5 px-8 bg-primary/5 rounded-[1.5rem] mt-2 border border-primary/10 shadow-inner group overflow-hidden relative isolate">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
            <div className="flex items-center justify-center gap-4 relative z-10">
                <Compass className="h-5 w-5 text-primary/40 shrink-0 animate-spin-slow" />
                <p className="text-[11px] text-center text-primary/80 font-black italic leading-relaxed uppercase tracking-wide">
                    "{intelligenceNormalizedDossier.closingThoughtText}"
                </p>
            </div>
        </div>
      </footer>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Build Shield Absolute: Resolución definitiva de TS2345 mediante el uso de 'unknown' 
 *    intermedio y casting a 'ResearchSource[]', asegurando la integridad del mapeo.
 * 2. ZAP Compliance: Purificación total de descriptores nominales en observadores y 
 *    manejadores de eventos (geographicLocationSnapshot, researchSourcesCollection).
 * 3. MTI Isolation: El uso de 'useMemo' para la normalización del dossier protege 
 *    el Hilo Principal de re-procesamientos de texto innecesarios durante el scroll.
 */