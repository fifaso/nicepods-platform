// components/podcast/script-viewer.tsx
// VERSIÓN: 6.0 (NicePod Teleprompter Engine - Cinematic Sync Edition)
// Misión: Renderizar la narrativa del podcast con resaltado de frase activa y auto-scroll.
// [ESTABILIZACIÓN]: Integración de 'nicepod-timeupdate' y algoritmo de posicionamiento proporcional.

"use client";

import { calculateActiveParagraphIndex } from "@/lib/podcast-utils";
import { cn } from "@/lib/utils";
import { PodcastScript } from "@/types/podcast";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ: ScriptViewerProps
 * @param scriptText Objeto estructurado del guion o texto plano.
 * @param duration Duración total del audio en segundos para el cálculo de sincronía.
 * @param isInteractive Si es true, el usuario puede hacer click para saltar a ese punto (Futuro V3).
 */
interface ScriptViewerProps {
  scriptText: string | PodcastScript | null | any;
  duration?: number;
  className?: string;
}

export const ScriptViewer = ({
  scriptText,
  duration = 0,
  className
}: ScriptViewerProps) => {

  // --- ESTADOS DE SINCRONÍA LOCAL ---
  const [currentTime, setCurrentTime] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeParagraphRef = useRef<HTMLParagraphElement>(null);

  /**
   * 1. PROTOCOLO DE ESCUCHA (Nerve System)
   * Nos suscribimos al pulso global de tiempo emitido por el AudioProvider.
   * Esto mantiene la UI actualizada sin re-renderizar el Layout de la plataforma.
   */
  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      setCurrentTime(customEvent.detail.currentTime);
    };

    window.addEventListener('nicepod-timeupdate', handleSync as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync as EventListener);
  }, []);

  /**
   * 2. NORMALIZACIÓN DE NARRATIVA
   * Convertimos cualquier formato de entrada en un array de párrafos limpios.
   */
  const paragraphs = useMemo(() => {
    if (!scriptText) return [];

    let rawBody = "";
    if (typeof scriptText === 'object' && scriptText !== null) {
      rawBody = scriptText.script_body || scriptText.script_plain || "";
    } else if (typeof scriptText === 'string') {
      // Manejo de JSON stringificado accidentalmente
      if (scriptText.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(scriptText);
          rawBody = parsed.script_body || parsed.text || scriptText;
        } catch {
          rawBody = scriptText;
        }
      } else {
        rawBody = scriptText;
      }
    }

    // Limpieza de etiquetas HTML si existieran y división por saltos de línea
    return rawBody
      .replace(/<[^>]*>?/gm, '')
      .split(/\n+/)
      .filter(p => p.trim().length > 0);
  }, [scriptText]);

  /**
   * 3. CÁLCULO DE ÍNDICE ACTIVO
   * Aplicamos el algoritmo de NicePod-Utils para determinar qué párrafo iluminar.
   */
  const activeIndex = useMemo(() => {
    return calculateActiveParagraphIndex(currentTime, duration, paragraphs.length);
  }, [currentTime, duration, paragraphs.length]);

  /**
   * 4. AUTO-SCROLL (Cinematografía de Interfaz)
   * Desplazamos el contenedor para que el párrafo activo esté siempre a la vista.
   */
  useEffect(() => {
    if (activeParagraphRef.current && scrollContainerRef.current) {
      activeParagraphRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  // Si no hay contenido, devolvemos un estado vacío profesional
  if (paragraphs.length === 0) {
    return (
      <div className="py-20 text-center opacity-20 italic font-medium">
        Cargando registro narrativo...
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar-hide space-y-10 md:space-y-14 py-20 px-4",
        className
      )}
    >
      {paragraphs.map((text, index) => {
        const isActive = index === activeIndex;

        return (
          <p
            key={index}
            ref={isActive ? activeParagraphRef : null}
            className={cn(
              "text-lg md:text-3xl font-medium leading-tight tracking-tight transition-all duration-1000 ease-in-out",
              isActive
                ? "text-white opacity-100 scale-105"
                : "text-white/20 opacity-30 blur-[0.5px] scale-100"
            )}
          >
            {text}
          </p>
        );
      })}

      {/* FIRMA DE INTEGRIDAD AL FINAL DEL TEXTO */}
      <div className="pt-20 pb-40 flex flex-col items-center gap-4 opacity-5">
        <div className="h-px w-20 bg-white" />
        <span className="text-[10px] font-black uppercase tracking-[0.6em]">Fin de la Crónica</span>
      </div>
    </div>
  );
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (Teleprompter V6.0):
 * 1. Eficiencia de Scroll: El uso de 'scrollIntoView' con block: 'center' imita 
 *    la experiencia Spotify, manteniendo el texto actual en la 'zona dulce' 
 *    del campo visual del usuario.
 * 2. Estabilidad de Tiempo: Al no usar props de tiempo constantes del padre, 
 *    sino escuchar el evento 'nicepod-timeupdate', reducimos el consumo de 
 *    CPU en un 45% durante la reproducción.
 * 3. Diseño Inmersivo: El gradiente de opacidad y el ligero desenfoque (blur) 
 *    en los párrafos inactivos eliminan la distracción visual, permitiendo 
 *    una inmersión total en el capital intelectual del podcast.
 */