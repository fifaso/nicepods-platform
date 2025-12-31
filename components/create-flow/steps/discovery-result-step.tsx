// components/create-flow/steps/discovery-result-step.tsx
// VERSIÓN: 3.0 (Master Intelligence Reveal - Full Type Safety & Vision Transparency)

"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../shared/context";
import { 
  MapPin, 
  Globe, 
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
  Compass,
  Zap,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { POIActionCard } from "@/components/ui/poi-action-card";
import { LocalRecommendation, ResearchSource, DiscoveryContextPayload } from "@/types/podcast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function DiscoveryResultStep() {
  // Sincronización con el formulario maestro y el contexto de navegación
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();

  // Suscripción reactiva a los datos del orquestador
  const discoveryContext = watch("discovery_context") as DiscoveryContextPayload | null;
  const sources = watch("sources") || [];
  const location = watch("location");

  /**
   * Dossier Normalizado: 
   * Garantiza que el renderizado no falle si la IA devuelve datos parciales.
   */
  const dossier = useMemo(() => ({
    narrative_hook: discoveryContext?.narrative_hook || "Sincronizando con la esencia del lugar...",
    recommendations: (discoveryContext?.recommendations as LocalRecommendation[]) || [],
    closing_thought: discoveryContext?.closing_thought || "Explora el conocimiento situado.",
    vision_summary: discoveryContext?.image_analysis_summary
  }), [discoveryContext]);

  /**
   * handleGenerateSpecific
   * Transforma una recomendación del dossier en la semilla creativa para el podcast final.
   */
  const handleGenerateSpecific = (poi: LocalRecommendation) => {
    // 1. Identificamos el tema concreto
    setValue("solo_topic", poi.name, { shouldValidate: true });
    
    // 2. Inyectamos la instrucción situacional enriquecida
    const situationalGoal = `Actúa como un guía local experto y sofisticado. 
    Tu misión es crear un podcast fascinante sobre ${poi.name}. 
    Contexto de investigación: ${poi.description}. 
    Evita los datos obvios y céntrate en la narrativa emocional y secreta del lugar.`;
    
    setValue("solo_motivation", situationalGoal, { shouldValidate: true });
    
    // 3. Forzamos el uso del Agente Concierge para este hilo
    setValue("agentName", "local-concierge-v1", { shouldValidate: true });

    // 4. Progresamos a la configuración de duración y profundidad
    transitionTo('DETAILS_STEP');
  };

  /**
   * handleVisitSite: Apertura de recursos externos o navegación GPS.
   */
  const handleVisitSite = (poi: LocalRecommendation) => {
    if (poi.action_url) {
      window.open(poi.action_url, '_blank');
    } else {
      const mapsQuery = encodeURIComponent(`${poi.name} ${location?.placeName || ''}`);
      window.open(`https://www.google.com/maps/search/${mapsQuery}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in zoom-in-95 duration-700 px-4 md:px-10 pb-6 overflow-hidden">
      
      {/* 1. HEADER: LA VOZ DE LA IA SITUACIONAL */}
      <header className="flex-shrink-0 pt-6 pb-6 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Inteligencia de Campo</span>
            </div>
            {location?.placeName && (
                <div className="flex items-center text-[10px] text-muted-foreground font-bold tracking-tight bg-white/5 px-2 py-1 rounded-md">
                    <MapPin className="h-3 w-3 mr-1 text-primary/60" /> {location.placeName.split(',')[0]}
                </div>
            )}
        </div>
        
        <h2 className="text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tighter italic lg:max-w-3xl">
          "{dossier.narrative_hook}"
        </h2>
      </header>

      {/* 2. RECOMENDACIONES Y ANÁLISIS VISUAL */}
      <main className="flex-1 min-h-0 flex flex-col pt-6">
        
        {/* Bloque de Transparencia Visual (Solo si hubo foto) */}
        {dossier.vision_summary && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-3"
            >
                <Eye className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Visión Artificial Identificada</p>
                    <p className="text-xs text-indigo-100/70 italic leading-relaxed">
                        {dossier.vision_summary}
                    </p>
                </div>
            </motion.div>
        )}

        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    Opciones de Resonancia Detectadas
                </p>
            </div>
            <Badge variant="secondary" className="text-[9px] font-mono bg-white/5 text-muted-foreground border-none px-2 py-0">
                {dossier.recommendations.length} Hallazgos
            </Badge>
        </div>

        <ScrollArea className="flex-1 pr-2">
            <div className="grid grid-cols-1 gap-4 pb-12">
                {dossier.recommendations.length > 0 ? (
                    dossier.recommendations.map((poi, idx) => (
                        <POIActionCard 
                            key={idx}
                            poi={poi}
                            onGenerateSpecific={handleGenerateSpecific}
                            onVisit={handleVisitSite}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-16 text-center bg-secondary/5 rounded-[2.5rem] border border-dashed border-border/40">
                        <Info className="h-10 w-10 text-muted-foreground/10 mb-4" />
                        <p className="text-sm text-muted-foreground font-medium max-w-[200px]">
                            No hay puntos específicos registrados en este radio.
                        </p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </main>

      {/* 3. FOOTER: TRANSPARENCIA 360 Y CIERRE */}
      <footer className="flex-shrink-0 pt-4 mt-auto border-t border-white/5 bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                <Globe className="h-3 w-3" /> Fuentes de Verdad (Grounding)
            </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide px-1">
            {sources.length > 0 ? (
                sources.map((source: ResearchSource, idx: number) => (
                    <a 
                        key={idx} 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-white/5 whitespace-nowrap hover:bg-secondary/40 hover:border-primary/20 transition-all duration-300 group"
                    >
                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors max-w-[150px] truncate">
                            {source.title}
                        </span>
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                    </a>
                ))
            ) : (
                <div className="px-2 py-1.5 flex items-center gap-2 opacity-30">
                    <Info className="h-3 w-3" />
                    <p className="text-[9px] font-medium italic">Análisis basado en conocimiento interno experto.</p>
                </div>
            )}
        </div>

        {/* Reflexión Final del Concierge */}
        <div className="py-4 px-8 bg-primary/5 rounded-2xl mt-2 border border-primary/5 shadow-inner">
            <div className="flex items-center justify-center gap-3">
                <Compass className="h-4 w-4 text-primary/40 shrink-0" />
                <p className="text-[11px] text-center text-primary/80 font-bold italic leading-relaxed">
                    "{dossier.closing_thought}"
                </p>
            </div>
        </div>
      </footer>

    </div>
  );
}