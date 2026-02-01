// components/ui/poi-action-card.tsx
// VERSIÓN: 1.0 (Situational Value Unit - Actionable POI Dashboard)

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LocalRecommendation } from "@/types/podcast";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Loader2,
  MapPin,
  Navigation,
  PlayCircle,
  Search,
  Sparkles,
  Utensils,
  Wand2
} from "lucide-react";

/**
 * CONFIGURACIÓN SEMÁNTICA POR CATEGORÍA
 */
const CATEGORY_CONFIG: Record<string, { icon: any, color: string, label: string, bg: string }> = {
  history: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", label: "Historia Oculta" },
  food: { icon: Utensils, color: "text-amber-500", bg: "bg-amber-500/10", label: "Sabor Local" },
  secret: { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", label: "Tesoro Único" },
  activity: { icon: Search, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Plan Actual" },
  event: { icon: Search, color: "text-rose-500", bg: "bg-rose-500/10", label: "Evento Vivo" },
};

interface POIActionCardProps {
  poi: LocalRecommendation;
  onGenerateSpecific: (poi: LocalRecommendation) => void;
  onVisit?: (poi: LocalRecommendation) => void;
  isGenerating?: boolean;
}

/**
 * POIActionCard
 * Componente estratégico para la curación de descubrimientos locales.
 */
export function POIActionCard({
  poi,
  onGenerateSpecific,
  onVisit,
  isGenerating = false
}: POIActionCardProps) {

  const config = CATEGORY_CONFIG[poi.category] || CATEGORY_CONFIG.secret;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card className="group relative overflow-hidden bg-card/30 backdrop-blur-xl border-border/40 hover:border-primary/40 transition-all duration-500 shadow-lg rounded-2xl">
        <CardContent className="p-0">

          <div className="p-5 flex flex-col gap-4">

            {/* 1. HEADER: Categoría y Distancia */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-none", config.bg, config.color)}>
                <config.icon className="h-3 w-3 mr-1.5 inline" />
                {config.label}
              </Badge>
              {poi.distance_meters && (
                <div className="flex items-center text-[10px] font-mono text-muted-foreground/60">
                  <Navigation className="h-2.5 w-2.5 mr-1" />
                  {poi.distance_meters}m
                </div>
              )}
            </div>

            {/* 2. INFO: Nombre y Descripción */}
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                {poi.name}
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                {poi.description}
              </p>
            </div>

            {/* 3. ACCIONES: El Loop de Valor */}
            <div className="grid grid-cols-5 gap-2 mt-2">

              {/* Botón Principal: Generar Audio Profundo */}
              <Button
                onClick={() => onGenerateSpecific(poi)}
                disabled={isGenerating}
                className={cn(
                  "col-span-4 h-11 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all active:scale-95 shadow-lg",
                  poi.has_specific_podcast
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-primary text-white hover:bg-primary/90"
                )}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : poi.has_specific_podcast ? (
                  <PlayCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                {poi.has_specific_podcast ? "ESCUCHAR NICEPOD" : "GENERAR PODCAST PROFUNDO"}
              </Button>

              {/* Botón Secundario: Ir al sitio / Ver info */}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onVisit?.(poi)}
                className="h-11 w-full rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>

          </div>

          {/* INDICADOR DE TRANSPARENCIA (Footer sutil) */}
          <div className="px-5 py-2 bg-black/5 dark:bg-white/5 border-t border-border/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Información Verificada</span>
            </div>
            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}