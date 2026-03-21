// components/geo/poi-preview-card.tsx
// VERSIÓN: 2.0 (NicePod Discovery Dossier - GO-Experience Edition)
// Misión: Presentar el hallazgo urbano con legibilidad industrial y estética de radar.
// [ESTABILIZACIÓN]: Integración de High-Contrast Mode, Sincronía de Resonancia y Física Táctil.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  Clock,
  MapPin,
  X,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- INFRAESTRUCTURA UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getSafeAsset } from "@/lib/utils";

/**
 * INTERFAZ: POIPreviewCardProps
 */
interface POIPreviewCardProps {
  poi: {
    id: string;
    name: string;
    category: string;
    historical_fact?: string;
    cover_image_url?: string;
  } | null;
  /** distance: Telemetría en metros desde el Voyager al nodo. */
  distance: number | null;
  /** isResonating: TRUE si el Voyager está en el radio físico de sintonía. */
  isResonating: boolean;
  onClose: () => void;
}

/**
 * POIPreviewCard: La terminal de información que emerge al detectar un Eco.
 * Diseñada para máxima legibilidad bajo luz solar (High Contrast).
 */
export function POIPreviewCard({
  poi,
  distance,
  isResonating,
  onClose
}: POIPreviewCardProps) {

  // PROTOCOLO DE IMAGEN: Fallback Aurora Certificado.
  const coverImage = getSafeAsset(poi?.cover_image_url, 'cover');

  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          initial={{ y: "110%", opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "110%", opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="fixed bottom-10 left-0 right-0 z-[100] px-4 md:px-0 flex justify-center pointer-events-none"
        >
          {/* 
              I. EL BASTIDOR SOBERANO (DOSSIER CHASSIS) 
              Fondo sólido #080808 para contraste absoluto sobre el mapa WebGL.
          */}
          <div className="w-full max-w-md bg-[#080808] border border-white/10 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto relative group">

            {/* Botón de Cierre con Inercia */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-40 p-2.5 rounded-full bg-black/60 text-white/40 hover:text-white hover:bg-black/80 transition-all active:scale-90"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col">

              {/* II. SECTOR VISUAL (CAPA SUPERIOR) */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={coverImage}
                  alt={poi.name}
                  fill
                  sizes="450px"
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-90"
                  priority
                />

                {/* Gradiente de integración industrial */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" />

                {/* Badge de Categoría con Estilo de Identificación */}
                <div className="absolute bottom-5 left-8">
                  <Badge className={cn(
                    "font-black text-[9px] uppercase tracking-[0.25em] px-4 py-1.5 rounded-lg border-none shadow-xl",
                    isResonating ? "bg-primary text-white" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {poi.category}
                  </Badge>
                </div>

                {/* Radar de Proximidad Visual */}
                {isResonating && (
                  <div className="absolute top-6 left-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
                    <Activity size={10} className="text-primary animate-pulse" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Enlace Activo</span>
                  </div>
                )}
              </div>

              {/* III. SECTOR DE INTELIGENCIA (CONTENIDO) */}
              <div className="p-8 pt-2 space-y-6">

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className={cn("transition-colors", isResonating ? "text-primary animate-pulse" : "text-zinc-600")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 tabular-nums">
                      {distance ? `${distance} Metros de tu Nodo` : "Sincronizando..."}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {poi.name}
                  </h3>
                </div>

                {/* EL HECHO ATÓMICO (Capital Intelectual) */}
                {poi.historical_fact && (
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                    <p className="text-[12px] text-zinc-400 font-medium leading-relaxed italic pl-5 line-clamp-2">
                      "{poi.historical_fact}"
                    </p>
                  </div>
                )}

                {/* IV. ACCIÓN SOBERANA (TUNER) */}
                <div className="pt-2">
                  <Link href={`/map/poi/${poi.id}`} className="block">
                    <Button
                      className={cn(
                        "w-full h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 group/btn relative overflow-hidden",
                        isResonating
                          ? "bg-primary text-white hover:brightness-110 shadow-primary/20"
                          : "bg-white text-black hover:bg-zinc-200"
                      )}
                    >
                      {/* Efecto de barrido táctico */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />

                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Zap size={16} className={cn(isResonating && "fill-current")} />
                        {isResonating ? "SINTONIZAR AHORA" : "EXPLORAR REGISTRO"}
                        <ChevronRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </div>

                {/* Tiempo Estimado de Consumo */}
                <div className="flex justify-center items-center gap-3 opacity-20">
                  <Clock size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Crónica de 2 minutos • Calidad Broadcast</span>
                </div>

              </div>
            </div>

            {/* V. BARRA DE ESTADO TÉCNICO (NSP PULSE) */}
            <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
              {isResonating && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
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
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Diseño GO-Experience: Se aumentó el tamaño de la tipografía y los radios
 *    de borde (3rem) para facilitar la interacción táctil con una sola mano.
 * 2. Jerarquía de Resonancia: El botón principal muta de color y texto según
 *    el estado 'isResonating', transformando una navegación pasiva en una 
 *    acción de campo inmediata.
 * 3. Sincronía Aurora: El uso del efecto shimmer y los gradientes internos 
 *    mantiene el componente alineado con el motor atmosférico de NicePod.
 */