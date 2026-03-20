// components/podcast/script-viewer.tsx
// VERSIÓN: 7.0 (NicePod Teleprompter - High-Contrast Precision Edition)
// Misión: Renderizar la narrativa con legibilidad industrial y sincronía de hardware.
// [ESTABILIZACIÓN]: Erradicación de ceguera de contraste y tipado estricto (Zero-Any).

"use client";

import { calculateActiveParagraphIndex } from "@/lib/podcast-utils";
import { cn } from "@/lib/utils";
import { PodcastScript } from "@/types/podcast";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ: ScriptViewerProps
 * @param scriptText Objeto estructurado del guion o texto plano.
 * @param duration Duración total del audio en segundos.
 */
interface ScriptViewerProps {
  scriptText: string | PodcastScript | null;
  duration?: number;
  className?: string;
}

/**
 * ScriptViewer: El motor de visualización narrativa.
 * Utiliza el bus de eventos 'nicepod-timeupdate' para una sincronía de 60fps 
 * sin penalizar el rendimiento de React.
 */
export const ScriptViewer = ({
  scriptText,
  duration = 0,
  className
}: ScriptViewerProps) => {

  // --- I. ESTADOS DE SINCRONÍA DE HARDWARE ---
  const [currentTime, setCurrentTime] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeParagraphRef = useRef<HTMLParagraphElement>(null);

  /**
   * 1. SINTONÍA DEL PULSO GLOBAL
   * Capturamos la telemetría del AudioProvider para el movimiento del Teleprompter.
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
   * 2. REFINERÍA NARRATIVA (NORMALIZACIÓN)
   * Procesa el JSONB de la Bóveda NKV y lo transmuta en párrafos atómicos.
   */
  const paragraphs = useMemo(() => {
    if (!scriptText) return [];

    let rawBody = "";
    
    // Gestión polimórfica de la entrada (Objeto vs String)
    if (typeof scriptText === 'object' && scriptText !== null) {
      rawBody = scriptText.script_body || scriptText.script_plain || "";
    } else {
      // Intento de recuperación si el dato llega como JSON stringificado
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

    // Higiene final: Purga de etiquetas residuales y segmentación por bloques.
    return rawBody
      .replace(/<[^>]*>?/gm, '')
      .split(/\n+/)
      .filter(p => p.trim().length > 0);
  }, [scriptText]);

  /**
   * 3. CÁLCULO DE POSICIONAMIENTO SEMÁNTICO
   * Determinamos el foco basándonos en la telemetría actual.
   */
  const activeIndex = useMemo(() => {
    return calculateActiveParagraphIndex(currentTime, duration, paragraphs.length);
  }, [currentTime, duration, paragraphs.length]);

  /**
   * 4. CINEMATOGRAFÍA DE DESPLAZAMIENTO (AUTO-SCROLL)
   * Aseguramos que el Voyager siempre tenga el conocimiento en el centro visual.
   */
  useEffect(() => {
    if (activeParagraphRef.current && scrollContainerRef.current) {
      activeParagraphRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  // --- VISTA DEFENSIVA ---
  if (paragraphs.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-40 animate-pulse">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] italic">
          Sincronizando Registro Narrativo...
        </span>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        "h-full w-full overflow-y-auto no-scrollbar space-y-12 md:space-y-20 py-32 px-4",
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
              "text-xl md:text-4xl font-bold leading-[1.2] tracking-tighter transition-all duration-700 ease-out",
              isActive
                ? "text-white opacity-100 scale-105 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                : "text-zinc-700 opacity-40 scale-100" // [MEJORA]: Zinc-700 garantiza legibilidad mínima vs white/20
            )}
          >
            {text}
          </p>
        );
      })}

      {/* PROTOCOLO DE CIERRE VISUAL */}
      <div className="pt-24 pb-60 flex flex-col items-center gap-6 opacity-10">
        <div className="h-[1px] w-24 bg-white" />
        <span className="text-[10px] font-black uppercase tracking-[0.8em]">Fin de la Crónica</span>
      </div>
    </div>
  );
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Resolución de Contraste: Se eliminó 'blur' y se cambió 'white/20' por 'zinc-700'. 
 *    Esto permite que el ojo mantenga la referencia de los párrafos siguientes 
 *    sin perder el foco en el actual.
 * 2. Build Shield: Se eliminó el tipo 'any' de la interfaz de props. El componente 
 *    ahora solo acepta contratos nominales de 'PodcastScript'.
 * 3. Ergonomía de Lectura: Se aumentaron los 'gaps' entre párrafos (space-y-12/20) 
 *    para dar aire al capital intelectual y evitar la saturación visual en móviles.
 */