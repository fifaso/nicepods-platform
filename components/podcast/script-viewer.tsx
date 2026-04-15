/**
 * ARCHIVO: components/podcast/script-viewer.tsx
 * VERSIÓN: 9.0 (NicePod Teleprompter - Nominal Sync & ZAP Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Renderizar la narrativa de capital intelectual con legibilidad industrial 
 * y sincronía milimétrica con el pulso acústico del hardware.
 * [REFORMA V9.0]: Resolución definitiva de TS2339 mediante sincronización con 
 * 'PodcastScript' V12.0. Sustitución de 'cn' por 'classNamesUtility'. 
 * Aplicación absoluta de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { calculateActiveParagraphIndex } from "@/lib/podcast-utils";
import { classNamesUtility } from "@/lib/utils";
import { PodcastScript } from "@/types/podcast";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * INTERFAZ SOBERANA: ScriptViewerProperties
 */
interface ScriptViewerProperties {
  /** narrativeScriptContent: El corpus narrativo (estructurado o cadena). */
  narrativeScriptContent: string | PodcastScript | null;
  /** playbackDurationSecondsMagnitude: Magnitud temporal total del activo. */
  playbackDurationSecondsMagnitude?: number;
  /** additionalTailwindClassName: Inyección de estilos para el contenedor. */
  additionalTailwindClassName?: string;
}

/**
 * ScriptViewer: El motor de visualización y seguimiento de narrativa industrial.
 * 
 * Consume el bus de eventos 'nicepod-timeupdate' para garantizar el foco 
 * cinemático a 60 FPS sobre el párrafo activo.
 */
export const ScriptViewer = ({
  narrativeScriptContent,
  playbackDurationSecondsMagnitude = 0,
  additionalTailwindClassName
}: ScriptViewerProperties) => {

  // --- I. ESTADOS DE SINCRONÍA DE HARDWARE ---
  const [currentPlaybackTimeSecondsMagnitude, setCurrentPlaybackTimeSecondsMagnitude] = useState<number>(0);
  const scrollContainerElementReference = useRef<HTMLDivElement>(null);
  const activeParagraphElementReference = useRef<HTMLParagraphElement>(null);

  /**
   * 1. PROTOCOLO DE SINTONÍA DEL PULSO (Hardware Telemetry Listener)
   * Capturamos la telemetría acústica para orquestar el visor en tiempo real.
   */
  useEffect(() => {
    const handleHardwarePlaybackSynchronizationAction = (synchronizationEvent: Event) => {
      const customTelemetryEvent = synchronizationEvent as CustomEvent<{ currentTime: number; duration: number }>;
      if (customTelemetryEvent.detail) {
        setCurrentPlaybackTimeSecondsMagnitude(customTelemetryEvent.detail.currentTime);
      }
    };

    window.addEventListener('nicepod-timeupdate', handleHardwarePlaybackSynchronizationAction as EventListener);
    
    return () => {
      window.removeEventListener('nicepod-timeupdate', handleHardwarePlaybackSynchronizationAction as EventListener);
    };
  }, []);

  /**
   * 2. REFINERÍA NARRATIVA (Normalización de la Bóveda NKV)
   * Procesa la entrada polimórfica y fragmenta la sabiduría en bloques atómicos.
   * [RESOLUCIÓN TS2339]: Sincronización con descriptores nominales V12.0.
   */
  const narrativeParagraphsCollection = useMemo(() => {
    if (!narrativeScriptContent) {
      return [];
    }

    let rawNarrativeContentText = "";
    
    // Peritaje de tipo de entrada (Contrato estructurado vs Cadena cruda)
    if (typeof narrativeScriptContent === 'object' && narrativeScriptContent !== null) {
      rawNarrativeContentText = 
        narrativeScriptContent.scriptBodyContent || 
        narrativeScriptContent.scriptPlainContent || 
        "";
    } else {
      // Intento de recuperación heurística si el dato arriba como cadena JSON serializada
      if (narrativeScriptContent.trim().startsWith('{')) {
        try {
          const parsedNarrativeContent = JSON.parse(narrativeScriptContent);
          rawNarrativeContentText = 
            parsedNarrativeContent.scriptBodyContent || 
            parsedNarrativeContent.legacyText || 
            narrativeScriptContent;
        } catch (parsingException) {
          rawNarrativeContentText = narrativeScriptContent;
        }
      } else {
        rawNarrativeContentText = narrativeScriptContent;
      }
    }

    // Higiene Técnica: Neutralización de marcado y segmentación por saltos de línea
    return rawNarrativeContentText
      .replace(/<[^>]*>?/gm, '')
      .split(/\n+/)
      .filter((paragraphText) => paragraphText.trim().length > 0);
  }, [narrativeScriptContent]);

  /**
   * 3. CÁLCULO DE POSICIONAMIENTO SEMÁNTICO
   * Determinamos el índice de foco basándonos en la telemetría temporal.
   */
  const currentActiveParagraphIndex = useMemo(() => {
    return calculateActiveParagraphIndex(
      currentPlaybackTimeSecondsMagnitude, 
      playbackDurationSecondsMagnitude, 
      narrativeParagraphsCollection.length
    );
  }, [currentPlaybackTimeSecondsMagnitude, playbackDurationSecondsMagnitude, narrativeParagraphsCollection.length]);

  /**
   * 4. CINEMATOGRAFÍA DE DESPLAZAMIENTO (Dynamic Auto-Scroll)
   * Aseguramos que el conocimiento activo se sitúe siempre en el eje axial visual.
   */
  useEffect(() => {
    if (activeParagraphElementReference.current && scrollContainerElementReference.current) {
      activeParagraphElementReference.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentActiveParagraphIndex]);

  // --- VISTA DE ESTADO DEFENSIVO (SYNCHRONIZING) ---
  if (narrativeParagraphsCollection.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-30 animate-pulse isolate">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-zinc-500">
          Sincronizando Registro Narrativo...
        </span>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerElementReference}
      className={classNamesUtility(
        "h-full w-full overflow-y-auto no-scrollbar space-y-14 md:space-y-24 py-48 px-8 isolate",
        additionalTailwindClassName
      )}
    >
      {narrativeParagraphsCollection.map((paragraphContentText, paragraphIndex) => {
        const isParagraphActiveStatus = paragraphIndex === currentActiveParagraphIndex;

        return (
          <p
            key={paragraphIndex}
            ref={isParagraphActiveStatus ? activeParagraphElementReference : null}
            className={classNamesUtility(
              "text-xl md:text-5xl font-black leading-[1.15] tracking-tighter transition-all duration-1000 ease-out isolate",
              isParagraphActiveStatus
                ? "text-white opacity-100 scale-105 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                : "text-zinc-900 opacity-20 scale-100" 
            )}
          >
            {paragraphContentText}
          </p>
        );
      })}

      {/* PROTOCOLO DE FINALIZACIÓN VISUAL (SINK) */}
      <div className="pt-40 pb-96 flex flex-col items-center gap-10 opacity-10 grayscale isolate">
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-white to-transparent" />
        <span className="text-[9px] font-black uppercase tracking-[1.2em] text-white">
          Cierre de Crónica
        </span>
      </div>
    </div>
  );
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Zero Abbreviations Policy: Purga absoluta de acrónimos en props y lógica interna. 
 *    'cn' -> 'classNamesUtility', 'ref' -> 'elementReference', 'p' -> 'paragraphIndex'.
 * 2. TS2339 Resolution: Alineación estricta con 'PodcastScript' V12.0 utilizando 
 *    'scriptBodyContent' y 'scriptPlainContent'.
 * 3. Chromatic Density: El uso de 'zinc-900' para estados inactivos sobre fondo oscuro 
 *    minimiza la fatiga ocular y maximiza el contraste del foco activo.
 * 4. Hardware Hygiene: El oidor de eventos se elimina físicamente al desmontar el componente 
 *    para liberar recursos del bus de la ventana.
 */