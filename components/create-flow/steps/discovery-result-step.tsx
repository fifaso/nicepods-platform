// components/create-flow/steps/discovery-result-step.tsx
// VERSIÓN: 1.0 (Intelligence Reveal - POI Curation & Transparency Hub)

"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../shared/context";
import { 
  Sparkles, 
  MapPin, 
  BookOpen, 
  Utensils, 
  Search, 
  Globe, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Mapeo de Iconos por Categoría de POI
 */
const CATEGORY_MAP: Record<string, { icon: any, color: string, label: string }> = {
  history: { icon: BookOpen, color: "text-blue-400", label: "Crónica Histórica" },
  food: { icon: Utensils, color: "text-amber-400", label: "Sabor Local" },
  secret: { icon: Sparkles, color: "text-purple-400", label: "Tesoro Oculto" },
  activity: { icon: Search, color: "text-emerald-400", label: "Plan Actual" },
  event: { icon: Search, color: "text-rose-400", label: "Evento Vivo" },
};

export function DiscoveryResultStep() {
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const { transitionTo } = useCreationContext();

  const discoveryContext = watch("discovery_context");
  const sources = watch("sources") || [];
  const location = watch("location");

  // Extraemos la data del dossier generado por el orquestador
  const dossier = discoveryContext || {
    narrative_hook: "Analizando tu ubicación...",
    recommendations: [],
    closing_thought: ""
  };

  /**
   * SELECCIÓN DE RECOMENDACIÓN
   * Si el usuario elige un punto específico, actualizamos la motivación
   * para que el guion final sea ultra-concreto sobre ese sitio.
   */
  const handleSelectRecommendation = (rec: any) => {
    setValue("solo_topic", rec.name);
    setValue("solo_motivation", `Profundiza en ${rec.name}: ${rec.description}. Usa un tono de experto local.`);
    // Avanzamos al paso de configuración técnica
    transitionTo('DETAILS_STEP');
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in zoom-in-95 duration-700 px-4 md:px-8 pb-4 overflow-hidden">
      
      {/* 1. NARRATIVE HEADER: El saludo del Amigo Local */}
      <div className="flex-shrink-0 pt-4 pb-6">
        <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                Escaneo Completado
            </Badge>
            {location?.placeName && (
                <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                    <MapPin className="h-3 w-3 mr-1" /> {location.placeName}
                </div>
            )}
        </div>
        <h2 className="text-xl md:text-3xl font-black text-foreground leading-tight tracking-tighter italic">
          "{dossier.narrative_hook}"
        </h2>
      </div>

      {/* 2. RECOMENDACIONES (Actionable Cards) */}
      <div className="flex-1 min-h-0 flex flex-col space-y-4">
        <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                <Layers className="h-3 w-3" /> Puntos de Resonancia Detectados
            </p>
            <span className="text-[10px] font-mono text-primary/40">{dossier.recommendations?.length || 0} Hallazgos</span>
        </div>

        <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-1 gap-3 pb-4">
                {dossier.recommendations?.map((rec: any, idx: number) => {
                    const Config = CATEGORY_MAP[rec.category] || CATEGORY_MAP.secret;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card 
                                onClick={() => handleSelectRecommendation(rec)}
                                className="group relative overflow-hidden bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                            >
                                <CardContent className="p-4 flex gap-4">
                                    <div className={cn("p-3 rounded-xl bg-background/50 border border-white/5 h-fit group-hover:scale-110 transition-transform", Config.color)}>
                                        <Config.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={cn("text-[9px] font-black uppercase tracking-tighter", Config.color)}>
                                                {Config.label}
                                            </p>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{rec.name}</h3>
                                        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{rec.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </ScrollArea>
      </div>

      {/* 3. FOOTER: Fuentes y Transparencia */}
      <div className="flex-shrink-0 pt-4 mt-2 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                <Globe className="h-3 w-3" /> Fuentes de Verdad
            </div>
            <div className="h-px flex-1 bg-white/5 mx-4" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sources.map((source: any, idx: number) => (
                <a 
                    key={idx} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-white/5 whitespace-nowrap hover:bg-secondary/50 transition-colors"
                >
                    <span className="text-[10px] font-medium text-muted-foreground max-w-[120px] truncate">{source.title}</span>
                    <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/40" />
                </a>
            ))}
            {sources.length === 0 && (
                <p className="text-[10px] italic text-muted-foreground opacity-50">Generado con red neuronal interna.</p>
            )}
        </div>

        {/* Pensamiento de Cierre */}
        <p className="mt-4 text-[10px] text-center text-muted-foreground/40 font-medium italic leading-relaxed px-6">
            "{dossier.closing_thought}"
        </p>
      </div>

    </div>
  );
}