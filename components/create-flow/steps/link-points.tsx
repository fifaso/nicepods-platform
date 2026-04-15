/**
 * ARCHIVO: components/create-flow/steps/link-points.tsx
 * VERSIÓN: 3.0 (NicePod Link Points - Dual Synthesis Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una interfaz dinámica para la conexión de tesis distantes, 
 * garantizando el espacio de escritura mediante un sistema de acordeón reactivo 
 * y sincronía absoluta con el esquema industrial.
 * [REFORMA V3.0]: Resolución definitiva de TS2769, TS2345 y TS2322. 
 * Sincronización nominal con 'linkTopicPrimary' y 'linkTopicSecondary'. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; 
import { Link2, ChevronDown } from "lucide-react";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { VoiceInput } from "@/components/ui/voice-input";
import { classNamesUtility, nicepodLog } from "@/lib/utils";

/**
 * LinkPointsStep: El reactor de conexión dual para el capital intelectual.
 */
export function LinkPointsStep() {
  // Consumo del motor de formularios bajo el contrato purificado V12.0
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  /**
   * activeFieldIdentification: Controla qué terminal de entrada está expandida.
   * Valores: 'PRIMARY' (Concepto A) | 'SECONDARY' (Concepto B).
   */
  const [activeFieldIdentification, setActiveFieldIdentification] = useState<'PRIMARY' | 'SECONDARY'>('PRIMARY');

  /**
   * handleAcousticInputPrimaryAction:
   * Misión: Integrar transcripción en el eje temático primario.
   * [RESOLUCIÓN TS2769]: Alineación con 'linkTopicPrimary'.
   */
  const handleAcousticInputPrimaryAction = (transcribedTextContent: string) => {
    const currentContentText = getValues('linkTopicPrimary') || '';
    const updatedContentText = currentContentText 
      ? `${currentContentText} ${transcribedTextContent}` 
      : transcribedTextContent;
      
    setValue('linkTopicPrimary', updatedContentText, { shouldValidate: true });
    nicepodLog("🎙️ [Link-Points] Eje Primario actualizado mediante voz.");
  };

  /**
   * handleAcousticInputSecondaryAction:
   * Misión: Integrar transcripción en el eje temático secundario.
   * [RESOLUCIÓN TS2769]: Alineación con 'linkTopicSecondary'.
   */
  const handleAcousticInputSecondaryAction = (transcribedTextContent: string) => {
    const currentContentText = getValues('linkTopicSecondary') || '';
    const updatedContentText = currentContentText 
      ? `${currentContentText} ${transcribedTextContent}` 
      : transcribedTextContent;
      
    setValue('linkTopicSecondary', updatedContentText, { shouldValidate: true });
    nicepodLog("🎙️ [Link-Points] Eje Secundario actualizado mediante voz.");
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-700 px-2 md:px-6 pb-2 isolate">
      
      {/* CABECERA TÁCTICA: Identidad Visual de Conexión */}
      <div className="flex-shrink-0 py-2 text-center mb-4">
        <div className="inline-flex items-center justify-center mb-2">
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
                <Link2 className="h-5 w-5 text-blue-400" />
            </div>
        </div>
        <h2 className="text-xl font-black tracking-tighter uppercase text-white italic font-serif">
          Une tus <span className="text-primary not-italic">Ideas</span>
        </h2>
        <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">
          La Inteligencia Artificial encontrará la conexión oculta
        </p>
      </div>

      {/* ÁREA DE TRABAJO DINÁMICA (Estructura de Foco Axial) */}
      <div className="flex-grow flex flex-col gap-4 min-h-0 overflow-hidden isolate">
        
        {/* === TERMINAL PRIMARIA (CONCEPTO A) === */}
        <div 
            onClick={() => setActiveFieldIdentification('PRIMARY')}
            className={classNamesUtility(
                "flex flex-col relative rounded-2xl overflow-hidden border transition-all duration-700 ease-in-out isolate",
                activeFieldIdentification === 'PRIMARY' 
                    ? "flex-grow bg-white/5 border-primary/30 shadow-2xl scale-[1.01]" 
                    : "h-20 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] cursor-pointer opacity-60"
            )}
        >
            <FormField
            control={control}
            name="linkTopicPrimary"
            render={({ field }) => (
                <FormItem className="flex-1 flex flex-col h-full space-y-0 isolate">
                    {/* Barra de Título de Terminal (Estado Persistente) */}
                    <div className="flex items-center justify-between px-5 py-3 bg-black/20 backdrop-blur-sm">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                            Eje Temático Primario
                        </span>
                        {activeFieldIdentification !== 'PRIMARY' && (
                          <ChevronDown className="h-4 w-4 text-primary animate-pulse" />
                        )}
                    </div>

                    <FormControl className="flex-1">
                        <Textarea
                        placeholder="Ej: La filosofía del tiempo en la antigua Grecia..."
                        onFocus={() => setActiveFieldIdentification('PRIMARY')}
                        className={classNamesUtility(
                            "flex-1 w-full resize-none border-0 focus-visible:ring-0 bg-transparent text-white placeholder:text-white/10 transition-all",
                            activeFieldIdentification === 'PRIMARY' 
                              ? "text-lg p-6 leading-relaxed custom-scrollbar" 
                              : "text-sm p-3 overflow-hidden"
                        )}
                        {...field}
                        />
                    </FormControl>
                    
                    {/* Acceso Acústico (Solo en Modo Foco) */}
                    <div className={classNamesUtility(
                        "flex-shrink-0 p-4 bg-black/40 border-t border-white/5 transition-all duration-500 overflow-hidden",
                        activeFieldIdentification === 'PRIMARY' ? "max-h-24 opacity-100" : "max-h-0 opacity-0 p-0 border-0"
                    )}>
                        <VoiceInput 
                          onTextGenerated={handleAcousticInputPrimaryAction} 
                          className="w-full h-12 bg-white/5 border-white/5" 
                        />
                    </div>
                </FormItem>
            )}
            />
        </div>

        {/* === TERMINAL SECUNDARIA (CONCEPTO B) === */}
        <div 
            onClick={() => setActiveFieldIdentification('SECONDARY')}
            className={classNamesUtility(
                "flex flex-col relative rounded-2xl overflow-hidden border transition-all duration-700 ease-in-out isolate",
                activeFieldIdentification === 'SECONDARY' 
                    ? "flex-grow bg-white/5 border-primary/30 shadow-2xl scale-[1.01]" 
                    : "h-20 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] cursor-pointer opacity-60"
            )}
        >
            <FormField
            control={control}
            name="linkTopicSecondary"
            render={({ field }) => (
                <FormItem className="flex-1 flex flex-col h-full space-y-0 isolate">
                    <div className="flex items-center justify-between px-5 py-3 bg-black/20 backdrop-blur-sm">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                            Eje Temático Secundario
                        </span>
                        {activeFieldIdentification !== 'SECONDARY' && (
                          <ChevronDown className="h-4 w-4 text-primary animate-pulse" />
                        )}
                    </div>

                    <FormControl className="flex-1">
                        <Textarea
                        placeholder="Ej: El desarrollo de algoritmos de inteligencia artificial..."
                        onFocus={() => setActiveFieldIdentification('SECONDARY')}
                        className={classNamesUtility(
                            "flex-1 w-full resize-none border-0 focus-visible:ring-0 bg-transparent text-white placeholder:text-white/10 transition-all",
                            activeFieldIdentification === 'SECONDARY' 
                              ? "text-lg p-6 leading-relaxed custom-scrollbar" 
                              : "text-sm p-3 overflow-hidden"
                        )}
                        {...field}
                        />
                    </FormControl>
                    
                    <div className={classNamesUtility(
                        "flex-shrink-0 p-4 bg-black/40 border-t border-white/5 transition-all duration-500 overflow-hidden",
                        activeFieldIdentification === 'SECONDARY' ? "max-h-24 opacity-100" : "max-h-0 opacity-0 p-0 border-0"
                    )}>
                        <VoiceInput 
                          onTextGenerated={handleAcousticInputSecondaryAction} 
                          className="w-full h-12 bg-white/5 border-white/5" 
                        />
                    </div>
                </FormItem>
            )}
            />
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Sovereignty: Resolución de errores TS2769 y TS2345 mediante 
 *    la sincronización con 'linkTopicPrimary' y 'linkTopicSecondary' del esquema V12.0.
 * 2. Zero Abbreviations Policy: Purga total de descriptores locales (val -> content, 
 *    text -> transcribedTextContent, newVal -> updatedContentText).
 * 3. Kinematic Stability: El uso de 'classNamesUtility' y transiciones de 700ms 
 *    aseguran que el cambio de foco no degrade la fluidez del Hilo Principal.
 */