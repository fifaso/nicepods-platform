/**
 * ARCHIVO: components/create-flow/steps/question-step.tsx
 * VERSIÓN: 22.0 (NicePod Question Step - Industrial Query Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una terminal de alta fidelidad para formular preguntas directas 
 * al Oráculo de Inteligencia, garantizando la captura precisa de la duda técnica.
 * [REFORMA V22.0]: Resolución definitiva de TS2769 y TS2820. Sincronización nominal 
 * absoluta con 'questionToAnswerText' del esquema V12.0. Aplicación integral 
 * de la Zero Abbreviations Policy (ZAP) y Build Shield Sovereignty.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { motion } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";

/**
 * QuestionStep: La terminal de captura de interrogantes para la forja de conocimiento.
 */
export function QuestionStep() {
  // Consumo del motor de formularios bajo el tipado estricto BSS
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  /** 
   * containerElementReference: Captura del nodo físico para el cálculo dinámico del viewport.
   * [ZAP]: Purga de 'containerRef'.
   */
  const containerElementReference = useRef<HTMLDivElement>(null);
  
  /** viewportHeightMagnitude: Magnitud para mitigar el desplazamiento por teclado en móviles. */
  const viewportHeightMagnitude = useMobileViewport(containerElementReference);

  /**
   * handleAcousticVoiceTranscriptionAction:
   * Misión: Integrar el resultado de la transcripción en el campo de pregunta.
   * [RESOLUCIÓN TS2769]: Sincronización con 'questionToAnswerText'.
   */
  const handleAcousticVoiceTranscriptionAction = (transcribedTextContent: string) => {
    const currentQuestionContentText = getValues('questionToAnswerText') || '';
    const updatedQuestionContentText = currentQuestionContentText 
      ? `${currentQuestionContentText} ${transcribedTextContent}` 
      : transcribedTextContent;
      
    nicepodLog("🎙️ [Question-Step] Query enhanced via acoustic synchronization.");
    
    setValue('questionToAnswerText', updatedQuestionContentText, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  return (
    <div 
      ref={containerElementReference}
      className="flex flex-col h-full w-full animate-in fade-in duration-700 px-4 md:px-10 overflow-hidden isolate"
      style={{ height: viewportHeightMagnitude, maxHeight: '100%' }}
    >
      
      {/* I. CABECERA TÁCTICA: Identidad Visual de la Consulta */}
      <header className="flex-shrink-0 py-6 md:py-10 text-center isolate">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
        >
          <HelpCircle size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Modo Consulta IA</span>
        </motion.div>
        
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white italic font-serif leading-none">
          Formule su <span className="text-primary not-italic">Pregunta</span>
        </h2>
        <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-3 max-w-sm mx-auto">
            El Oráculo procesará su duda mediante peritaje técnico de alta densidad.
        </p>
      </header>

      {/* II. ÁREA DE TRABAJO: El Lienzo de Interrogación */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-[3rem] overflow-hidden bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 shadow-2xl isolate">
        <FormField
          control={control}
          /** [RESOLUCIÓN TS2820]: Alineación con el descriptor industrial V12.0 */
          name="questionToAnswerText"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col w-full min-h-0 space-y-0 isolate">
              <FormControl className="flex-1 flex flex-col min-h-0">
                <div className="relative flex-1 flex flex-col min-h-0">
                  {/* Marca de agua decorativa */}
                  <Sparkles className="absolute top-10 right-10 text-white/[0.02] h-32 w-32 pointer-events-none" />
                  
                  <Textarea
                    placeholder="Ej: ¿Cuáles son las implicaciones éticas de la superinteligencia artificial en el marco regulatorio europeo?..."
                    className={classNamesUtility(
                      "flex-1 w-full resize-none border-0 focus-visible:ring-0",
                      "text-lg md:text-2xl font-medium leading-relaxed p-8 md:p-12",
                      "bg-transparent text-white placeholder:text-zinc-800 custom-scrollbar min-h-0"
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              
              {/* ACCESO ACÚSTICO Y VALIDACIÓN SOBERANA */}
              <div className="flex-shrink-0 p-6 md:p-10 bg-black/40 border-t border-white/5 backdrop-blur-md z-10 shadow-inner">
                 <div className="max-w-2xl mx-auto space-y-4">
                    <VoiceInput 
                        onTextGeneratedAction={handleAcousticVoiceTranscriptionAction}
                        className="w-full h-16 rounded-2xl bg-white/5 border-white/5 hover:border-primary/20 transition-all shadow-2xl" 
                    />
                    <FormMessage className="text-center text-[10px] font-black uppercase tracking-widest text-red-500 italic" />
                 </div>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Margen de seguridad para el Chasis de la Workstation */}
      <div className="h-8 md:h-16 flex-shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V22.0):
 * 1. Build Shield Sovereignty: Resolución de TS2769 y TS2820 mediante el mapeo 
 *    pericial al descriptor purificado 'questionToAnswerText'.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total. 'containerRef' -> 
 *    'containerElementReference', 'viewportHeight' -> 'viewportHeightMagnitude'.
 * 3. Kinematic Optimization: Uso de 'classNamesUtility' y 'useMobileViewport' para 
 *    garantizar que la terminal sea estable en todas las resoluciones de pantalla.
 * 4. UX Industrial: Se aumentó la escala tipográfica (md:text-2xl) para facilitar 
 *    la revisión de interrogantes complejos antes de la forja.
 */