// components/geo/poi-preview-card.tsx
// VERSIÓN: 1.0

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation2, 
  ChevronRight, 
  X, 
  Zap, 
  Clock, 
  MapPin,
  Play
} from "lucide-react";

// --- INFRAESTRUCTURA UI ---
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getSafeAsset } from "@/lib/utils";

// --- CONTRATOS DE DATOS ---
import { auroraButtonClass } from "@/components/navigation/shared/nav-styles";

/**
 * INTERFAZ: POIPreviewCardProps
 * Misión: Recibir la data del nodo seleccionado y la telemetría del GeoEngine.
 */
interface POIPreviewCardProps {
  poi: {
    id: string;
    name: string;
    category: string;
    historical_fact?: string;
    cover_image_url?: string;
  } | null;
  /**
   * distance: Distancia calculada en metros desde la posición del usuario.
   */
  distance: number | null;
  /**
   * isResonating: TRUE si el usuario está dentro del radio de activación física.
   */
  isResonating: boolean;
  onClose: () => void;
}

/**
 * COMPONENTE: POIPreviewCard
 * La ventana de descubrimiento cinemático sobre el mapa.
 */
export function POIPreviewCard({ 
  poi, 
  distance, 
  isResonating, 
  onClose 
}: POIPreviewCardProps) {

  // PROTOCOLO DE IMAGEN: Fallback Aurora si no existe carátula específica.
  const coverImage = getSafeAsset(poi?.cover_image_url, 'cover');

  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-0 right-0 z-[80] px-4 md:px-0 flex justify-center pointer-events-none"
        >
          {/* 
              I. EL BASTIDOR DE CRISTAL (MAIN CONTAINER) 
              Diseño Glassmorphism V2 con borde Aurora sutil.
          */}
          <div className="w-full max-w-lg bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto relative group">
            
            {/* Botón de Cierre Minimalista */}
            <button 
              onClick={onClose}
              className="absolute top-5 right-6 z-30 p-2 rounded-full bg-black/40 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              
              {/* II. ESCENARIO VISUAL (IMAGEN IZQUIERDA) */}
              <div className="relative w-full md:w-44 h-40 md:h-auto overflow-hidden">
                <Image 
                  src={coverImage}
                  alt={poi.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 176px"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent md:bg-gradient-to-b" />
                
                {/* Indicador de Categoría */}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                    {poi.category}
                  </Badge>
                </div>
              </div>

              {/* III. NARRATIVA Y TELEMETRÍA (CONTENIDO DERECHA) */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation2 size={12} className={cn("transition-colors", isResonating ? "text-primary animate-pulse" : "text-zinc-600")} />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                      {distance ? `${distance} metros de ti` : "Calculando proximidad..."}
                    </span>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {poi.name}
                  </h3>
                </div>

                {/* HECHO ATÓMICO (Dato de valor rápido) */}
                {poi.historical_fact && (
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed italic line-clamp-2">
                    "{poi.historical_fact}"
                  </p>
                )}

                {/* IV. ACCIÓN SOBERANA (BOTÓN SINTONIZAR) */}
                <div className="pt-2">
                  <Link href={`/map/poi/${poi.id}`}>
                    <Button 
                      className={cn(
                        auroraButtonClass,
                        "w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl group/btn"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Zap size={14} className={cn(isResonating && "fill-current")} />
                        {isResonating ? "SINTONIZAR AHORA" : "EXPLORAR DETALLE"}
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

            {/* BARRA DE ESTADO INFERIOR (RESURRECTED STYLE) */}
            <div className="h-1 w-full bg-white/5 relative overflow-hidden">
               {isResonating && (
                 <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
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
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. UX Adaptativa: El texto del botón cambia dinámicamente: si el usuario está 
 *    en el radio ('isResonating'), la llamada a la acción es urgente ('SINTONIZAR').
 * 2. Rendimiento (LCP): La imagen del POI utiliza 'getSafeAsset' para asegurar 
 *    que el navegador siempre tenga algo que pintar mientras descarga el activo real.
 * 3. Física de Inercia: El uso de 'AnimatePresence' y el tipo de transición 
 *    'spring' imitan el comportamiento de los sistemas operativos móviles de 
 *    alta gama, reforzando la percepción de calidad.
 */