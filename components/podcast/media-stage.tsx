// components/podcast/media-stage.tsx
// VERSIÓN: 1.0 (NicePod Visual Stage - Progressive Revelation Standard)
// Misión: Renderizar la carátula del podcast con integridad estructural y estética Aurora.
// [ESTABILIZACIÓN]: Eliminación de Layout Shift mediante reserva de espacio y transiciones de GPU.

"use client";

import { getSafeAsset } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";

/**
 * INTERFAZ: MediaStageProps
 * Recibe el estado del inventario visual gestionado por el orquestador.
 */
interface MediaStageProps {
  imageUrl: string | null | undefined;
  imageReady: boolean;
  title: string;
  isConstructing: boolean; // Estado de Fase IV de producción
}

/**
 * MediaStage: El bastidor visual de alta fidelidad.
 */
export function MediaStage({
  imageUrl,
  imageReady,
  title,
  isConstructing
}: MediaStageProps) {

  // Determinamos la fuente final del activo con fallback soberano
  const finalSrc = imageUrl || getSafeAsset(null, 'cover');

  return (
    <section className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl group">

      {/* 
          CONTENEDOR DE RELACIÓN DE ASPECTO (Soberanía Geométrica)
          Bloqueamos el espacio a 16:9 (aspect-video) para evitar que el contenido de 
          abajo salte cuando la imagen termine de cargar.
      */}
      <div className="aspect-video relative w-full overflow-hidden">

        <AnimatePresence mode="wait">
          {imageReady ? (
            /**
             * ESTADO: ACTIVO (Imagen Materializada)
             */
            <motion.div
              key="image-ready"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={finalSrc}
                alt={`Carátula de NicePod: ${title}`}
                fill
                priority
                className="object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              />

              {/* Overlay de Atmósfera: Gradiente de contraste para legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            </motion.div>
          ) : (
            /**
             * ESTADO: FORJA (IA Generando Arte)
             */
            <motion.div
              key="image-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-zinc-950/40 backdrop-blur-sm"
            >
              {/* Elemento Decorativo Pulsante */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                <div className="relative z-10 p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-inner">
                  <Sparkles className="h-10 w-10 text-primary/40 animate-pulse" />
                </div>
              </div>

              {/* Texto de Estado de Misión */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-3 w-3 animate-spin text-primary/60" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                    Sintetizando Visión
                  </span>
                </div>
                {isConstructing && (
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    Google Imagen 3.0 Neural Core
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
            DETALLES TÉCNICOS DE INTERFAZ 
            Icono flotante de tipo de contenido 
        */}
        <div className="absolute top-6 right-6 z-20">
          <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <ImageIcon className="h-4 w-4 text-white/60" />
          </div>
        </div>

      </div>

      {/* 
          BORDE DINÁMICO (Aurora Glow)
          Se ilumina sutilmente al pasar el ratón para indicar interactividad.
      */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 rounded-[2rem] md:rounded-[2.5rem] transition-colors duration-700 pointer-events-none z-30" />

    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente utiliza la técnica de 'Aspect Ratio Box'. Al fijar la altura 
 * proporcional al ancho (16:9), garantizamos que el navegador sepa cuánto 
 * espacio ocupa el MediaStage incluso antes de que la imagen binaria se descargue. 
 * Esto erradica los saltos de layout que frustran al usuario durante la carga 
 * del Pod #179.
 */