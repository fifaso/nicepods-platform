/**
 * ARCHIVO: components/create-flow/steps/narrative-selection-step.tsx
 * VERSIÓN: 8.0 (NicePod Narrative Engine - Industrial Contract Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una interfaz de alta resolución para la selección de la tesis 
 * narrativa y el matiz vocal, garantizando la integridad de la intención creativa.
 * [REFORMA V8.0]: Resolución definitiva de TS2305, TS2820 y TS2322. 
 * Sincronización nominal absoluta con 'NarrativeOption' de shared/types.ts y 
 * descriptores purificados del 'PodcastCreationSchema' V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { BarChart3, BookOpen, Lightbulb, Music, Sparkles } from "lucide-react";

// --- INFRAESTRUCTURA DE COMPONENTES UI SOBERANOS ---
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { classNamesUtility } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { NarrativeOption } from "../shared/types";

/**
 * INTERFAZ: NarrativeSelectionStepProperties
 */
interface NarrativeSelectionStepProperties {
  /** narrativeOptionsCollection: Conjunto de trayectorias destiladas por el Oráculo. */
  narrativeOptionsCollection: NarrativeOption[];
}

/**
 * VOCAL_TONE_OPTIONS_COLLECTION: 
 * Definición de matices interpretativos para la síntesis neuronal.
 */
const VOCAL_TONE_OPTIONS_COLLECTION = [
  { 
    valueIdentification: "Educativo", 
    displayLabel: "Educativo", 
    descriptionContentText: "Enfoque claro, didáctico y estructurado.", 
    iconComponent: BookOpen 
  },
  { 
    valueIdentification: "Inspirador", 
    displayLabel: "Inspirador", 
    descriptionContentText: "Tono motivacional, fluido y edificante.", 
    iconComponent: Lightbulb 
  },
  { 
    valueIdentification: "Analítico", 
    displayLabel: "Analítico", 
    descriptionContentText: "Visión profunda con rigor técnico.", 
    iconComponent: BarChart3 
  },
] as const;

/**
 * NarrativeSelectionStep: La terminal de decisión para la arquitectura de la crónica.
 */
export function NarrativeSelectionStep({ 
  narrativeOptionsCollection 
}: NarrativeSelectionStepProperties) {
  
  // Consumo del motor de formularios bajo el tipado estricto BSS
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-4xl mx-auto px-4 pb-24 isolate">

      {/* --- SECCIÓN I: SELECCIÓN DE TESIS NARRATIVA IA --- */}
      <div className="space-y-10 isolate">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={14} className="animate-pulse" /> Sincronía con el Oráculo
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white italic font-serif leading-none">
            Rutas de <span className="text-primary not-italic">Conocimiento</span>
          </h2>
          <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
            La inteligencia ha destilado estas tesis para su misión. Seleccione el eje axial de su crónica.
          </p>
        </header>

        <FormField
          control={control}
          /** [RESOLUCIÓN TS2820]: Sincronización con el descriptor purificado V12.0 */
          name="linkSelectedNarrativeOption"
          render={({ field }) => (
            <FormItem className="space-y-0 isolate">
              <FormControl>
                <RadioGroup
                  onValueChange={(selectedTitleValue) => {
                    /**
                     * [BSS]: Mapeador de Objeto Completo.
                     * Recuperamos la tesis íntegra basada en el identificador visual.
                     */
                    const selectedNarrativeDossier = narrativeOptionsCollection.find(
                        (optionItem) => optionItem.title === selectedTitleValue
                    );
                    field.onChange(selectedNarrativeDossier || null);
                  }}
                  value={field.value?.title || ""}
                  className="grid grid-cols-1 gap-5"
                >
                  {narrativeOptionsCollection.map((narrativeOptionItem) => (
                    <FormItem key={narrativeOptionItem.title} className="space-y-0">
                      <FormControl>
                        <RadioGroupItem value={narrativeOptionItem.title} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={classNamesUtility(
                          "relative flex flex-col p-8 md:p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] isolate shadow-2xl",
                          field.value?.title === narrativeOptionItem.title
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-white/5 bg-[#0a0a0a]/60 hover:border-white/10 hover:bg-white/[0.02]"
                        )}
                      >
                        <span className="font-black text-white uppercase tracking-tight text-2xl md:text-3xl leading-none italic font-serif">
                          {narrativeOptionItem.title}
                        </span>
                        <p className="text-sm md:text-base text-zinc-400 mt-4 leading-relaxed font-medium">
                          {narrativeOptionItem.narrativeThesisStatement}
                        </p>
                        
                        {/* Indicador de Activación Axial */}
                        {field.value?.title === narrativeOptionItem.title && (
                          <div className="absolute top-8 right-10 w-3 h-3 rounded-full bg-primary animate-ping" />
                        )}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center mt-6 text-[10px] font-black uppercase text-destructive tracking-widest" />
            </FormItem>
          )}
        />
      </div>

      {/* --- SECCIÓN II: CALIBRACIÓN DEL MATIZ VOCAL --- */}
      <div className="space-y-10 pt-8 border-t border-white/5 isolate">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
            <Music size={14} /> Frecuencia Interpretativa
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white italic font-serif leading-none">
            Matiz de <span className="text-primary not-italic">Voz</span>
          </h2>
        </header>

        <FormField
          control={control}
          /** [RESOLUCIÓN TS2322]: Sincronización con 'selectedToneIdentifier' V12.0 */
          name="selectedToneIdentifier"
          render={({ field }) => (
            <FormItem className="space-y-0 isolate">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                  {VOCAL_TONE_OPTIONS_COLLECTION.map((toneOptionItem) => {
                    const ToneIconComponent = toneOptionItem.iconComponent;
                    const isSelectedStatus = field.value === toneOptionItem.valueIdentification;

                    return (
                      <FormItem key={toneOptionItem.valueIdentification} className="space-y-0">
                        <FormControl>
                          <RadioGroupItem value={toneOptionItem.valueIdentification} className="sr-only" />
                        </FormControl>
                        <FormLabel
                          className={classNamesUtility(
                            "flex flex-col items-center justify-center p-8 md:p-12 rounded-[3rem] border-2 cursor-pointer transition-all duration-700 isolate shadow-xl",
                            isSelectedStatus
                              ? "border-primary bg-primary/10 shadow-primary/10 scale-[1.02]"
                              : "border-white/5 bg-[#0a0a0a]/40 hover:border-white/10"
                          )}
                        >
                          <div className={classNamesUtility(
                            "p-5 rounded-2xl mb-6 transition-all duration-700 shadow-inner",
                            isSelectedStatus 
                              ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" 
                              : "bg-white/[0.02] text-zinc-800"
                          )}>
                            <ToneIconComponent size={36} />
                          </div>
                          <span className="font-black text-white uppercase tracking-widest text-xs">
                            {toneOptionItem.displayLabel}
                          </span>
                          <p className="text-[10px] text-zinc-500 text-center mt-4 font-bold uppercase tracking-widest opacity-50 leading-snug">
                            {toneOptionItem.descriptionContentText}
                          </p>
                        </FormLabel>
                      </FormItem>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center mt-6 text-[10px] font-black uppercase text-destructive tracking-widest" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Build Shield Final Restoration: Resolución definitiva de TS2305, TS2820 y TS2322 
 *    mediante la sintonía absoluta con el esquema industrial V12.0.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total. 'opt' -> 'optionItem', 
 *    'desc' -> 'descriptionContentText', 'props' -> 'Properties'.
 * 3. Contract Safety: El uso de 'linkSelectedNarrativeOption' asegura que el objeto 
 *    narrativo sea transportado íntegramente hacia el motor de síntesis del Oráculo.
 * 4. UX Kinematics: Se han optimizado las curvas de easing y los radios de borde (3rem) 
 *    para reforzar la ergonomía de la terminal NicePod en pantallas táctiles.
 */