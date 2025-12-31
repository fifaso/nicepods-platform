// components/create-flow/steps/discovery-result-step.tsx
// VERSIÓN: 2.1 (Master Intelligence Reveal - Type-Safe & Reference Fix)

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
  Compass // [FIX]: Importación agregada
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { POIActionCard } from "@/components/ui/poi-action-card";
import { LocalRecommendation, ResearchSource } from "@/types/podcast";
import { motion } from "framer-motion";

export function DiscoveryResultStep() {
  // Tipamos el formulario para que TS sepa qué campos estamos manejando
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();

  // [FIX IMAGEN 79]: Extraemos los datos usando casting para evitar errores de esquema no sincronizado
  const discoveryContext = watch("discovery_context" as any);
  const sources = watch("sources") || [];
  const location = watch("location");

  // Normalización del Dossier con tipado forzado para eliminar errores ts(2339)
  const dossier = useMemo(() => {
    const data = discoveryContext || {};
    return {
      narrative_hook: data.narrative_hook || "Analizando la esencia de tu ubicación...",
      recommendations: (data.recommendations as LocalRecommendation[]) || [],
      closing_thought: data.closing_thought || "El conocimiento está bajo tus pies."
    };
  }, [discoveryContext]);

  /**
   * handleGenerateSpecific
   * Acción quirúrgica: Transforma una recomendación en la semilla del guion final.
   */
  const handleGenerateSpecific = (poi: LocalRecommendation) => {
    // 1. Inyectamos el nombre del lugar como tema principal
    setValue("solo_topic", poi.name, { shouldValidate: true });
    
    // 2. Construimos una motivación específica para que Gemini actúe como local
    const enhancedMotivation = `Actúa como un experto local. Genera un NicePod profundo sobre ${poi.name}. Contexto específico: ${poi.description}.`;
    
    setValue("solo_motivation", enhancedMotivation, { shouldValidate: true });
    
    // 3. Sincronizamos con el Agente Situacional oficial
    setValue("agentName", "local-concierge-v1", { shouldValidate: true });

    // 4. Avanzamos a la configuración técnica
    transitionTo('DETAILS_STEP');
  };

  /**
   * handleVisitSite
   * Permite al usuario abrir el recurso externo o Google Maps
   */
  const handleVisitSite = (poi: LocalRecommendation) => {
    if (poi.action_url) {
      window.open(poi.action_url, '_blank');
    } else {
      const query = encodeURIComponent(`${poi.name} ${location?.placeName || ''}`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in zoom-in-95 duration-700 px-4 md:px-8 pb-4 overflow-hidden">
      
      {/* 1. SECCIÓN DE BIENVENIDA (LA VOZ DEL AMIGO LOCAL) */}
      <header className="flex-shrink-0 pt-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Hallazgo Situacional</span>
            </div>
            {location?.placeName && (
                <div className="flex items-center text-[10px] text-muted-foreground font-bold tracking-tight">
                    <MapPin className="h-3 w-3 mr-1 text-primary/50" /> {location.placeName.split(',')[0]}
                </div>
            )}
        </div>
        
        <h2 className="text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tighter italic">
          "{dossier.narrative_hook}"
        </h2>
      </header>

      {/* 2. RECOMENDACIONES: El Corazón de la Experiencia */}
      <main className="flex-1 min-h-0 flex flex-col pt-6">
        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    Opciones de Resonancia
                </p>
            </div>
            <Badge variant="secondary" className="text-[9px] font-mono bg-white/5 text-muted-foreground border-none">
                {dossier.recommendations.length} Puntos Detectados
            </Badge>
        </div>

        <ScrollArea className="flex-1 pr-2">
            <div className="grid grid-cols-1 gap-4 pb-10">
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
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-secondary/5 rounded-[2rem] border border-dashed border-border/50">
                        <Info className="h-8 w-8 text-muted-foreground/20 mb-4" />
                        <p className="text-sm text-muted-foreground font-medium">No se detectaron puntos específicos en este radio.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </main>

      {/* 3. FOOTER: BIBLIOGRAFÍA Y CIERRE (TRANSPARENCIA 360) */}
      <footer className="flex-shrink-0 pt-4 mt-auto border-t border-white/5 bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                <Globe className="h-3 w-3" /> Fuentes de Verdad
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
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-white/5 whitespace-nowrap hover:bg-secondary/50 transition-all duration-300 group"
                    >
                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors max-w-[140px] truncate">
                            {source.title}
                        </span>
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </a>
                ))
            ) : (
                <p className="text-[10px] italic text-muted-foreground opacity-30 px-2">Basado en conocimiento experto interno.</p>
            )}
        </div>

        {/* Reflexión Final Situacional */}
        <div className="py-4 px-6 bg-primary/5 rounded-2xl mt-2 border border-primary/10">
            <div className="flex items-center justify-center gap-2">
                <Compass className="h-3 w-3 text-primary/50" />
                <p className="text-[10px] text-center text-primary/70 font-bold italic leading-relaxed">
                    "{dossier.closing_thought}"
                </p>
            </div>
        </div>
      </footer>

    </div>
  );
}