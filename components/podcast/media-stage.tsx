// components/podcast/media-stage.tsx
// VERSIÓN: 2.0 (NicePod Visual Stage - Robust Revelation Edition)
// Misión: Renderizar la carátula con resiliencia contra URLs nulas y estados de forja incompletos.
// [ESTABILIZACIÓN]: Implementación de lógica de fallback triple para evitar errores 400 y layout shifts.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { getSafeAsset } from "@/lib/utils";

/**
 * INTERFAZ: MediaStageProps
 */
interface MediaStageProps {
  imageUrl: string | null | undefined;
  imageReady: boolean;
  title: string;
  isConstructing: boolean; // Estado del orquestador de forja
}

/**
 * MediaStage: Bastidor visual de alta fidelidad.
 * Audita y normaliza los activos visuales antes de su renderizado en pantalla.
 */
export function MediaStage({
  imageUrl,
  imageReady,
  title,
  isConstructing
}: MediaStageProps) {

  /**
   * [SANEAMIENTO ESTRATÉGICO]:
   * getSafeAsset actúa como el filtro final contra URLs vacías.
   * Si la imagen no está lista (imageReady=false) o la URL es inválida, 
   * el componente muestra el estado de síntesis en lugar de intentar cargar un asset roto.
   */
  const finalSrc = useMemo(() => getSafeAsset(imageUrl, 'cover'), [imageUrl]);

  return (
    <section className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl group transition-all duration-500">

      {/* CONTENEDOR DE RELACIÓN DE ASPECTO 16:9 (Zero Layout Shift) */}
      <div className="aspect-video relative w-full overflow-hidden bg-black/20">

        <AnimatePresence mode="wait">
          {imageReady && imageUrl ? (
            /* --- ESTADO: IMAGEN MATERIALIZADA --- */
            <motion.div
              key="image-ready"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={finalSrc}
                alt={`Carátula de NicePod: ${title}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            </motion.div>
          ) : (
            /* --- ESTADO: FORJA (IA GENERANDO) --- */
            <motion.div
              key="image-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-zinc-950/80 backdrop-blur-md z-20"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                <div className="relative z-10 p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-inner">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-3 w-3 animate-spin text-primary/60" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                    {isConstructing ? "Sintetizando Visión" : "Verificando Activo"}
                  </span>
                </div>
                {isConstructing && (
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest animate-pulse">
                    Google Imagen 3.0 Neural Core
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD TÉCNICO FLOTANTE */}
        <div className="absolute top-6 right-6 z-30">
          <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 transition-opacity duration-500">
            <ImageIcon className="h-4 w-4 text-white/60" />
          </div>
        </div>

      </div>

      {/* BORDE AURORA */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 rounded-[2rem] md:rounded-[2.5rem] transition-colors duration-700 pointer-events-none z-30" />

    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0 - Stabilized):
 * 1. Sanitización de URL: La lógica de 'finalSrc' ahora es reactiva (useMemo) y utiliza 
 *    el helper 'getSafeAsset', eliminando la propagación de errores 400 en la consola.
 * 2. Estabilidad de Renderizado: Se ha movido la condición de renderizado a 'imageReady && imageUrl', 
 *    asegurando que si la DB envía un estado 'true' pero una URL nula, el componente 
 *    muestre el estado de forja en lugar de romperse.
 * 3. Optimización de Capas: El overlay de degradado asegura que si la carátula tiene 
 *    colores brillantes, el título del podcast mantenga una legibilidad industrial.
 */