// components/profile/profile-media-stage.tsx
// VERSIÓN: 1.0 (NicePod Profile Media Stage - Cinematic Revelation Standard)
// Misión: Renderizar la carátula del podcast con soporte para revelación en tiempo real.
// [ESTABILIZACIÓN]: Eliminación de saltos de diseño (CLS) y optimización de atmósfera Aurora.

"use client";

import { getSafeAsset } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import Image from "next/image";

/**
 * INTERFAZ: ProfileMediaStageProps
 * Define el contrato de entrada para la visualización del activo visual.
 */
interface ProfileMediaStageProps {
  imageUrl: string | null | undefined;
  imageReady: boolean; // Bandera de semáforo sincronizada vía Realtime
  title: string;
}

/**
 * ProfileMediaStage: El bastidor visual de alta fidelidad para el perfil del curador.
 */
export function ProfileMediaStage({
  imageUrl,
  imageReady,
  title
}: ProfileMediaStageProps) {

  // Determinamos el activo final con el fallback soberano de NicePod
  const finalSrc = imageUrl || getSafeAsset(null, 'cover');

  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-2xl border border-white/5 group">

      {/* 
          CONTENEDOR DE SOBERANÍA GEOMÉTRICA:
          Fijamos la proporción 16:9 para evitar que la página 'pestañee' 
          al recibir la imagen desde el Storage.
      */}
      <div className="aspect-video relative w-full overflow-hidden">

        <AnimatePresence mode="wait">
          {imageReady ? (
            /**
             * ESTADO: NOMINAL (Imagen Materializada)
             * Renderizado optimizado con fade-in cinemático.
             */
            <motion.div
              key="image-active"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={finalSrc}
                alt={`Forja Visual: ${title}`}
                fill
                priority
                className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-&lsqb;1000ms&rsqb; group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
              />

              {/* CAPA DE ATMÓSFERA: Gradiente Aurora para profundidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            </motion.div>
          ) : (
            /**
             * ESTADO: GÉNESIS (IA Procesando)
             * Feedback visual para mantener al usuario inmerso durante la forja.
             */
            <motion.div
              key="image-forging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-zinc-950/40 backdrop-blur-md"
            >
              <div className="relative">
                {/* Resplandor pulsante de Bóveda */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                <div className="relative z-10 p-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
                  <Sparkles className="h-8 w-8 text-primary/30 animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary/40" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/50">
                    Sintetizando Carátula
                  </span>
                </div>
                <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">
                  Neural Art Engine v3.0
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
            DECORACIÓN TÉCNICA:
            Borde de cristalismo interno visible solo en hover.
        */}
        <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 rounded-[2.5rem] transition-colors duration-700 pointer-events-none z-20" />

      </div>
    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente ha sido despojado de toda lógica de red. Al recibir 
 * 'imageReady' como booleano desde el orquestador, el renderizado es 
 * atómico. He utilizado 'priority' en el componente Image para forzar 
 * que sea el activo LCP, optimizando los Vitales Web del perfil.
 */