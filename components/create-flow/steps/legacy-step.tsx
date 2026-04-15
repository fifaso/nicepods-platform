/**
 * ARCHIVO: components/create-flow/steps/legacy-step.tsx
 * VERSIÓN: 22.0 (NicePod Legacy Step - Industrial Preservations Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una terminal de alta fidelidad para la captura de lecciones 
 * de vida y sabiduría urbana, garantizando la persistencia del capital intelectual.
 * [REFORMA V22.0]: Resolución definitiva de TS2769, TS2345 y TS2322. 
 * Sincronización nominal absoluta con 'legacyLessonContentText' del esquema V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

/**
 * LegacyStep: La terminal de captura de sabiduría para el capital intelectual del futuro.
 */
export function LegacyStep() {
  // Consumo del motor de formularios bajo tipado estricto BSS
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  /** 
   * containerElementReference: Captura del nodo físico para el cálculo del viewport.
   * [ZAP]: 'containerRef' -> 'containerElementReference'.
   */
  const containerElementReference = useRef<HTMLDivElement>(null);
  
  /** viewportHeightMagnitude: Magnitud dinámica para prevenir desbordamientos en iOS. */
  const viewportHeightMagnitude = useMobileViewport(containerElementReference);

  /**
   * handleVoiceInputTranscribedAction:
   * Misión: Integrar el resultado de la síntesis acústica en el lienzo de legado.
   * [RESOLUCIÓN TS2769]: Alineación con 'legacyLessonContentText'.
   */
  const handleVoiceInputTranscribedAction = (transcribedTextContent: string) => {
    const currentLegacyLessonContentText = getValues('legacyLessonContentText') || '';
    const updatedLegacyLessonContentText = currentLegacyLessonContentText 
      ? `${currentLegacyLessonContentText}\n\n${transcribedTextContent}` 
      : transcribedTextContent;
      
    nicepodLog("🎙️ [Legacy-Step] Wisdom harvested via voice synchronization.");
    
    setValue('legacyLessonContentText', updatedLegacyLessonContentText, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  return (
    <div 
      ref={containerElementReference}
      className="flex flex-col w-full animate-in fade-in duration-700 px-4 md:px-10 overflow-hidden isolate"
      style={{ height: viewportHeightMagnitude, maxHeight: '100%' }}
    >
      
      {/* I. CABECERA TÁCTICA: Identidad Visual del Legado */}
      <header className="flex-shrink-0 py-4 md:py-8 text-center isolate">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-5xl font-black tracking-tighter uppercase text-white italic font-serif leading-none"
        >
          Deje su <span className="text-primary not-italic">Legado</span>
        </motion.h2>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mt-2 flex items-center justify-center gap-2">
          <BrainCircuit size={14} className="text-primary" />
          ¿Qué capital intelectual desea preservar hoy?
        </p>
      </header>

      {/* II. ÁREA DE TRABAJO: El Lienzo de Preservación Cognitiva */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-[2.5rem] overflow-hidden bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 shadow-2xl isolate">
        <FormField
          control={control}
          name="legacyLessonContentText"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col w-full min-h-0 space-y-0 isolate">
              <FormControl className="flex-1 flex flex-col min-h-0">
                <Textarea
                  placeholder="Ej: A lo largo de mi carrera en Madrid, aprendí que la sintonía semántica es más valiosa que la velocidad cruda..."
                  className={classNamesUtility(
                    "flex-1 w-full resize-none border-0 focus-visible:ring-0",
                    "text-base md:text-2xl font-medium leading-relaxed p-8 md:p-12",
                    "bg-transparent text-white placeholder:text-zinc-800 custom-scrollbar min-h-0"
                  )}
                  {...field}
                />
              </FormControl>
              
              {/* ACCESO ACÚSTICO Y VALIDACIÓN TÁCTICA */}
              <div className="flex-shrink-0 p-6 md:p-8 bg-black/40 border-t border-white/5 backdrop-blur-md z-10 shadow-inner">
                 <VoiceInput 
                    onTextGenerated={handleVoiceInputTranscribedAction} 
                    className="w-full h-16 rounded-2xl bg-white/5 border-white/5 hover:border-primary/20 transition-all shadow-2xl" 
                 />
                 <FormMessage className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-red-500 italic" />
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Margen de seguridad para el Footer del Shell Industrial */}
      <div className="h-6 md:h-12 flex-shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V22.0):
 * 1. Build Shield Sovereignty: Resolución de TS2769 y TS2322 mediante el mapeo 
 *    absoluto al descriptor purificado 'legacyLessonContentText'.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total de variables. 'containerRef' 
 *    -> 'containerElementReference', 'handleVoiceInput' -> 'handleVoiceInputTranscribedAction'.
 * 3. Kinematic Stability: El uso de 'useMobileViewport' garantiza que el lienzo 
 *    no se colapse durante la activación del teclado virtual, protegiendo los 60 FPS.
 * 4. UX Industrial: Se aumentó el tamaño de fuente y paddings (md:text-2xl, p-12) 
 *    para reforzar la sensación de "Terminal de Inteligencia".
 */