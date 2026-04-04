/**
 * ARCHIVO: components/geo/poi-preview-card.tsx
 * VERSIÓN: 3.0 (NicePod Discovery Dossier - Multidimensional Intelligence Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Presentar el hallazgo urbano proyectando todas las dimensiones de capital 
 * intelectual (Espacio, Tiempo, Misión y Referencias) con legibilidad industrial.
 * [REFORMA V3.0]: Integración de HistoricalEpoch, ReferenceUrl y Taxonomía de 2 capas.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  Clock,
  MapPin,
  X,
  Zap,
  ExternalLink,
  History,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- INFRAESTRUCTURA UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getSafeAsset, nicepodLog } from "@/lib/utils";

// --- SOBERANÍA DE TIPOS (V7.5) ---
import { 
  CategoryEntity, 
  CategoryMission, 
  HistoricalEpoch 
} from "@/types/geo-sovereignty";

/**
 * INTERFAZ SOBERANA: POIPreviewCardProps
 * Misión: Reflejar el contrato completo de la Bóveda NKV.
 */
interface POIPreviewCardProps {
  pointOfInterest: {
    identification: string;
    name: string;
    categoryMission: CategoryMission;
    categoryEntity: CategoryEntity;
    historicalEpoch: HistoricalEpoch;
    historicalFact?: string;
    coverImageUniformResourceLocator?: string;
    externalReferenceUniformResourceLocator?: string;
  } | null;
  /** distanceMeters: Telemetría en metros desde el Voyager al nodo. */
  distanceMeters: number | null;
  /** isResonating: TRUE si el Voyager está en el radio de sintonía física. */
  isResonating: boolean;
  onClose: () => void;
}

/**
 * DICCIONARIO DE TRADUCCIÓN HUMANA
 * Misión: Convertir Enums técnicos en etiquetas legibles para el Voyager.
 */
const EPOCH_LABELS: Record<HistoricalEpoch, string> = {
  origen_geologico: "Era Geológica",
  pre_industrial: "Pre-Industrial",
  siglo_de_oro: "Siglo de Oro",
  ilustracion_borbonica: "Ilustración",
  modernismo_expansion: "Modernismo",
  contemporaneo: "Contemporáneo",
  futuro_especulativo: "Futuro",
  atemporal: "Atemporal"
};

/**
 * POIPreviewCard: La terminal de información inteligente de NicePod.
 */
export function POIPreviewCard({
  pointOfInterest,
  distanceMeters,
  isResonating,
  onClose
}: POIPreviewCardProps) {

  // PROTOCOLO DE IMAGEN: Fallback Aurora Certificado.
  const coverImageSource = getSafeAsset(pointOfInterest?.coverImageUniformResourceLocator, 'cover');

  return (
    <AnimatePresence>
      {pointOfInterest && (
        <motion.div
          initial={{ y: "110%", opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "110%", opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="fixed bottom-10 left-0 right-0 z-[100] px-4 md:px-0 flex justify-center pointer-events-none"
        >
          {/* I. EL BASTIDOR SOBERANO (CHASSIS INDUSTRIAL) */}
          <div className="w-full max-w-md bg-[#080808] border border-white/10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.95)] overflow-hidden pointer-events-auto relative group isolate">

            {/* Botón de Cierre con Inercia Atómica */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-40 p-2.5 rounded-full bg-black/60 text-white/40 hover:text-white hover:bg-black/80 transition-all active:scale-90 border border-white/5"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col">

              {/* II. SECTOR VISUAL (ATMÓSFERA) */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={coverImageSource}
                  alt={pointOfInterest.name}
                  fill
                  className="object-cover transition-transform duration-[3000ms] group-hover:scale-110 opacity-80"
                  priority
                />

                {/* Gradiente de Sellado */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

                {/* Badge de Misión (Taxonomía Nivel 1) */}
                <div className="absolute bottom-6 left-8 flex gap-2">
                  <Badge className={cn(
                    "font-black text-[8px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-lg border-none shadow-2xl",
                    isResonating ? "bg-primary text-white" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {pointOfInterest.categoryMission.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Radar de Sintonía Activa */}
                {isResonating && (
                  <div className="absolute top-6 left-8 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30">
                    <Activity size={10} className="text-emerald-400 animate-pulse" />
                    <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Enlace de Resonancia</span>
                  </div>
                )}
              </div>

              {/* III. SECTOR DE INTELIGENCIA (DOSSIER) */}
              <div className="p-8 pt-4 space-y-6">

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className={cn("transition-colors", isResonating ? "text-primary animate-pulse" : "text-zinc-600")} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 tabular-nums">
                        {distanceMeters ? `${distanceMeters} Metros` : "Calculando..."}
                      </span>
                    </div>
                    
                    {/* INDICADOR TEMPORAL (RELÓJ SOBERANO) */}
                    <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
                      <History size={10} className="text-zinc-500" />
                      <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">
                        {EPOCH_LABELS[pointOfInterest.historicalEpoch]}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-[0.9] pr-8">
                    {pointOfInterest.name}
                  </h3>
                </div>

                {/* EL HECHO ATÓMICO (SÍNTESIS DEL ORÁCULO) */}
                {pointOfInterest.historicalFact && (
                  <div className="relative group/fact">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 rounded-full transition-all group-hover/fact:bg-primary" />
                    <p className="text-[13px] text-zinc-400 font-medium leading-relaxed italic pl-6 line-clamp-2">
                      "{pointOfInterest.historicalFact}"
                    </p>
                  </div>
                )}

                {/* IV. ACCIONES SOBERANAS (TUNER & BRIDGE) */}
                <div className="space-y-4">
                  <Link href={`/map/pointOfInterest/${pointOfInterest.identification}`} className="block">
                    <Button
                      className={cn(
                        "w-full h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all duration-500 group/btn relative overflow-hidden",
                        isResonating
                          ? "bg-primary text-white hover:brightness-110 shadow-primary/20"
                          : "bg-white text-black hover:bg-zinc-200"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2.5s_infinite]" />

                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Zap size={16} className={cn(isResonating && "fill-current text-white")} />
                        {isResonating ? "SINTONIZAR CRÓNICA" : "EXPLORAR DOSSIER"}
                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>

                  {/* PUENTE DE SABIDURÍA (ACCIÓN SECUNDARIA) */}
                  {pointOfInterest.externalReferenceUniformResourceLocator && (
                    <a 
                      href={pointOfInterest.externalReferenceUniformResourceLocator} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all group/link"
                    >
                      <ExternalLink size={12} className="text-zinc-500 group-hover/link:text-primary transition-colors" />
                      <span className="text-[9px] font-black text-zinc-500 group-hover/link:text-zinc-300 uppercase tracking-[0.2em]">
                        Consultar Fuente de Verdad
                      </span>
                    </a>
                  )}
                </div>

                {/* CERTIFICACIÓN DE CALIDAD */}
                <div className="flex justify-center items-center gap-3 opacity-30 pt-2">
                  <ShieldCheck size={10} />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Peritaje IA Certificado • Agente 42</span>
                </div>

              </div>
            </div>

            {/* V. BARRA DE ESTADO TÉCNICO (NSP PULSE) */}
            <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
              {isResonating && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                />
              )}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Multidimensional Projection: El componente ha sido actualizado para reflejar 
 *    el Reloj Soberano (Época) y la Fuente de Verdad externa, permitiendo al 
 *    Voyager percibir la profundidad del peritaje realizado en la captura.
 * 2. Subscription Value: El acceso directo a la "Fuente de Verdad" (Wikipedia/PDF) 
 *    proporciona la prueba física inmediata de que NicePod no alucina, sino que 
 *    ancla sabiduría real, justificando el Tier Premium.
 * 3. Contract Integrity: Se han eliminado todas las abreviaciones y se ha 
 *    sincronizado el componente con el contrato V7.5 de tipos geoespaciales.
 */