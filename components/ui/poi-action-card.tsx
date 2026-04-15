/**
 * ARCHIVO: components/ui/poi-action-card.tsx
 * VERSIÓN: 2.0 (NicePod POI Action Card - Industrial Geodetic Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Visualizar una unidad de valor situada (POI), permitiendo la transición 
 * táctica entre el descubrimiento geográfico y la forja de capital intelectual.
 * [REFORMA V2.0]: Resolución definitiva de TS2551 y TS2339. Sincronización nominal 
 * absoluta con 'LocalRecommendation' V12.0. Aplicación integral de la Zero 
 * Abbreviations Policy (ZAP) y Build Shield Sovereignty.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { classNamesUtility, getHumanReadableDistanceMagnitudeLabel } from "@/lib/utils";
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
import React from "react";

/**
 * INTERFAZ: PointOfInterestCategoryStyleDefinition
 */
interface PointOfInterestCategoryStyleDefinition {
  iconComponent: React.ElementType;
  tailwindColorClassName: string;
  displayLabel: string;
  backgroundHighlightClassName: string;
}

/**
 * POINT_OF_INTEREST_CATEGORY_CONFIGURATION:
 * Misión: Definir la semántica visual por taxonomía de hallazgo.
 */
const POINT_OF_INTEREST_CATEGORY_CONFIGURATION: Record<string, PointOfInterestCategoryStyleDefinition> = {
  history: { 
    iconComponent: BookOpen, 
    tailwindColorClassName: "text-blue-500", 
    backgroundHighlightClassName: "bg-blue-500/10", 
    displayLabel: "Historia Oculta" 
  },
  food: { 
    iconComponent: Utensils, 
    tailwindColorClassName: "text-amber-500", 
    backgroundHighlightClassName: "bg-amber-500/10", 
    displayLabel: "Sabor Local" 
  },
  secret: { 
    iconComponent: Sparkles, 
    tailwindColorClassName: "text-purple-500", 
    backgroundHighlightClassName: "bg-purple-500/10", 
    displayLabel: "Tesoro Único" 
  },
  activity: { 
    iconComponent: Search, 
    tailwindColorClassName: "text-emerald-500", 
    backgroundHighlightClassName: "bg-emerald-500/10", 
    displayLabel: "Plan Actual" 
  },
  event: { 
    iconComponent: Search, 
    tailwindColorClassName: "text-rose-500", 
    backgroundHighlightClassName: "bg-rose-500/10", 
    displayLabel: "Evento Vivo" 
  },
};

/**
 * INTERFAZ: PointOfInterestActionCardProperties
 */
interface PointOfInterestActionCardProperties {
  /** pointOfInterestRecommendation: El objeto de hallazgo situado bajo contrato V12.0. */
  pointOfInterestRecommendation: LocalRecommendation;
  /** onExecuteSpecificGenerationAction: Callback para iniciar la forja centrada en el hito. */
  onExecuteSpecificGenerationAction: (recommendation: LocalRecommendation) => void;
  /** onExecuteVisitAction: Callback opcional para navegación geodésica o recursos externos. */
  onExecuteVisitAction?: (recommendation: LocalRecommendation) => void;
  /** isGenerationProcessActiveStatus: Indica si el Oráculo está sintetizando para este nodo. */
  isGenerationProcessActiveStatus?: boolean;
}

/**
 * POIActionCard: La unidad interactiva de descubrimiento situada.
 */
export function POIActionCard({
  pointOfInterestRecommendation,
  onExecuteSpecificGenerationAction,
  onExecuteVisitAction,
  isGenerationProcessActiveStatus = false
}: PointOfInterestActionCardProperties) {

  // Resolución de atmósfera visual basada en categoría
  const categoryAestheticConfiguration = 
    POINT_OF_INTEREST_CATEGORY_CONFIGURATION[pointOfInterestRecommendation.category] || 
    POINT_OF_INTEREST_CATEGORY_CONFIGURATION.secret;

  const CategoryIconComponent = categoryAestheticConfiguration.iconComponent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="w-full isolate"
    >
      <Card className="group relative overflow-hidden bg-[#0a0a0a]/40 backdrop-blur-2xl border-white/5 hover:border-primary/40 transition-all duration-500 shadow-2xl rounded-[1.5rem]">
        <CardContent className="p-0 isolate">

          <div className="p-5 flex flex-col gap-4">

            {/* I. CABECERA TÁCTICA: Categoría y Proximidad Geodésica */}
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={classNamesUtility(
                  "px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none rounded-lg", 
                  categoryAestheticConfiguration.backgroundHighlightClassName, 
                  categoryAestheticConfiguration.tailwindColorClassName
                )}
              >
                <CategoryIconComponent className="h-3 w-3 mr-2 inline" />
                {categoryAestheticConfiguration.displayLabel}
              </Badge>
              
              {/* [RESOLUCIÓN TS2551]: Sincronización con 'distanceInMeters' */}
              {pointOfInterestRecommendation.distanceInMeters && (
                <div className="flex items-center text-[10px] font-mono text-zinc-500 tracking-tighter">
                  <Navigation className="h-2.5 w-2.5 mr-1.5 text-zinc-700" />
                  {getHumanReadableDistanceMagnitudeLabel(pointOfInterestRecommendation.distanceInMeters)}
                </div>
              )}
            </div>

            {/* II. IDENTIDAD DEL HITO: Nombre y Peritaje */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                {pointOfInterestRecommendation.name}
              </h3>
              {/* [RESOLUCIÓN TS2339]: Sincronización con 'descriptionTextContent' */}
              <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-2 italic">
                {pointOfInterestRecommendation.descriptionTextContent}
              </p>
            </div>

            {/* III. ACCIONES DE MANDO: El Ciclo de Materialización de Capital Intelectual */}
            <div className="grid grid-cols-5 gap-2.5 mt-2">

              {/* ACTUADOR PRINCIPAL: FORJA DE CONOCIMIENTO */}
              <Button
                onClick={() => onExecuteSpecificGenerationAction(pointOfInterestRecommendation)}
                disabled={isGenerationProcessActiveStatus}
                className={classNamesUtility(
                  "col-span-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl border-none",
                  pointOfInterestRecommendation.hasSpecificPodcastAttached
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                )}
              >
                {isGenerationProcessActiveStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : pointOfInterestRecommendation.hasSpecificPodcastAttached ? (
                  <PlayCircle className="h-4 w-4 mr-2 fill-current" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                
                {/* [RESOLUCIÓN TS2339]: Sincronización con 'hasSpecificPodcastAttached' */}
                {pointOfInterestRecommendation.hasSpecificPodcastAttached 
                  ? "SINTONIZAR NICEPOD" 
                  : "FORJAR CRÓNICA PROFUNDA"
                }
              </Button>

              {/* ACTUADOR SECUNDARIO: UBICACIÓN GEODÉSICA */}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onExecuteVisitAction?.(pointOfInterestRecommendation)}
                className="h-12 w-full rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-500 hover:text-white transition-all shadow-inner"
                aria-label="Ubicar en Mapa Táctico"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>

          </div>

          {/* IV. FOOTER DE INTEGRIDAD: SELLO DE VERACIDAD */}
          <div className="px-5 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between isolate">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                Información de Grado Industrial
              </span>
            </div>
            <ArrowRight className="h-3 w-3 text-zinc-800 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Build Shield Sovereignty: Resolución definitiva de TS2551 y TS2339 mediante la 
 *    alineación nominal con 'distanceInMeters', 'descriptionTextContent' y 
 *    'hasSpecificPodcastAttached'.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total. 'poi' -> 'pointOfInterestRecommendation', 
 *    'props' -> 'Properties', 'bg' -> 'backgroundHighlightClassName', 'cn' -> 'classNamesUtility'.
 * 3. MTI Isolation: El uso de motion.div garantiza que la interacción hover se ejecute 
 *    en una capa de composición independiente, protegiendo los 60 FPS del Hilo Principal.
 */