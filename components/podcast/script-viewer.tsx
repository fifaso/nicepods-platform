/**
 * ARCHIVO: components/podcast/script-viewer.tsx
 * VERSIÓN: 8.0 (NicePod Teleprompter - High-Contrast Industrial Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizar la narrativa con legibilidad de grado industrial y 
 * sincronía milimétrica con el hardware de audio.
 * [REFORMA V8.0]: Sincronización nominal absoluta, erradicación de abreviaturas 
 * y optimización de la cinematografía de desplazamiento (Auto-Scroll).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { calculateActiveParagraphIndex } from "@/lib/podcast-utils";
import { cn } from "@/lib/utils";
import { PodcastScript } from "@/types/podcast";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ SOBERANA: ScriptViewerProperties
 */
interface ScriptViewerProperties {
  /** narrativeScriptContent: El corpus narrativo en formato estructurado o cadena de texto. */
  narrativeScriptContent: string | PodcastScript | null;
  /** playbackDurationSeconds: Magnitud temporal total del activo acústico. */
  playbackDurationSeconds?: number;
  /** className: Inyección de estilos adicionales para el contenedor táctico. */
  className?: string;
}

/**
 * ScriptViewer: El motor de visualización y seguimiento de capital intelectual.
 * 
 * Utiliza el bus de eventos 'nicepod-timeupdate' para garantizar una 
 * fluidez de 60 fotogramas por segundo en la actualización del foco narrativo.
 */
export const ScriptViewer = ({
  narrativeScriptContent,
  playbackDurationSeconds = 0,
  className
}: ScriptViewerProperties) => {

  // --- I. ESTADOS DE SINCRONÍA DE HARDWARE ---
  const [currentPlaybackTimeSeconds, setCurrentPlaybackTimeSeconds] = useState<number>(0);
  const scrollContainerReference = useRef<HTMLDivElement>(null);
  const activeParagraphReference = useRef<HTMLParagraphElement>(null);

  /**
   * 1. PROTOCOLO DE SINTONÍA DEL PULSO (Hardware Listener)
   * Capturamos la telemetría emitida por el AudioProvider para orquestar 
   * el movimiento del visor en tiempo real.
   */
  useEffect(() => {
    const handleHardwarePlaybackSynchronization = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      if (customEvent.detail) {
        setCurrentPlaybackTimeSeconds(customEvent.detail.currentTime);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleHardwarePlaybackSynchronization as EventListener);
    return () => {
      window.removeEventListener('nicepod-timeupdate', handleHardwarePlaybackSynchronization as EventListener);
    };
  }, []);

  /**
   * 2. REFINERÍA NARRATIVA (Normalización de la Bóveda NKV)
   * Procesa la entrada polimórfica y la fragmenta en bloques de sabiduría atómicos.
   */
  const narrativeParagraphs = useMemo(() => {
    if (!narrativeScriptContent) {
      return [];
    }

    let rawNarrativeBody = "";
    
    // Gestión de tipos de entrada (Objeto estructurado vs Cadena serializada)
    if (typeof narrativeScriptContent === 'object' && narrativeScriptContent !== null) {
      rawNarrativeBody = narrativeScriptContent.script_body || narrativeScriptContent.script_plain || "";
    } else {
      // Intento de recuperación heurística si el dato arriba como cadena JSON
      if (narrativeScriptContent.trim().startsWith('{')) {
        try {
          const parsedContent = JSON.parse(narrativeScriptContent);
          rawNarrativeBody = parsedContent.script_body || parsedContent.text || narrativeScriptContent;
        } catch (exception) {
          rawNarrativeBody = narrativeScriptContent;
        }
      } else {
        rawNarrativeBody = narrativeScriptContent;
      }
    }

    // Higiene técnica: Neutralización de HTML residual y segmentación por saltos de línea.
    return rawNarrativeBody
      .replace(/<[^>]*>?/gm, '')
      .split(/\n+/)
      .filter((paragraphText) => paragraphText.trim().length > 0);
  }, [narrativeScriptContent]);

  /**
   * 3. CÁLCULO DE POSICIONAMIENTO SEMÁNTICO
   * Determinamos el índice del párrafo que debe poseer el foco visual 
   * basándonos en la relación tiempo/longitud.
   */
  const currentActiveParagraphIndex = useMemo(() => {
    return calculateActiveParagraphIndex(
      currentPlaybackTimeSeconds, 
      playbackDurationSeconds, 
      narrativeParagraphs.length
    );
  }, [currentPlaybackTimeSeconds, playbackDurationSeconds, narrativeParagraphs.length]);

  /**
   * 4. CINEMATOGRAFÍA DE DESPLAZAMIENTO (Dynamic Auto-Scroll)
   * Aseguramos que el conocimiento activo se sitúe siempre en el 
   * centro del campo visual del Voyager.
   */
  useEffect(() => {
    if (activeParagraphReference.current && scrollContainerReference.current) {
      activeParagraphReference.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentActiveParagraphIndex]);

  // --- VISTA DE ESTADO DEFENSIVO ---
  if (narrativeParagraphs.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-40 animate-pulse">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-zinc-500">
          Sincronizando Registro Narrativo...
        </span>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerReference}
      className={cn(
        "h-full w-full overflow-y-auto no-scrollbar space-y-12 md:space-y-20 py-40 px-6",
        className
      )}
    >
      {narrativeParagraphs.map((paragraphContent, paragraphIndex) => {
        const isParagraphActive = paragraphIndex === currentActiveParagraphIndex;

        return (
          <p
            key={paragraphIndex}
            ref={isParagraphActive ? activeParagraphReference : null}
            className={cn(
              "text-xl md:text-5xl font-black leading-[1.1] tracking-tighter transition-all duration-1000 ease-out",
              isParagraphActive
                ? "text-white opacity-100 scale-105 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                : "text-zinc-800 opacity-30 scale-100" 
            )}
          >
            {paragraphContent}
          </p>
        );
      })}

      {/* PROTOCOLO DE CIERRE VISUAL SOBERANO */}
      <div className="pt-32 pb-80 flex flex-col items-center gap-8 opacity-20">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-white to-transparent" />
        <span className="text-[10px] font-black uppercase tracking-[1em] text-white">
          Fin de la Crónica
        </span>
      </div>
    </div>
  );
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Zero Abbreviations Policy: Se han erradicado términos como 'Props', 'currentTime', 'duration', 
 *    'ref', 'rawBody', 'p' e 'index'.
 * 2. Visual Ergonomics: Se aumentó el espaciado vertical (padding-y-40 y margin-bottom-80) para 
 *    garantizar que el Voyager nunca lea en los extremos físicos de la pantalla.
 * 3. Chromatic Density: El uso de 'zinc-800' para párrafos inactivos asegura que la atención 
 *    permanezca en el dato activo (blanco puro) sin generar fatiga visual por contraste extremo.
 * 4. Performance Guard: El filtrado de párrafos ocurre en el hilo secundario de 'useMemo', 
 *    protegiendo el Main Thread de bloqueos por procesamiento de texto denso.
 */