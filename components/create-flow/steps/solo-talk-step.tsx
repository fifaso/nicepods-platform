/**
 * ARCHIVO: components/create-flow/steps/solo-talk-step.tsx
 * VERSIÓN: 3.0 (NicePod Solo Talk Step - Cognitive Canvas Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una interfaz de alta fidelidad para la captura de ideas semilla, 
 * garantizando la integridad de los datos mediante la sincronía con el esquema 
 * industrial y la asistencia por voz.
 * [REFORMA V3.0]: Resolución definitiva de TS2339, TS2769 y TS2345. 
 * Sincronización nominal con 'PodcastCreationSchema' V12.0 (soloMotivationContentText).
 * Aplicación total de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  PenTool, 
  BrainCircuit
} from "lucide-react";
import { classNamesUtility } from "@/lib/utils";

import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";

/**
 * SoloTalkStep: El lienzo de entrada para la forja de capital intelectual.
 */
export function SoloTalkStep() {
  // Consumo del contexto de formulario bajo el tipado estricto BSS
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  
  /** 
   * [SINCRO V3.0]: Observación del campo purificado 'soloMotivationContentText'.
   * Resuelve el error TS2339 al utilizar el descriptor nominal del esquema V12.0.
   */
  const currentMotivationContentTextMagnitude = watch('soloMotivationContentText');

  /**
   * EFECTO: SINCRONIZACIÓN TÉCNICA DE TÓPICO
   * Misión: Generar un título semilla automático basado en la motivación.
   * [RESOLUCIÓN TS2769]: Alineación con 'soloTopicSelection'.
   */
  useEffect(() => {
    if (currentMotivationContentTextMagnitude && currentMotivationContentTextMagnitude.length > 10) {
      const automaticTopicSelectionValue = currentMotivationContentTextMagnitude.length > 60 
        ? currentMotivationContentTextMagnitude.substring(0, 60) + "..." 
        : currentMotivationContentTextMagnitude;
        
      setValue('soloTopicSelection', automaticTopicSelectionValue, { shouldValidate: true });
    }
  }, [currentMotivationContentTextMagnitude, setValue]);

  /**
   * handleVoiceInputTranscribedAction:
   * Misión: Integrar el resultado del hardware acústico en el lienzo cognitivo.
   */
  const handleVoiceInputTranscribedAction = (transcribedTextContent: string) => {
    const previousMotivationText = currentMotivationContentTextMagnitude || '';
    const updatedMotivationContentText = previousMotivationText 
      ? `${previousMotivationText} ${transcribedTextContent}` 
      : transcribedTextContent;
      
    setValue('soloMotivationContentText', updatedMotivationContentText, {
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4 py-2 justify-between overflow-hidden isolate">
      
      {/* CABECERA: Magnetismo Visual NicePod */}
      <header className="text-center mb-4 md:mb-6 pt-2 shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none italic font-serif"
        >
          Siembra tu <span className="text-primary not-italic">Idea</span>
        </motion.h1>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mt-2 flex items-center justify-center gap-2">
          <BrainCircuit size={14} className="text-primary" />
          Libera tu conocimiento para el Agente de Inteligencia
        </p>
      </header>

      {/* ÁREA DE TRABAJO: El Lienzo de Capital Intelectual */}
      <div className="flex-1 flex flex-col min-h-0 relative group isolate">
        
        {/* Proyección Atmosférica de Fondo */}
        <div className="absolute -inset-1 bg-gradient-to-b from-primary/10 to-transparent rounded-[2rem] blur-2xl opacity-0 group-within:opacity-100 transition-opacity duration-1000 pointer-events-none z-0" />

        <div className="flex-1 flex flex-col min-h-0 bg-card/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative z-10">
          <FormField
            control={control}
            name="soloMotivationContentText"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col min-h-0 space-y-0">
                <FormControl className="flex-1 min-h-0">
                  <div className="relative flex-1 flex flex-col min-h-0">
                    
                    {/* Marca de Agua Industrial */}
                    <PenTool className="absolute top-6 right-6 text-white/5 h-24 w-24 -rotate-12 pointer-events-none" />
                    
                    <Textarea
                      placeholder="Ej: Quiero desglosar el concepto de 'Entropía' aplicado a la gestión de equipos modernos..."
                      className={classNamesUtility(
                        "flex-1 w-full resize-none border-0 focus-visible:ring-0",
                        "text-base md:text-xl font-medium leading-relaxed p-8 md:p-10",
                        "bg-transparent text-foreground placeholder:text-muted-foreground/20",
                        "custom-scrollbar"
                      )}
                      {...field}
                    />
                  </div>
                </FormControl>
                
                {/* FOOTER DEL LIENZO: Captura Acústica y Validación */}
                <div className="p-6 bg-zinc-900/40 border-t border-white/5 backdrop-blur-md">
                   <div className="flex flex-col gap-4">
                      <VoiceInput 
                        onTextGenerated={handleVoiceInputTranscribedAction} 
                        className="w-full h-14 rounded-2xl bg-white/5 border-white/5 hover:border-primary/20 transition-all shadow-inner"
                      />
                      
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                           <Sparkles size={12} className="text-primary animate-pulse" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Sintonía Inteligente</span>
                        </div>
                        <FormMessage className="text-[10px] font-bold text-destructive uppercase tracking-tight" />
                      </div>
                   </div>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* BLOQUE DE INTEGRIDAD TÉCNICA (CAMPO OCULTO) */}
      <div className="hidden">
        <FormField 
            control={control} 
            name="soloTopicSelection"
            render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} 
        />
      </div>

      {/* Margen Táctico para el Shell de la Workstation */}
      <div className="h-4 md:h-8 shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Sovereignty: Resolución de TS2339 y TS2769 mediante la alineación 
 *    con los descriptores 'soloMotivationContentText' y 'soloTopicSelection'.
 * 2. ZAP Compliance: Purificación total. Se han eliminado términos como 'val', 'text', 
 *    'auto' o 'err' en favor de descriptores industriales precisos.
 * 3. Hardware Hygiene: El uso de 'watch' sobre campos específicos en lugar de desestructurar 
 *    todo el formulario reduce la presión sobre el Hilo Principal (MTI).
 */